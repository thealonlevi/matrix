import React, { useState, useEffect } from 'react';
import { fetchAllStaff, modifyStaff } from '../../utils/api'; // Import necessary API functions
import { useNotification } from './utils/Notification'; // Notification hook
import './styles/ManageStaff.css'; // Import relevant styles
import { FiEdit } from 'react-icons/fi'; // Import the edit icon from react-icons

const ManageStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStaffJSON, setSelectedStaffJSON] = useState(null); // For storing the raw JSON data
  const [modifiedJSON, setModifiedJSON] = useState(''); // For storing the modified JSON
  const { showNotification } = useNotification(); // Notification hook

  // Fetch staff data on component mount
  useEffect(() => {
    const loadStaffData = async () => {
      try {
        const staffList = await fetchAllStaff(); 
        console.log(staffList);

        const formattedStaffList = staffList.map(staffMember => ({
          raw: staffMember, // Store the unformatted JSON data
          email: staffMember.email,
          createdAt: new Date(staffMember.created_at).toLocaleString(),  // Convert to a readable date
          creditLimit: staffMember.credit_limit,
          issuedCreditsTotal: staffMember.issued_credits_total,
          lastLogin: new Date(staffMember.last_login).toLocaleString(), 
          permissions: Array.isArray(staffMember.permissions) ? staffMember.permissions.join(', ') : staffMember.permissions, 
          role: staffMember.role,
          userId: staffMember.user_id
        }));

        setStaff(formattedStaffList);
        console.log(formattedStaffList);
      } catch (err) {
        console.error('Failed to load staff data:', err);
        setError('Failed to load staff data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadStaffData();
  }, []);

  // Handle the edit click to show raw JSON data
  const handleEditClick = (staffJSON) => {
    setSelectedStaffJSON(staffJSON); // Set the selected staff's raw JSON data
    setModifiedJSON(JSON.stringify(staffJSON, null, 2)); // Pre-fill the text area with formatted JSON
  };

  // Close the JSON modal
  const handleCloseModal = () => {
    setSelectedStaffJSON(null); // Clear the selected JSON data
  };

  // Handle the save click to update staff data
  const handleSaveClick = async () => {
    try {
      const parsedJSON = JSON.parse(modifiedJSON); // Parse the modified JSON string
      await modifyStaff(parsedJSON); // Call modifyStaff API with the updated JSON
      showNotification('Staff information updated successfully.', 'success');
      setSelectedStaffJSON(null); // Close the modal after saving
    } catch (error) {
      console.error('Failed to update staff information:', error);
      showNotification('Failed to update staff information.', 'error');
    }
  };

  if (loading) {
    return <div className="manage-staff-container">Loading staff data...</div>;
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
            <th>Credit Limit</th>
            <th>Issued Credits</th>
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
              <td>{staffMember.creditLimit}</td>
              <td>{staffMember.issuedCreditsTotal}</td>
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
