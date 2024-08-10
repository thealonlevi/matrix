// src/components/ManageProducts.js
import React, { useEffect, useState } from 'react';
import '../styles/ManageProducts.css';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      console.log("Fetching products from API...");
      const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_GetProductList');
      const data = await response.json();
      console.log("API response status:", response.status);
      console.log("Raw data fetched:", data);

      const parsedData = JSON.parse(data.body);
      console.log("Parsed product list:", parsedData);

      // Sort products by ID in descending order
      const sortedProducts = parsedData.sort((a, b) => b.product_id - a.product_id);
      console.log("Sorted products list:", sortedProducts);

      setProducts(sortedProducts);
      console.log("Products set to state:", sortedProducts);
    };

    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    try {
      console.log(`Deleting product with ID: ${productId}`);
      const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_DeleteProduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (response.ok) {
        console.log(`Product with ID: ${productId} deleted successfully.`);
        setProducts(products.filter(product => product.product_id !== productId));
      } else {
        console.error(`Failed to delete product with ID: ${productId}`);
      }
    } catch (error) {
      console.error(`Error deleting product with ID: ${productId}`, error);
    }
  };

  return (
    <div className="admin-manage-products-container">
      <h1 className="admin-manage-products-header">Manage Products</h1>
      <div className="admin-product-list">
        <div className="admin-product-header">
          <p>ID</p>
          <p>Title</p>
          <p>Category</p>
          <p>Price</p>
          <p>Image URL</p>
          <p>Actions</p>
        </div>
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.product_id} className="admin-product-item">
              <p>{product.product_id}</p>
              <p>{product.product_title}</p>
              <p>{product.product_category}</p>
              <p>${product.product_price}</p>
              <p><a href={product.product_img_url} target="_blank" rel="noopener noreferrer">View Image</a></p>
              <div>
                <a href={`/modifyproduct/${product.product_id}`} className="admin-edit-link">Edit</a>
                <button onClick={() => handleDelete(product.product_id)} className="admin-delete-button">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;
