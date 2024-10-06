import React, { useEffect, useState, useCallback, useRef } from 'react';
import './styles/ManageProducts.css';
import { checkAdminPermission } from './utils/checkAdminPermissions';
import { fetchProducts, deleteProduct, toggleProductVisibility } from './utils/api';
import ProductItem from './ProductItem';
import { useNavigate } from 'react-router-dom';
import {
  toggleGroupExpansion,
  handleDeleteProduct,
  handleToggleProductVisibility,
} from './utils/productutils';
import { appendProductToGroup, detachProductFromGroup } from './utils/groupUtils';
import { useNotification } from './utils/Notification';
import LoadingScreen from '../LoadingScreen'; // Import the LoadingScreen component

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const permissionChecked = useRef(false); // Add a ref to track if permission has been checked

  useEffect(() => {
    const verifyAccessAndFetchProducts = async () => {
      if (permissionChecked.current) return; // If permission has been checked, skip the function

      try {
        const hasPermission = await checkAdminPermission();
        permissionChecked.current = true; // Mark permission as checked

        if (!hasPermission) {
          setError('Page not found.');
          showNotification('Access denied. Redirecting...', 'error');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          const sortedProducts = await fetchProducts();
          setProducts(sortedProducts);
        }
      } catch (error) {
        setError(error.message);
        showNotification(`Error fetching products: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    verifyAccessAndFetchProducts();
  }, [navigate, showNotification]);

  const handleDelete = useCallback(
    async (productId) => {
      try {
        await handleDeleteProduct(productId, products, setProducts, setError, deleteProduct);
        showNotification(`Product with ID ${productId} deleted successfully.`, 'success');
      } catch (error) {
        showNotification(`Error deleting product: ${error.message}`, 'error');
      }
    },
    [products, showNotification]
  );

  const handleToggleVisibility = useCallback(
    async (productId) => {
      try {
        await handleToggleProductVisibility(productId, products, setProducts, setError, toggleProductVisibility);
        showNotification(`Product visibility toggled for ID ${productId}.`, 'info');
      } catch (error) {
        showNotification(`Error toggling visibility: ${error.message}`, 'error');
      }
    },
    [products, showNotification]
  );

  const handleAppendProduct = useCallback(
    async (groupId, productId) => {
      try {
        await appendProductToGroup(groupId, productId);
        showNotification(`Product with ID ${productId} added to group ${groupId} successfully.`, 'success');
        const updatedProducts = await fetchProducts();
        setProducts(updatedProducts);
      } catch (error) {
        setError(`Error adding product: ${error.message}`);
        showNotification(`Error adding product: ${error.message}`, 'error');
      }
    },
    [showNotification]
  );

  const handleDetachProduct = useCallback(
    async (groupId, productId) => {
      try {
        await detachProductFromGroup(groupId, productId);
        showNotification(`Product with ID ${productId} detached from group ${groupId} successfully.`, 'success');
        const updatedProducts = await fetchProducts();
        setProducts(updatedProducts);
      } catch (error) {
        setError(`Error detaching product: ${error.message}`);
        showNotification(`Error detaching product: ${error.message}`, 'error');
      }
    },
    [showNotification]
  );

  const toggleGroupExpansionHandler = useCallback(
    (groupId) => {
      toggleGroupExpansion(groupId, expandedGroups, setExpandedGroups);
    },
    [expandedGroups]
  );

  if (loading) {
    return (
      <div className="loading-screen-container">
        <LoadingScreen message="Loading products..." size="large" />
      </div>
    );
  }

  if (error) {
    return <p className='admin-error'>Error: {error}</p>;
  }

  return (
    <div className='admin-manage-products-container'>
      <h1 className='admin-manage-products-header'>Manage Products</h1>

      <div className='admin-add-product'>
        <button onClick={() => navigate('/admin/createproduct')} className='admin-add-product-link'>
          Create Product
        </button>
        <button onClick={() => navigate('/admin/creategroup')} className='admin-add-group-link'>
          Create Group
        </button>
      </div>

      <div className='admin-product-list'>
        <div className='admin-product-header'>
          <p>ID</p>
          <p>Title</p>
          <p>Category</p>
          <p>Price</p>
          <p>Stock</p> {/* Added Stock column */}
          <p>Image URL</p>
          <p>Visibility</p>
          <p>Actions</p>
        </div>
        {products.length > 0 ? (
          products.map((product) => (
            <ProductItem
              key={product.product_id}
              product={product}
              products={products}
              isGroup={Array.isArray(product.product_group)}
              isExpanded={expandedGroups.includes(product.product_id)}
              toggleGroupExpansion={toggleGroupExpansionHandler}
              handleDelete={handleDelete}
              handleToggleVisibility={handleToggleVisibility}
              handleAppendProduct={handleAppendProduct}
              handleDetachProduct={handleDetachProduct}
              expandedGroups={expandedGroups}
            />
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;
