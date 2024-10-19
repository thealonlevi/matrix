import React, { useState, useEffect } from 'react';
import { fetchLogTables } from '../../utils/api';
import './styles/Logs.css'; // Updated CSS file

const Logs = () => {
  const [selectedTable, setSelectedTable] = useState('');
  const [logData, setLogData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLogDetails, setSelectedLogDetails] = useState(null); 
  const [selectedStaff, setSelectedStaff] = useState(null);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(); 
  };

  const handleTableSelection = async (event) => {
    const tableName = event.target.value;
    setSelectedTable(tableName);
    setSelectedLogDetails(null);

    if (tableName) {
      setLoading(true);
      try {
        const logs = await fetchLogTables(tableName);
        let sortedLogs = logs.records || [];

        sortedLogs.sort((a, b) => {
          const dateA = new Date(a.timestamp || a.logged_at);
          const dateB = new Date(b.timestamp || b.logged_at);
          return dateB - dateA;
        });

        setLogData(sortedLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setLogData([]);
    }
  };

  const handleLogClick = (log) => {
    setSelectedLogDetails(log);
  };

  const handleCloseModal = () => {
    setSelectedLogDetails(null);
  };

  const handleStaffClick = (staffEmail) => {
    let staffLogs = logData.find(log => log.email === staffEmail)?.logs || [];
    staffLogs = staffLogs.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB - dateA;
    });

    setSelectedStaff({
      email: staffEmail,
      logs: staffLogs
    });
  };

  return (
    <div className="body-logs-unique">
      <h1>System Logs</h1>
      <p>Here you can view the logs of various activities.</p>

      <select onChange={handleTableSelection} value={selectedTable} className="select-logs-unique">
        <option value="">Select a Log Table</option>
        <option value="matrix_credit_logs">Credit Logs</option>
        <option value="matrix_replacementslog">Replacement Logs</option>
        <option value="matrix_stockexportlog">Stock Export Logs</option>
        <option value="matrix_stafflogs">Staff Logs</option>
      </select>

      {loading && <p>Loading logs...</p>}

      {!loading && logData.length > 0 && selectedTable !== 'matrix_stafflogs' ? (
        <div className="table-container-logs-unique">
          <table className="table-logs-unique">
            <thead>
              <tr>
                {selectedTable === 'matrix_credit_logs' ? (
                  <>
                    <th className="th-logs-unique">LOGGED_AT</th>
                    <th className="th-logs-unique">CREDIT_AMOUNT</th>
                    <th className="th-logs-unique">STAFF_EMAIL</th>
                    <th className="th-logs-unique">USER_EMAIL</th>
                    <th className="th-logs-unique">TRANSACTION_ID</th>
                  </>
                ) : selectedTable === 'matrix_replacementslog' ? (
                  <>
                    <th className="th-logs-unique">TIMESTAMP</th>
                    <th className="th-logs-unique">PRODUCT_ID</th>
                    <th className="th-logs-unique">QTY</th>
                    <th className="th-logs-unique">STAFF_EMAIL</th>
                    <th className="th-logs-unique">USER_EMAIL</th>
                    <th className="th-logs-unique">RESULT</th>
                  </>
                ) : selectedTable === 'matrix_stockexportlog' ? (
                  <>
                    <th className="th-logs-unique">TIMESTAMP</th>
                    <th className="th-logs-unique">PRODUCTS</th>
                    <th className="th-logs-unique">QTY</th>
                    <th className="th-logs-unique">CUSTOMER_EMAIL</th>
                    <th className="th-logs-unique">OPERATOR_EMAIL</th>
                    <th className="th-logs-unique">NOTE</th>
                  </>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {logData.map((log, index) => (
                <tr key={index} onClick={() => handleLogClick(log)} className="tr-hover-logs-unique">
                  {selectedTable === 'matrix_credit_logs' ? (
                    <>
                      <td className="td-logs-unique td-logs-timestamp-unique">{formatTimestamp(log.logged_at) || 'N/A'}</td>
                      <td className="td-logs-unique">{log.credit_amount || 'N/A'}</td>
                      <td className="td-logs-unique">{log.staff_email || 'N/A'}</td>
                      <td className="td-logs-unique">{log.user_email || 'N/A'}</td>
                      <td className="td-logs-unique">{log.transaction_id || 'N/A'}</td>
                    </>
                  ) : selectedTable === 'matrix_replacementslog' ? (
                    <>
                      <td className="td-logs-unique">{formatTimestamp(log.timestamp) || 'N/A'}</td>
                      <td className="td-logs-unique">{log.product_id || 'N/A'}</td>
                      <td className="td-logs-unique">{log.quantity || 'N/A'}</td>
                      <td className="td-logs-unique">{log.staff_email || 'N/A'}</td>
                      <td className="td-logs-unique">{log.user_email || 'N/A'}</td>
                      <td className="td-logs-unique">{log.result || 'N/A'}</td>
                    </>
                  ) : selectedTable === 'matrix_stockexportlog' ? (
                    <>
                      <td className="td-logs-unique">{formatTimestamp(log.timestamp) || 'N/A'}</td>
                      <td className="td-logs-unique">{log.products ? log.products.join(', ') : 'N/A'}</td>
                      <td className="td-logs-unique">{log.quantities ? log.quantities.join(', ') : 'N/A'}</td>
                      <td className="td-logs-unique">{log.customer_email || 'N/A'}</td>
                      <td className="td-logs-unique">{log.operator_email || 'N/A'}</td>
                      <td className="td-logs-unique">{log.note || 'N/A'}</td>
                    </>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>

          {selectedLogDetails && (
            <div className="modal-unique">
              <div className="modal-content-unique">
                <span className="close-unique" onClick={handleCloseModal}>&times;</span>
                <h3>Log Details</h3>
                <pre>{JSON.stringify(selectedLogDetails, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      ) : (
        selectedTable === 'matrix_stafflogs' && (
          <div>
            <h2 className="staff-logs-h3-unique">Staff Logs</h2>
            <ul className="ul-logs-unique">
              {logData.map((staff, index) => (
                <li key={index} onClick={() => handleStaffClick(staff.email)} className="li-logs-unique">
                  {staff.email}
                </li>
              ))}
            </ul>
            {selectedStaff && (
              <div className="staff-logs-unique">
                <h3 className="staff-logs-h3-unique">Logs for {selectedStaff.email}</h3>
                <ul className="staff-logs-ul-unique">
                  {selectedStaff.logs.map((log, index) => (
                    <li key={index} className="staff-logs-li-unique">
                      <strong className="staff-logs-li-strong-unique">{log.action}:</strong> {log.action_value}
                      <br /><strong className="staff-logs-li-strong-unique">Client Email:</strong> {log.client_email || 'N/A'}
                      <br /><strong className="staff-logs-li-strong-unique">Order ID:</strong> {log.order_id || 'N/A'}
                      <br /><strong className="staff-logs-li-strong-unique">Ticket ID:</strong> {log.ticket_id || 'N/A'}
                      <em className="staff-logs-li-em-unique">{formatTimestamp(log.timestamp)}</em>
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
