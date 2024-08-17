import React, { useState } from 'react';
import '../styles/ProductDetailsModal.css';

const ProductDetailsModal = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    // Add the product to the cart with the specified quantity
    console.log(`Added ${quantity} of ${product.product_title} to the cart`);
    onClose(); // Close the modal after adding to cart
  };

  return (
    <div className="product-modal-overlay">
      <div className="product-modal">
        <button className="close-button" onClick={onClose}>×</button>
        <div className="product-modal-content">
          <h2 className="product-modal-title">Description</h2>
          <div className="product-modal-info-section">
            <p className="product-modal-description">{product.product_description || 'No description available.'}</p>
            <h3 className="product-modal-subtitle">Method</h3>
            <ul className="method-list">
              <li>Step 1: Explanation here</li>
              <li>Step 2: Explanation here</li>
              {/* Add more steps if needed */}
            </ul>
            <h3 className="product-modal-subtitle">Categories</h3>
            <div className="product-modal-categories">
              <span className="product-modal-category-tag">{product.product_category}</span>
            </div>
            <h3 className="product-modal-subtitle">Available Options</h3>
            <div className="product-modal-options">
              <select className="product-modal-select">
                <option>{product.product_title} - ${product.product_price}</option>
              </select>
            </div>
            <div className="product-modal-quantity">
              <label htmlFor="quantity">Amount to Add</label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div>
            <div className="product-modal-total">
              Total: ${(quantity * product.product_price).toFixed(2)}
            </div>
            <button className="add-to-cart-button" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
