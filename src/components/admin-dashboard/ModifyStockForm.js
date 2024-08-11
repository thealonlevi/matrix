import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './styles/ModifyStockForm.css';

const ModifyStockForm = () => {
  const { productId } = useParams();
  const [stock, setStock] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const logRequest = async () => {
      try {
        console.log(`Logging request for product ID: ${productId}`);

        const logResponse = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_Logging', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product_id: productId, function_name: 'Matrix_FetchStock' }),
        });

        if (logResponse.status === 200) {
          console.log('Request logged successfully');
          return true;
        } else {
          console.error('Failed to log the request:', logResponse.status);
          setError('Failed to log the request');
          return false;
        }
      } catch (error) {
        console.error('Error logging the request:', error);
        setError('Error logging the request');
        return false;
      }
    };

    const fetchStock = async () => {
      try {
        console.log(`Fetching stock for product ID: ${productId}`);

        const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchStock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product_id: productId }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched stock:', data);

          setStock(data.body);
          setError(null); // Clear any previous errors if the fetch is successful
        } else {
          console.error('Failed to fetch stock:', response.status);
          setError('Failed to fetch stock');
        }
      } catch (error) {
        console.error('Error fetching stock:', error);
        setError('Error fetching stock');
      } finally {
        setLoading(false);
      }
    };

    // Log the request and then fetch the stock if logging succeeds
    const executeLoggingAndFetch = async () => {
      const isLogged = await logRequest();
      if (isLogged) {
        await fetchStock();
      }
    };

    executeLoggingAndFetch();
  }, [productId]);

  const handleSave = async () => {
    try {
      console.log('Saving new stock...');

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
        console.log('Stock updated successfully');
        navigate('/admin/products');
      } else {
        console.error('Failed to update stock:', response.status);
        setError('Failed to update stock');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
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
