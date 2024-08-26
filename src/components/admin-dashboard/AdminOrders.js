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
      const serverResponse = await fetchData(
        'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchOrdersCache',
        {}
      );

      const serverData = typeof serverResponse === 'string' ? JSON.parse(serverResponse) : serverResponse;

      const storedUID = localStorage.getItem('ORDERS_DATABASE_UID');
      const serverUID = serverData.ORDERS_DATABASE_UID;

      if (storedUID !== serverUID) {
        // Update the local storage with new UID and orders data
        localStorage.setItem('ORDERS_DATABASE_UID', serverUID);
        localStorage.setItem('ORDERS_DATABASE', JSON.stringify(serverData.ORDERS_DATABASE));

        const ordersArray = Object.keys(serverData.ORDERS_DATABASE).map((key) => {
          return JSON.parse(serverData.ORDERS_DATABASE[key].order_data);
        });

        const sortedOrders = ordersArray.sort((a, b) => {
          const dateA = new Date(a.order_date?.S || a.order_date);
          const dateB = new Date(b.order_date?.S || b.order_date);
          return dateB - dateA;
        });

        setOrders(sortedOrders);
        updateOrderUserIdList(sortedOrders);
      } else {
        const storedOrders = JSON.parse(localStorage.getItem('ORDERS_DATABASE') || '{}');
        const ordersArray = Object.keys(storedOrders).map((key) => {
          return JSON.parse(storedOrders[key].order_data);
        });

        const sortedOrders = ordersArray.sort((a, b) => {
          const dateA = new Date(a.order_date?.S || a.order_date);
          const dateB = new Date(b.order_date?.S || b.order_date);
          return dateB - dateA;
        });

        setOrders(sortedOrders);
      }
    } catch (error) {
      setError("Failed to fetch orders. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderUserIdList = (orders) => {
    try {
      const storedOrderUserIdList = JSON.parse(localStorage.getItem('orderUserIdList')) || [];
      const newOrderUserIdList = orders.map(order => ({
        orderId: order.orderId?.S || order.orderId,
        userId: order.userId?.S || order.userId,
      }));

      const updatedList = [...storedOrderUserIdList];
      newOrderUserIdList.forEach(newPair => {
        if (!updatedList.find(pair => pair.orderId === newPair.orderId && pair.userId === newPair.userId)) {
          updatedList.push(newPair);
        }
      });

      localStorage.setItem('orderUserIdList', JSON.stringify(updatedList));
    } catch (error) {
      console.error('[AdminOrders] Error updating orderUserIdList in localStorage:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await checkPermissionAndFetchData(fetchOrders, 'Matrix_FetchOrders', '9999');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleRowClick = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const getStatusBullet = (status) => {
    const statusString = typeof status === 'object' && status.S ? status.S.toLowerCase() : String(status).toLowerCase();

    switch (statusString) {
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
                <tr key={`${order.orderId?.S || order.orderId}-${index}`} onClick={() => handleRowClick(order.orderId?.S || order.orderId)} className="clickable-row">
                  <td>{orders.length - (currentPage * ordersPerPage + index)}</td>
                  <td>{order.user_email?.S || 'N/A'}</td>
                  <td>{order.orderId?.S || order.orderId}</td>
                  <td>{`$${order.final_price?.S || order.total?.S || '0.00'}`}</td>
                  <td className="status">
                    {getStatusBullet(order.payment_status?.S || order.payment_status)}
                  </td>
                  <td>{order.payment_method?.S || 'Unknown'}</td>
                  <td>{order.order_date?.S ? new Date(order.order_date.S).toLocaleString() : 'Invalid Date'}</td>
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
