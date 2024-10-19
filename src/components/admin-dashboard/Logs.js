import React, { useState, useEffect } from 'react';
import { fetchLogTables } from '../../utils/api';
import './styles/Logs.css'; // Import the CSS file

const Logs = () => {
  const [selectedTable, setSelectedTable] = useState('');
  const [logData, setLogData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Function to parse and format timestamp into a readable date
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(); // Convert to human-readable date and time
  };

  const handleTableSelection = async (event) => {
    const tableName = event.target.value;
    setSelectedTable(tableName);

    if (tableName) {
      setLoading(true);
      try {
        const logs = await fetchLogTables(tableName);
        console.log("Received Logs: ", logs);
        let sortedLogs = logs.records || [];

        // Sort logs by timestamp (or logged_at) from most recent to oldest
        sortedLogs.sort((a, b) => {
          const dateA = new Date(a.timestamp || a.logged_at);
          const dateB = new Date(b.timestamp || b.logged_at);
          return dateB - dateA; // Sort in descending order
        });

        setLogData(sortedLogs); // Set the sorted log data
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setLogData([]);
    }
  };

  // Handle staff log selection
  const handleStaffClick = (staffEmail) => {
    let staffLogs = logData.find(log => log.email === staffEmail)?.logs || [];
    
    // Sort the selected staff logs by timestamp (most recent to oldest)
    staffLogs = staffLogs.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB - dateA; // Sort in descending order
    });

    setSelectedStaff({
      email: staffEmail,
      logs: staffLogs
    });
  };

  return (
    <div>
      <h1>System Logs</h1>
      <p>Here you can view the logs of various activities.</p>

      {/* Dropdown to select log table */}
      <select onChange={handleTableSelection} value={selectedTable}>
        <option value="">Select a Log Table</option>
        <option value="matrix_credit_logs">Credit Logs</option>
        <option value="matrix_replacementslog">Replacement Logs</option>
        <option value="matrix_stockexportlog">Stock Export Logs</option>
        <option value="matrix_stafflogs">Staff Logs</option>
      </select>

      {/* Display loading state */}
      {loading && <p>Loading logs...</p>}

      {/* Display selected table log data */}
      {!loading && logData.length > 0 && selectedTable !== 'matrix_stafflogs' ? (
        <table>
          <thead>
            <tr>
              {/* Conditionally render columns based on selected table */}
              {selectedTable === 'matrix_credit_logs' ? (
                <>
                  <th>LOGGED_AT</th>
                  <th>CREDIT_AMOUNT</th>
                  <th>STAFF_EMAIL</th>
                  <th>USER_EMAIL</th>
                  <th>TRANSACTION_ID</th>
                </>
              ) : selectedTable === 'matrix_replacementslog' ? (
                <>
                  <th>TIMESTAMP</th>
                  <th>PRODUCT_ID</th>
                  <th>QTY</th>
                  <th>STAFF_EMAIL</th>
                  <th>USER_EMAIL</th>
                  <th>RESULT</th>
                </>
              ) : selectedTable === 'matrix_stockexportlog' ? (
                <>
                  <th>TIMESTAMP</th>
                  <th>PRODUCTS</th>
                  <th>QTY</th>
                  <th>CUSTOMER_EMAIL</th>
                  <th>OPERATOR_EMAIL</th>
                  <th>NOTE</th>
                </>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {logData.map((log, index) => (
              <tr key={index}>
                {/* Conditionally render rows based on selected table */}
                {selectedTable === 'matrix_credit_logs' ? (
                  <>
                    <td>{formatTimestamp(log.logged_at) || 'N/A'}</td>
                    <td>{log.credit_amount || 'N/A'}</td>
                    <td>{log.staff_email || 'N/A'}</td>
                    <td>{log.user_email || 'N/A'}</td>
                    <td>{log.transaction_id || 'N/A'}</td>
                  </>
                ) : selectedTable === 'matrix_replacementslog' ? (
                  <>
                    <td>{formatTimestamp(log.timestamp) || 'N/A'}</td>
                    <td>{log.product_id || 'N/A'}</td>
                    <td>{log.quantity || 'N/A'}</td>
                    <td>{log.staff_email || 'N/A'}</td>
                    <td>{log.user_email || 'N/A'}</td>
                    <td>{log.result || 'N/A'}</td>
                  </>
                ) : selectedTable === 'matrix_stockexportlog' ? (
                  <>
                    <td>{formatTimestamp(log.timestamp) || 'N/A'}</td>
                    <td>{log.products ? log.products.join(', ') : 'N/A'}</td>
                    <td>{log.quantities ? log.quantities.join(', ') : 'N/A'}</td>
                    <td>{log.customer_email || 'N/A'}</td>
                    <td>{log.operator_email || 'N/A'}</td>
                    <td>{log.note || 'N/A'}</td>
                  </>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        selectedTable === 'matrix_stafflogs' && (
          <div>
            <h2 className="staff-logs">Staff Logs</h2>
            {/* Display staff emails */}
            <ul className="logs-container">
              {logData.map((staff, index) => (
                <li key={index} onClick={() => handleStaffClick(staff.email)} style={{ cursor: 'pointer' }}>
                  {staff.email}
                </li>
              ))}
            </ul>
            {/* Display selected staff logs */}
            {selectedStaff && (
              <div className="staff-logs">
                <h3>Logs for {selectedStaff.email}</h3>
                <ul>
                  {selectedStaff.logs.map((log, index) => (
                    <li key={index}>
                      <strong>{log.action}:</strong> {log.action_value} 
                      <br /><strong>Client Email:</strong> {log.client_email || 'N/A'}
                      <br /><strong>Order ID:</strong> {log.order_id || 'N/A'}
                      <br /><strong>Ticket ID:</strong> {log.ticket_id || 'N/A'}
                      <em>{formatTimestamp(log.timestamp)}</em>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default Logs;
