import React, { useState, useEffect } from 'react';
import './styles/AdminOrders.css'; // Assuming you have a CSS file for styling

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to log the request
  const logRequest = async () => {
    try {
      const logResponse = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_Logging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ function_name: 'Matrix_FetchOrders', product_id: '9999' }),
      });

      if (logResponse.status === 200) {
        return true;
      } else {
        setError('Failed to log the request');
        return false;
      }
    } catch (error) {
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

      const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchOrders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data && data.body && data.body.length > 0) {
          // Sort the orders by date (newest to oldest)
          const sortedOrders = data.body.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
          setOrders(sortedOrders);

          // Update the orderId:userId list in localStorage
          updateOrderUserIdList(sortedOrders);
        } else {
          setOrders([]); // Set to an empty array if no orders are found
        }
      } else {
        setError('Failed to fetch orders');
      }
    } catch (error) {
      setError('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  // Function to update the orderId:userId list in localStorage
  const updateOrderUserIdList = (orders) => {
    try {
      console.log("Updating orderUserIdList in localStorage...");
      const storedOrderUserIdList = JSON.parse(localStorage.getItem('orderUserIdList')) || [];

      const newOrderUserIdList = orders.map(order => ({
        orderId: order.orderId,
        userId: order.userId,
      }));

      // Log the new and stored lists
      console.log("New Order User ID List:", newOrderUserIdList);
      console.log("Stored Order User ID List:", storedOrderUserIdList);

      // Merge the new list with the existing one, avoiding duplicates
      const updatedList = [...storedOrderUserIdList];
      newOrderUserIdList.forEach(newPair => {
        if (!updatedList.find(pair => pair.orderId === newPair.orderId && pair.userId === newPair.userId)) {
          updatedList.push(newPair);
        }
      });

      console.log("Final Merged Order User ID List:", updatedList);

      // Save the updated list back to localStorage
      localStorage.setItem('orderUserIdList', JSON.stringify(updatedList));
    } catch (error) {
      console.error("Error updating orderUserIdList in localStorage:", error);
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Function to get the product title by ID from the offlineProductList in localStorage
  const getProductTitleById = (productId) => {
    console.log(`Fetching product title for Product ID: ${productId}...`);
    const offlineProductList = JSON.parse(localStorage.getItem('offlineProductList')) || [];
    const product = offlineProductList.find(item => item.product_id.toString() === productId.toString());

    if (product) {
      console.log(`Found product: ${product.product_title}`);
      return product.product_title;
    } else {
      console.warn(`Product with ID: ${productId} not found in offlineProductList.`);
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
                <td>{orders.length - index}</td> {/* Reversed index */}
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
