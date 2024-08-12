import React, { useEffect, useState } from 'react';
import './styles/ManageProducts.css';
import editIcon from '../../assets/icons/edit.png';  // Adjust the path as necessary
import deleteIcon from '../../assets/icons/trash.png';  // Adjust the path as necessary
import stockIcon from '../../assets/icons/box.png';  // Add this icon for stock management
import plusIcon from '../../assets/icons/plus.png';  // Add this icon for creating a new product
import { checkAdminPermission } from './utils/checkAdminPermissions'; // Import the utility function
import { useNavigate } from 'react-router-dom';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAccessAndFetchProducts = async () => {
      const hasPermission = await checkAdminPermission();

      if (!hasPermission) {
        setError('Page not found.');
        setTimeout(() => {
          navigate('/');  // Redirect to the home page after 2 seconds
        }, 2000);
      } else {
        fetchProducts();
      }
    };

    const fetchProducts = async () => {
      try {
        console.log("Fetching products from API...");
        const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_GetProductList');
        if (!response.ok) {
          throw new Error(`Error fetching products: ${response.statusText}`);
        }
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
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    verifyAccessAndFetchProducts();
  }, [navigate]);

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
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
          setError(`Failed to delete product with ID: ${productId}`);
        }
      } catch (error) {
        console.error(`Error deleting product with ID: ${productId}`, error);
        setError(`Error deleting product with ID: ${productId}`);
      }
    }
  };

  if (loading) {
    return <p className="admin-loading">Loading products...</p>;
  }

  if (error) {
    return <p className="admin-error">Error: {error}</p>;
  }

  return (
    <div className="admin-manage-products-container">
      <h1 className="admin-manage-products-header">Manage Products</h1>
      
      {/* Add New Product Button */}
      <div className="admin-add-product">
        <a href="/admin/createproduct" className="admin-add-product-link">
          <img src={plusIcon} alt="Add Product" className="admin-icon" />
        </a>
      </div>

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
              <div className="admin-action-buttons">
                <a href={`/modifyproduct/${product.product_id}`} className="admin-edit-link">
                  <img src={editIcon} alt="Edit" className="admin-icon" />
                </a>
                <button onClick={() => handleDelete(product.product_id)} className="admin-delete-button">
                  <img src={deleteIcon} alt="Delete" className="admin-icon" />
                </button>
                <a href={`/modifystock/${product.product_id}`} className="admin-stock-link">
                  <img src={stockIcon} alt="Manage Stock" className="admin-icon" />
                </a>
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