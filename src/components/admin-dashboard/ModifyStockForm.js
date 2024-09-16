import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './styles/ModifyStockForm.css';
import { checkAdminPermission, logRequest, fetchProductStock, modifyProductStock } from '../../utils/api'; // Import API functions from api.js
import { useNotification } from './utils/Notification';

const ModifyStockForm = () => {
  const { productId } = useParams();
  const [stock, setStock] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // State to track request processing
  const navigate = useNavigate();

  // Notification hook
  const { showNotification } = useNotification();

  // Ref to prevent spamming requests
  const isFetchingRef = useRef(false);
  const didFetchRef = useRef(false); // Ref to ensure we only run once

  useEffect(() => {
    const fetchStockData = async () => {
      const stockData = await fetchProductStock(productId);
      // Handle the stock data directly as a string
      if (stockData) {
        setStock(stockData); // Set stock if data is successfully fetched
        setError(null); // Clear any previous errors if the fetch is successful
        showNotification('Stock fetched successfully.', 'success'); // Show success notification
      } else {
        setStock(''); // Set stock if data is successfully fetched
        setError(null); // Clear any previous errors if the fetch is successful
        showNotification('Stock fetched successfully.', 'success'); // Show success notification
      }
      setLoading(false);
      isFetchingRef.current = false; // Reset fetching state
    };

    const verifyAccessAndExecute = async () => {
      if (isFetchingRef.current || didFetchRef.current) return; // Prevent duplicate requests
      isFetchingRef.current = true;
      didFetchRef.current = true; // Ensure this block only runs once

      try {
        const hasPermission = await checkAdminPermission(); // Use api.js function to check admin permission

        if (!hasPermission) {
          setError('Access denied: Admin permissions required.');
          showNotification('Access denied: Admin permissions required.', 'error'); // Show error notification
          setTimeout(() => {
            navigate('/');  // Redirect to the home page after 2 seconds
          }, 2000);
        } else {
          const isLogged = await logRequest('Matrix_FetchStock', productId); // Use api.js function to log the request
          if (isLogged) {
            await fetchStockData();  // Fetch the stock only after the request is logged
          } else {
            setError('Failed to log the request.');
            showNotification('Failed to log the request.', 'error'); // Show error notification
          }
        }
      } catch (error) {
        setError('An error occurred during permission verification.');
        showNotification('An error occurred during permission verification.', 'error'); // Show error notification
      } finally {
        isFetchingRef.current = false; // Ensure to reset fetching state if needed in future
      }
    };

    verifyAccessAndExecute();
  }, [productId, navigate, showNotification]);

  const handleSave = async () => {
    if (isProcessing) return; // Prevent duplicate requests
    setIsProcessing(true); // Set processing to true to indicate request is in progress

    try {
      await modifyProductStock(productId, stock); // Use api.js function to modify product stock
      showNotification('Stock updated successfully.', 'success'); // Show success notification
      navigate('/admin/products');
    } catch (error) {
      setError('Error updating stock');
      showNotification('Error updating stock.', 'error'); // Show error notification
    } finally {
      setIsProcessing(false); // Reset processing state
    }
  };

  return (
    <div>
      <h2>Modify Stock for Product ID: {productId}</h2>
      {loading ? (
        <p>Loading stock...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div>
          <textarea
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            rows="10"
            cols="50"
          />
          <br />
          <button onClick={handleSave} disabled={isProcessing}> {/* Disable button while processing */}
            {isProcessing ? 'Saving...' : 'Save Stock'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ModifyStockForm;
