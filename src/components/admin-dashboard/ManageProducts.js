import React, { useEffect, useState, useCallback } from 'react';
import './styles/ManageProducts.css';
import editIcon from '../../assets/icons/edit.png';
import deleteIcon from '../../assets/icons/trash.png';
import stockIcon from '../../assets/icons/box.png';
import plusIcon from '../../assets/icons/plus.png';
import expandIcon from '../../assets/icons/plus.png';
import collapseIcon from '../../assets/icons/plus.png';
import { checkAdminPermission } from './utils/checkAdminPermissions';
import { useNavigate } from 'react-router-dom';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAccessAndFetchProducts = async () => {
      const hasPermission = await checkAdminPermission();

      if (!hasPermission) {
        setError('Page not found.');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        fetchProducts();
      }
    };

    const fetchProducts = async () => {
      try {
        console.log('Fetching products from API...');
        const response = await fetch(
          'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_GetProductList'
        );
        if (!response.ok) {
          throw new Error(`Error fetching products: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('API response status:', response.status);
        console.log('Raw data fetched:', data);

        const parsedData = JSON.parse(data.body);
        console.log('Parsed product list:', parsedData);

        const sortedProducts = parsedData.sort(
          (a, b) => b.product_id - a.product_id
        );
        console.log('Sorted products list:', sortedProducts);

        setProducts(sortedProducts);
        console.log('Products set to state:', sortedProducts);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    verifyAccessAndFetchProducts();
  }, [navigate]);

  const handleDelete = useCallback(
    async (productId) => {
      console.log(`[Delete Product] Initiating delete process for product ID: ${productId}`);
      if (window.confirm('Are you sure you want to delete this product?')) {
        try {
          console.log(`[Delete Product] Confirmed deletion for product ID: ${productId}`);
          console.log(`[Delete Product] Sending delete request to API for product ID: ${productId}`);

          const response = await fetch(
            'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_DeleteProduct',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ product_id: productId }),
            }
          );

          console.log(`[Delete Product] API Response status: ${response.status}`);
          
          if (response.ok) {
            console.log(`[Delete Product] Product with ID: ${productId} deleted successfully.`);
            setProducts(
              products.filter((product) => product.product_id !== productId)
            );
          } else {
            console.error(`[Delete Product] Failed to delete product with ID: ${productId}. Response status: ${response.status}`);
            const responseBody = await response.json();
            console.error(`[Delete Product] API Response body: ${JSON.stringify(responseBody)}`);
            setError(`Failed to delete product with ID: ${productId}`);
          }
        } catch (error) {
          console.error(`[Delete Product] Error occurred while deleting product with ID: ${productId}.`, error);
          setError(`Error deleting product with ID: ${productId}`);
        }
      } else {
        console.log(`[Delete Product] Deletion canceled for product ID: ${productId}`);
      }
    },
    [products]
  );

  const handleToggleVisibility = useCallback(
    async (productId) => {
      try {
        console.log(`Toggling visibility for product ID: ${productId}`);
        const response = await fetch(
          'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_ToggleVisibility',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id: productId }),
          }
        );

        if (response.ok) {
          console.log(
            `Visibility toggled successfully for product ID: ${productId}`
          );
          setProducts(
            products.map((product) =>
              product.product_id === productId
                ? { ...product, visible: !product.visible }
                : product
            )
          );
        } else {
          console.error(
            `Failed to toggle visibility for product ID: ${productId}`
          );
          setError(`Failed to toggle visibility for product ID: ${productId}`);
        }
      } catch (error) {
        console.error(
          `Error toggling visibility for product ID: ${productId}`,
          error
        );
        setError(`Error toggling visibility for product ID: ${productId}`);
      }
    },
    [products]
  );

  const toggleGroupExpansion = (groupId) => {
    setExpandedGroups((prevExpandedGroups) =>
      prevExpandedGroups.includes(groupId)
        ? prevExpandedGroups.filter((id) => id !== groupId)
        : [...prevExpandedGroups, groupId]
    );
  };

  const renderGroupProducts = (groupProducts, groupId) => {
    return groupProducts.map((product, index) => {
      const fullProductId = `${groupId}/${product.product_id}`;
      const simpleProductId = `${product.product_id}`;

      return (
        <div
          key={fullProductId}
          className={`admin-product-item admin-group-child-item ${
            expandedGroups.includes(groupId) ? 'expanded' : ''
          }`}
        >
          <p>{product.product_id}</p>
          <p>{product.product_title}</p>
          <p>{product.product_category}</p>
          <p>${product.product_price}</p>
          <p>
            <a
              href={product.product_img_url}
              target='_blank'
              rel='noopener noreferrer'
            >
              View Image
            </a>
          </p>
          <div className='admin-visibility-checkbox'>
            <input
              type='checkbox'
              checked={product.visible !== false}
              onChange={() => handleToggleVisibility(fullProductId)}
            />
          </div>
          <div className='admin-action-buttons'>
            <a
              href={`/admin/modifyproduct/${fullProductId}`}
              className='admin-edit-link'
            >
              <img src={editIcon} alt='Edit' className='admin-icon' />
            </a>
            <button
              onClick={() => handleDelete(fullProductId)}
              className='admin-delete-button'
            >
              <img src={deleteIcon} alt='Delete' className='admin-icon' />
            </button>
            <a
              href={`/admin/modifystock/${simpleProductId}`}
              className='admin-stock-link'
            >
              <img src={stockIcon} alt='Manage Stock' className='admin-icon' />
            </a>
          </div>
        </div>
      );
    });
  };

  const ProductItem = ({ product }) => {
    const isGroup =
      Array.isArray(product.product_group) && product.product_group.length > 0;
    const isExpanded = expandedGroups.includes(product.product_id);

    return (
      <>
        <div
          key={product.product_id}
          className={`admin-product-item ${isGroup ? 'admin-group-item' : ''}`}
        >
          <p>{product.product_id}</p>
          <p>
            {product.product_title}
            {isGroup && <span className='group-label'>Group</span>}
          </p>
          <p>{product.product_category}</p>
          <p>{isGroup ? '' : `$${product.product_price}`}</p>
          <p>
            <a
              href={product.product_img_url}
              target='_blank'
              rel='noopener noreferrer'
            >
              View Image
            </a>
          </p>
          <div className='admin-visibility-checkbox'>
            <input
              type='checkbox'
              checked={product.visible !== false}
              onChange={() => handleToggleVisibility(product.product_id)}
            />
          </div>
          <div className='admin-action-buttons'>
            {isGroup && (
              <button
                onClick={() => toggleGroupExpansion(product.product_id)}
                className='admin-expand-button'
              >
                <img
                  src={isExpanded ? collapseIcon : expandIcon}
                  alt='Expand/Collapse'
                  className='admin-icon'
                />
              </button>
            )}
            <a
              href={`/admin/modifyproduct/${product.product_id}`}
              className='admin-edit-link'
            >
              <img src={editIcon} alt='Edit' className='admin-icon' />
            </a>
            <button
              onClick={() => handleDelete(product.product_id)}
              className='admin-delete-button'
            >
              <img src={deleteIcon} alt='Delete' className='admin-icon' />
            </button>
            <a
              href={`/admin/modifystock/${product.product_id}`}
              className='admin-stock-link'
            >
              <img src={stockIcon} alt='Manage Stock' className='admin-icon' />
            </a>
          </div>
        </div>
        {isGroup && isExpanded && (
          <div className='admin-group-products'>
            {renderGroupProducts(product.product_group, product.product_id)}
          </div>
        )}
      </>
    );
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
        <a href='/admin/createproduct' className='admin-add-product-link'>
          <img src={plusIcon} alt='Add Product' className='admin-icon' />
        </a>
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
            <ProductItem key={product.product_id} product={product} />
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;
