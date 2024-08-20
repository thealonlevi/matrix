import React, { useState, useEffect } from 'react';
import './styles/AdminOrders.css'; // Assuming you have a CSS file for styling

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to log the request
  const logRequest = async () => {
    try {
      console.log("Logging the request for fetching orders...");
      const logResponse = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_Logging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ function_name: 'Matrix_FetchOrders', product_id: '9999' }),
      });

      console.log("Log request response:", logResponse);

      if (logResponse.status === 200) {
        console.log("Logging successful");
        return true;
      } else {
        console.error("Failed to log the request", logResponse.statusText);
        setError('Failed to log the request');
        return false;
      }
    } catch (error) {
      console.error("Error logging the request:", error);
      setError('Error logging the request');
      return false;
    }
  };

  // Function to fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const logged = await logRequest();
      if (!logged) return;

      console.log("Fetching orders...");
      const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchOrders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Fetch orders response:", response);

      if (response.ok) {
        const data = await response.json();
        console.log("Orders data received:", data);

        if (data && data.body && data.body.length > 0) {
          console.log("Setting orders data...");
          setOrders(data.body);
        } else {
          console.warn("No orders found in the response data.");
          setOrders([]); // Set to an empty array if no orders are found
        }
      } else {
        console.error("Failed to fetch orders", response.statusText);
        setError('Failed to fetch orders');
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError('Error fetching orders');
    } finally {
      setLoading(false);
      console.log("Loading state set to false");
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    console.log("Component mounted, fetching orders...");
    fetchOrders();

    console.log("Full localStorage data:");
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      let value = localStorage.getItem(key);
      console.log(`${key}: ${value}`);
    }
  }, []);

  // Function to get the product title by ID from the offlineProductList in localStorage
  const getProductTitleById = (productId) => {
    const offlineProductList = JSON.parse(localStorage.getItem('offlineProductList')) || [];
    // Ensure both product_id and productId are treated as strings during comparison
    const product = offlineProductList.find(item => item.product_id.toString() === productId.toString());
  
    if (product) {
      console.log(`Found product:`, product); // Log the found product
      return product.product_title;
    } else {
      console.log(`Product with ID: ${productId} not found.`);
      return `Product ID: ${productId}`;
    }
  };
  
  

  return (
    <div className="admin-orders-container">
      <h1 className="admin-orders-title">Orders</h1>
      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Title</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Status</th>
              <th>Processor</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.orderId}>
                <td>{index + 1}</td>
                <td>{order.user_email || 'N/A'}</td>
                <td>
                  {order.order_contents ? (
                    order.order_contents.map((item, idx) => (
                      <span key={`${order.orderId}-${idx}`}>
                        {getProductTitleById(item.product_id)}
                      </span>
                    ))
                  ) : (
                    <span>No items</span>
                  )}
                </td>
                <td>
                  {order.order_contents ? (
                    order.order_contents.map((item, idx) => (
                      <span key={`${order.orderId}-quantity-${idx}`}>{item.quantity}</span>
                    ))
                  ) : (
                    <span>0</span>
                  )}
                </td>
                <td>{`$${order.total || '0.00'}`}</td>
                <td className={order.payment_status === 'paid' ? 'paid' : 'unpaid'}>
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) || 'Unknown'}
                </td>
                <td>{order.payment_method || 'Unknown'}</td>
                <td>{new Date(order.order_date || '').toLocaleString() || 'Unknown'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrders;
