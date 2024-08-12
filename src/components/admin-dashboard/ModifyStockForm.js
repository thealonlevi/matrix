import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './styles/ModifyStockForm.css';
import { checkAdminPermission } from './utils/checkAdminPermissions'; // Import the utility function

const ModifyStockForm = () => {
  const { productId } = useParams();
  const [stock, setStock] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        } else {
          setError('Failed to fetch stock');
        }
      } catch (error) {
        setError('Error fetching stock');
      } finally {
        setLoading(false);
      }
    };

    const verifyAccessAndExecute = async () => {
      try {
        const hasPermission = await checkAdminPermission();

        if (!hasPermission) {
          setError('Page not found.');
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
      }
    };

    verifyAccessAndExecute();
  }, [productId, navigate]);

  const handleSave = async () => {
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
        alert('Stock updated successfully');
        navigate('/admin/products');
      } else {
        setError('Failed to update stock');
      }
    } catch (error) {
      setError('Error updating stock');
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
          <button onClick={handleSave}>Save Stock</button>
        </div>
      )}
    </div>
  );
};

export default ModifyStockForm;
