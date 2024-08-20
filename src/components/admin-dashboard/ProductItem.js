import React, { useState } from 'react';
import editIcon from '../../assets/icons/edit.png';
import deleteIcon from '../../assets/icons/trash.png';
import stockIcon from '../../assets/icons/box.png';
import expandIcon from '../../assets/icons/plus.png';
import collapseIcon from '../../assets/icons/plus.png';

const ProductItem = ({
  product,
  isGroup,
  isExpanded,
  toggleGroupExpansion,
  handleDelete,
  handleToggleVisibility,
  handleAppendProduct,
  expandedGroups,
  products,
}) => {
  const [productIdToAdd, setProductIdToAdd] = useState('');

  const groupProducts = product.product_group || [];

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (productIdToAdd) {
      handleAppendProduct(product.product_id, productIdToAdd);
      setProductIdToAdd(''); // Clear the input field after adding
    } else {
      alert('Please select a product to add.');
    }
  };

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
              title="Expand/Collapse Group"
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
            title="Edit Product"
          >
            <img src={editIcon} alt='Edit' className='admin-icon' />
          </a>
          <button
            onClick={() => handleDelete(product.product_id)}
            className='admin-delete-button'
            title="Delete Product"
          >
            <img src={deleteIcon} alt='Delete' className='admin-icon' />
          </button>
          {!isGroup && (
            <a
              href={`/admin/modifystock/${product.product_id}`}
              className='admin-stock-link'
              title="Manage Stock"
            >
              <img src={stockIcon} alt='Manage Stock' className='admin-icon' />
            </a>
          )}
        </div>
      </div>
      {isGroup && isExpanded && (
        <div className='admin-group-products'>
          {groupProducts.map((groupProduct) => (
            <div
              key={groupProduct.product_id}
              className={`admin-product-item admin-group-child-item ${
                expandedGroups.includes(product.product_id) ? 'expanded' : ''
              }`}
            >
              <p>{groupProduct.product_id}</p>
              <p>{groupProduct.product_title}</p>
              <p>{groupProduct.product_category}</p>
              <p>${groupProduct.product_price}</p>
              <p>
                <a
                  href={groupProduct.product_img_url}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  View Image
                </a>
              </p>
              <div className='admin-visibility-checkbox'>
                <input
                  type='checkbox'
                  checked={groupProduct.visible !== false}
                  onChange={() => handleToggleVisibility(`${product.product_id}/${groupProduct.product_id}`)}
                />
              </div>
              <div className='admin-action-buttons'>
                <a
                  href={`/admin/modifyproduct/${product.product_id}/${groupProduct.product_id}`}
                  className='admin-edit-link'
                  title="Edit Group Product"
                >
                  <img src={editIcon} alt='Edit' className='admin-icon' />
                </a>
                <button
                  onClick={() => handleDelete(`${product.product_id}/${groupProduct.product_id}`)}
                  className='admin-delete-button'
                  title="Delete Group Product"
                >
                  <img src={deleteIcon} alt='Delete' className='admin-icon' />
                </button>
                <a
                  href={`/admin/modifystock/${groupProduct.product_id}`}
                  className='admin-stock-link'
                  title="Manage Group Product Stock"
                >
                  <img src={stockIcon} alt='Manage Stock' className='admin-icon' />
                </a>
              </div>
            </div>
          ))}
          <form onSubmit={handleAddProduct} className='admin-add-product-to-group-form'>
            <select
              value={productIdToAdd}
              onChange={(e) => setProductIdToAdd(e.target.value)}
              className='admin-add-product-input'
            >
              <option value=''>Select Product to Add</option>
              {products
                .filter((prod) => !Array.isArray(prod.product_group)) // Exclude groups
                .map((prod) => (
                  <option key={prod.product_id} value={prod.product_id}>
                    {`${prod.product_id} - ${prod.product_title}`}
                  </option>
                ))}
            </select>
            <button type='submit' className='admin-add-product-button'>
              Add Product to Group
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ProductItem;
