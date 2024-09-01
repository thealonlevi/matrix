import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './styles/ModifyStockForm.css';
import { checkAdminPermission } from './utils/checkAdminPermissions'; // Import the utility function
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
    const logRequest = async () => {
      try {
        const logResponse = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_Logging', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product_id: productId, function_name: 'Matrix_FetchStock' }),
        });

        if (logResponse.status === 200) {
          showNotification('Request logged successfully.', 'success'); // Show success notification
          return true;
        } else {
          setError('Failed to log the request');
          showNotification('Failed to log the request.', 'error'); // Show error notification
          return false;
        }
      } catch (error) {
        setError('Error logging the request');
        showNotification('Error logging the request.', 'error'); // Show error notification
        return false;
      }
    };

    const fetchStock = async () => {
      try {
        const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchStock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product_id: productId }),
        });

        if (response.ok) {
          const data = await response.json();
          setStock(data.body);
          setError(null); // Clear any previous errors if the fetch is successful
          showNotification('Stock fetched successfully.', 'success'); // Show success notification
        } else {
          setError('Failed to fetch stock');
          showNotification('Failed to fetch stock.', 'error'); // Show error notification
        }
      } catch (error) {
        setError('Error fetching stock');
        showNotification('Error fetching stock.', 'error'); // Show error notification
      } finally {
        setLoading(false);
        isFetchingRef.current = false; // Reset fetching state
      }
    };

    const verifyAccessAndExecute = async () => {
      if (isFetchingRef.current || didFetchRef.current) return; // Prevent duplicate requests
      isFetchingRef.current = true;
      didFetchRef.current = true; // Ensure this block only runs once

      try {
        const hasPermission = await checkAdminPermission();

        if (!hasPermission) {
          setError('Page not found.');
          showNotification('Access denied: Admin permissions required.', 'error'); // Show error notification
          setTimeout(() => {
            navigate('/');  // Redirect to the home page after 2 seconds
          }, 2000);
        } else {
          const isLogged = await logRequest();
          if (isLogged) {
            await fetchStock();
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
      const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/ModifyStock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          product_stock: stock,
        }),
      });

      if (response.ok) {
        showNotification('Stock updated successfully.', 'success'); // Show success notification
        navigate('/admin/products');
      } else {
        setError('Failed to update stock');
        showNotification('Failed to update stock.', 'error'); // Show error notification
      }
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
