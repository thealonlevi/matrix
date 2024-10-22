import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAllStaff, modifyStaff } from '../../utils/api'; // Import necessary API functions
import { useNotification } from './utils/Notification'; // Notification hook
import { checkAdminPermission } from './utils/checkAdminPermissions'; // Import admin permission check
import './styles/ManageStaff.css'; // Import relevant styles
import { FiEdit } from 'react-icons/fi'; // Import the edit icon from react-icons
import LoadingScreen from '../LoadingScreen'; // Import the LoadingScreen component
import { useNavigate } from 'react-router-dom'; // For redirection

const ManageStaff = () => {
  const [staff, setStaff] = useState([]); // Store staff list
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error state
  const [selectedStaffJSON, setSelectedStaffJSON] = useState(null); // For storing the raw JSON data of selected staff
  const [modifiedJSON, setModifiedJSON] = useState(''); // For storing the modified JSON for editing
  const { showNotification } = useNotification(); // Notification hook
  const navigate = useNavigate(); // For navigation

  const permissionChecked = useRef(false); // Ref to track permission check status

  // Fetch staff data and check admin permission on component mount
  useEffect(() => {
    const verifyAccessAndFetchStaff = async () => {
      if (permissionChecked.current) return; // Skip if permission already checked

      try {
        setLoading(true); // Start loading
        const hasPermission = await checkAdminPermission();
        permissionChecked.current = true; // Mark permission as checked

        if (!hasPermission) {
          setError('Page not found.');
          showNotification('Access denied. Redirecting...', 'error');
          setTimeout(() => {
            navigate('/'); // Redirect after delay
          }, 2000);
        } else {
          // Fetch staff data if permission is granted
          const staffList = await fetchAllStaff();

          // Format staff data for display
          const formattedStaffList = staffList.map(staffMember => ({
            raw: staffMember, // Store the unformatted JSON data
            email: staffMember.email,
            createdAt: new Date(staffMember.created_at).toLocaleString(),
            credits: `${staffMember.issued_credits_total} / ${staffMember.credit_limit}`, // Combine issued credits and credit limit
            replacements: `${staffMember.issued_replacements_total || 'N/A'} / ${staffMember.replacement_limit || 'N/A'}`, // Combine replacements issued and replacement limit
            lastLogin: new Date(staffMember.last_login).toLocaleString(),
            permissions: Array.isArray(staffMember.permissions) ? staffMember.permissions.join(', ') : staffMember.permissions,
            role: staffMember.role,
            userId: staffMember.user_id
          }));

          setStaff(formattedStaffList); // Set formatted staff list
        }
      } catch (err) {
        console.error('Failed to load staff data:', err);
        setError('Failed to load staff data. Please try again later.');
      } finally {
        setLoading(false); // Stop loading
      }
    };

    verifyAccessAndFetchStaff();
  }, [navigate, showNotification]);

  // Handle the edit click to show raw JSON data
  const handleEditClick = useCallback((staffJSON) => {
    setSelectedStaffJSON(staffJSON); // Set the selected staff's raw JSON data
    setModifiedJSON(JSON.stringify(staffJSON, null, 2)); // Pre-fill the text area with formatted JSON
  }, []);

  // Close the JSON modal
  const handleCloseModal = useCallback(() => {
    setSelectedStaffJSON(null); // Clear the selected JSON data
  }, []);

  // Handle the save click to update staff data
  const handleSaveClick = useCallback(async () => {
    try {
      const parsedJSON = JSON.parse(modifiedJSON); // Parse the modified JSON string
      await modifyStaff(parsedJSON); // Call modifyStaff API with the updated JSON
      showNotification('Staff information updated successfully.', 'success');

      setSelectedStaffJSON(null); // Close the modal after saving

      // Fetch and update staff data
      const updatedStaffList = await fetchAllStaff();
      setStaff(updatedStaffList.map(staffMember => ({
        raw: staffMember,
        email: staffMember.email,
        credits: `${staffMember.issued_credits_total} / ${staffMember.credit_limit}`, // Combine issued credits and credit limit
        replacements: `${staffMember.issued_replacements_total || 'N/A'} / ${staffMember.replacement_limit || 'N/A'}`, // Combine replacements issued and replacement limit
        lastLogin: new Date(staffMember.last_login).toLocaleString(),
        permissions: Array.isArray(staffMember.permissions) ? staffMember.permissions.join(', ') : staffMember.permissions,
        role: staffMember.role,
        userId: staffMember.user_id
      })));
    } catch (error) {
      console.error('Failed to update staff information:', error);
      showNotification('Failed to update staff information.', 'error');
    }
  }, [modifiedJSON, showNotification]);

  if (loading) {
    return (
      <div style={{ position: 'relative', height: '100vh' }}>
        <LoadingScreen message="Loading staff data..." size="large" />
      </div>
    );
  }

  if (error) {
    return <div className="manage-staff-container">{error}</div>;
  }

  return (
    <div className="manage-staff-container">
      <h1 className="manage-staff-title">Manage Staff</h1>
      <table className="staff-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Email</th>
            <th>Role</th>
            <th>Credits (Issued / Limit)</th> {/* Combined credits */}
            <th>Replacements (Issued / Limit)</th> {/* Combined replacements */}
            <th>Permissions</th>
            <th>Last Login</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((staffMember, index) => (
            <tr key={staffMember.userId}>
              <td>{index + 1}</td>
              <td>{staffMember.email}</td>
              <td>{staffMember.role}</td>
              <td>{staffMember.credits}</td> {/* Display combined credits */}
              <td>{staffMember.replacements}</td> {/* Display combined replacements */}
              <td>{staffMember.permissions}</td>
              <td>{staffMember.lastLogin}</td>
              <td>
                <button
                  className="manage-staff-edit-icon-button"
                  onClick={() => handleEditClick(staffMember.raw)}
                >
                  <FiEdit className="manage-staff-edit-icon" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedStaffJSON && (
        <div className="json-modal">
          <div className="json-modal-content">
            <h2>Edit Staff Information (Raw JSON)</h2>
            <textarea
              className="json-textarea"
              value={modifiedJSON}
              onChange={(e) => setModifiedJSON(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={handleSaveClick} className="json-modal-save-button">
                Save
              </button>
              <button onClick={handleCloseModal} className="json-modal-close-button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStaff;
