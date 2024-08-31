import React, { useEffect, useState, useCallback } from 'react';
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
import { useNotification } from './utils/Notification'; // Import useNotification hook

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { showNotification } = useNotification(); // Destructure the showNotification function from the hook

  useEffect(() => {
    const verifyAccessAndFetchProducts = async () => {
      const hasPermission = await checkAdminPermission();

      if (!hasPermission) {
        setError('Page not found.');
        showNotification('Access denied. Redirecting...', 'error');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        try {
          const sortedProducts = await fetchProducts();
          setProducts(sortedProducts);
        } catch (error) {
          setError(error.message);
          showNotification(`Error fetching products: ${error.message}`, 'error');
        } finally {
          setLoading(false);
        }
      }
    };

    verifyAccessAndFetchProducts();
  }, [navigate, showNotification]);

  const handleDelete = useCallback(
    async (productId) => {
      await handleDeleteProduct(productId, products, setProducts, setError, deleteProduct);
      showNotification(`Product with ID ${productId} deleted successfully.`, 'success');
    },
    [products, showNotification]
  );

  const handleToggleVisibility = useCallback(
    async (productId) => {
      await handleToggleProductVisibility(productId, products, setProducts, setError, toggleProductVisibility);
      showNotification(`Product visibility toggled for ID ${productId}.`, 'info');
    },
    [products, showNotification]
  );

  const handleAppendProduct = useCallback(
    async (groupId, productId) => {
      try {
        const response = await appendProductToGroup(groupId, productId);
        showNotification(`Product with ID ${productId} added to group ${groupId} successfully.`, 'success');
        // Refresh the product list after appending the product
        const sortedProducts = await fetchProducts();
        setProducts(sortedProducts);
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
        const response = await detachProductFromGroup(groupId, productId);
        showNotification(`Product with ID ${productId} detached from group ${groupId} successfully.`, 'success');
        // Refresh the product list after detaching the product
        const sortedProducts = await fetchProducts();
        setProducts(sortedProducts);
      } catch (error) {
        setError(`Error detaching product: ${error.message}`);
        showNotification(`Error detaching product: ${error.message}`, 'error');
      }
    },
    [showNotification]
  );

  const toggleGroupExpansionHandler = (groupId) => {
    toggleGroupExpansion(groupId, expandedGroups, setExpandedGroups);
  };

  if (loading) {
    return <p className='admin-loading'>Loading products...</p>;
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
          <p>Image URL</p>
          <p>Visibility</p>
          <p>Actions</p>
        </div>
        {products.length > 0 ? (
          products.map((product) => (
            <ProductItem
              key={product.product_id}
              product={product}
              products={products} // Pass all products to filter out groups
              isGroup={Array.isArray(product.product_group)}
              isExpanded={expandedGroups.includes(product.product_id)}
              toggleGroupExpansion={toggleGroupExpansionHandler}
              handleDelete={handleDelete}
              handleToggleVisibility={handleToggleVisibility}
              handleAppendProduct={handleAppendProduct}
              handleDetachProduct={handleDetachProduct} // Pass detach handler
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
