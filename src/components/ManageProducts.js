import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ManageProducts.css';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Fetching products from API...");
        const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_GetProductList');
        
        console.log("API response status:", response.status);
        const rawData = await response.json();
        
        console.log("Raw data fetched:", rawData);

        const parsedData = JSON.parse(rawData.body);
        console.log("Parsed product list:", parsedData);

        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setProducts(parsedData);
          console.log("Products set to state:", parsedData);
        } else {
          console.log("No products found in the response.");
          setError("No products found.");
        }
      } catch (err) {
        setError('Failed to fetch products.');
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="manage-products-container">
      <h1>Manage Products</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {products.length > 0 ? (
        <div className="product-list">
          {products.map((product) => (
            <div key={product.product_id} className="product-item">
              <div className="product-details">
                <p><strong>ID:</strong> {product.product_id}</p>
                <p><strong>Title:</strong> {product.product_title}</p>
                <p><strong>Category:</strong> {product.product_category}</p>
                <p><strong>Price:</strong> ${product.product_price}</p>
                <p><strong>Image URL:</strong> <a href={product.product_img_url} target="_blank" rel="noopener noreferrer">View Image</a></p>
              </div>
              <Link to={`/modifyproduct/${product.product_id}`} className="edit-link">Edit</Link>
            </div>
          ))}
        </div>
      ) : (
        <p>No products found.</p>
      )}
    </div>
  );
};

export default ManageProducts;
