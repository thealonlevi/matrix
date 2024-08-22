import React, { useState, useEffect } from 'react';
import './styles/AdminOrders.css';
import { useNavigate } from 'react-router-dom';
import { checkPermissionAndFetchData, fetchData } from './utils/adminUtils';
import ReactPaginate from 'react-paginate';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [ordersPerPage, setOrdersPerPage] = useState(10); // Default is 10 orders per page
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      console.log("Starting fetchOrders function");

      const response = await fetchData(
        'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchOrders',
        {}
      );

      console.log("Data fetched from Matrix_FetchOrders API:", response);

      let data = typeof response === 'string' ? JSON.parse(response) : response;

      console.log("Parsed data:", data);

      if (Array.isArray(data) && data.length > 0) {
        console.log("Data is valid and has items");
        const sortedOrders = data.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
        console.log("Orders sorted successfully");
        setOrders(sortedOrders);
        updateOrderUserIdList(sortedOrders);
      } else {
        console.error("No valid data found. Setting orders to an empty array.");
        setOrders([]);
      }
    } catch (error) {
      console.error("Error in fetchOrders:", error);
      setError("Failed to fetch orders. Please check the console for details.");
    }
  };

  const updateOrderUserIdList = (orders) => {
    try {
      console.log("Starting updateOrderUserIdList function with orders:", orders);

      const storedOrderUserIdList = JSON.parse(localStorage.getItem('orderUserIdList')) || [];
      const newOrderUserIdList = orders.map(order => ({
        orderId: order.orderId,
        userId: order.userId,
      }));

      console.log("New order-user ID pairs generated:", newOrderUserIdList);

      const updatedList = [...storedOrderUserIdList];
      newOrderUserIdList.forEach(newPair => {
        if (!updatedList.find(pair => pair.orderId === newPair.orderId && pair.userId === newPair.userId)) {
          updatedList.push(newPair);
        }
      });

      console.log("Updated orderUserIdList:", updatedList);
      localStorage.setItem('orderUserIdList', JSON.stringify(updatedList));
    } catch (error) {
      console.error('Error updating orderUserIdList in localStorage:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        console.log("Starting useEffect initialization");

        await checkPermissionAndFetchData(fetchOrders, 'Matrix_FetchOrders', '9999');
        setLoading(false);

        console.log("Permissions checked and orders fetched successfully");
      } catch (err) {
        console.error("Error during useEffect initialization:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleRowClick = (orderId) => {
    console.log("Row clicked with orderId:", orderId);
    navigate(`/admin/orders/${orderId}`);
  };

  const getStatusBullet = (status) => {
    switch (status.toLowerCase()) {
      case 'unpaid':
        return <span className="bullet status-unpaid">• Unpaid</span>;
      case 'partial':
        return <span className="bullet status-partial">• Partial</span>;
      case 'pending':
        return <span className="bullet status-pending">• Pending</span>;
      case 'paid':
        return <span className="bullet status-paid">• Paid</span>;
      case 'refunded':
        return <span className="bullet status-refunded">• Refunded</span>;
      default:
        return <span className="bullet">• Unknown</span>;
    }
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const displayOrders = orders.slice(
    currentPage * ordersPerPage,
    (currentPage + 1) * ordersPerPage
  );

  return (
    <div className="admin-orders-container">
      <h1 className="admin-orders-title">Orders</h1>
      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <table className="orders-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Order ID</th>
                <th>Final</th>
                <th>Status</th>
                <th>Processor</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {displayOrders.map((order, index) => (
                <tr key={order.orderId} onClick={() => handleRowClick(order.orderId)} className="clickable-row">
                  <td>{orders.length - (currentPage * ordersPerPage + index)}</td>
                  <td>{order.user_email || 'N/A'}</td>
                  <td>{order.orderId}</td>
                  <td>{`$${order.final_price || order.total || '0.00'}`}</td>
                  <td className="status">
                    {getStatusBullet(order.payment_status)}
                  </td>
                  <td>{order.payment_method || 'Unknown'}</td>
                  <td>{new Date(order.order_date).toLocaleString() || 'Unknown'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination-container">
            <ReactPaginate
              previousLabel={'← Previous'}
              nextLabel={'Next →'}
              breakLabel={'...'}
              breakClassName={'break-me'}
              pageCount={Math.ceil(orders.length / ordersPerPage)}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageClick}
              containerClassName={'pagination'}
              subContainerClassName={'pages pagination'}
              activeClassName={'active'}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOrders;
