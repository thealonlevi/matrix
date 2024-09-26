import React, { useState, useEffect } from 'react';
import { fetchAllStaff } from '../../utils/api'; // Import necessary API function
import { useNotification } from './utils/Notification'; // Notification hook
import './styles/ManageStaff.css'; // Import relevant styles
import { FiEdit } from 'react-icons/fi'; // Import the edit icon from react-icons

const ManageStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showNotification } = useNotification(); // Notification hook

  // Fetch staff data on component mount
  useEffect(() => {
    const loadStaffData = async () => {
      try {
        const staffList = await fetchAllStaff();
        // Map the data to the correct format
        const formattedStaffList = staffList.map(staffMember => ({
          email: staffMember.email,
          createdAt: new Date(staffMember.created_at).toLocaleString(),  // Convert to a readable date
          creditLimit: staffMember.credit_limit,  // Convert to number
          issuedCreditsTotal: staffMember.issued_credits_total,  // Convert to number
          lastLogin: new Date(staffMember.last_login).toLocaleString(),  // Convert to a readable date
          permissions: Array.isArray(staffMember.permissions) ? staffMember.permissions.join(', ') : staffMember.permissions,  // Ensure it's an array and join it
          role: staffMember.role,
          userId: staffMember.user_id
        }));
        
        setStaff(formattedStaffList);
      } catch (err) {
        console.error('Failed to load staff data:', err);
        setError('Failed to load staff data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadStaffData();
  }, []);

  // Handle the edit click
  const handleEditClick = (userId) => {
    showNotification(`Edit functionality for user ${userId} is under construction.`, 'info');
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
                  onClick={() => handleEditClick(staffMember.userId)}
                >
                  <FiEdit className="manage-staff-edit-icon" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageStaff;
