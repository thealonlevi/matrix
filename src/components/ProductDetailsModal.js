import React, { useState } from 'react';
import '../styles/ProductDetailsModal.css';

const ProductDetailsModal = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState(product.product_group ? product.product_group[0] : product); // Default to first option in group

  if (!isOpen) return null;

  const handleAddToCart = () => {
    // Add the selected option to the cart with the specified quantity
    console.log(`Added ${quantity} of ${selectedOption.product_title} to the cart`);
    onClose(); // Close the modal after adding to cart
  };

  const handleOptionChange = (e) => {
    const selectedOptionId = parseFloat(e.target.value); // Convert the value to a float to match the product_id type
    const option = product.product_group.find(opt => opt.product_id === selectedOptionId);
    setSelectedOption(option);
  };

  const productPrice = parseFloat(selectedOption.product_price);

  return (
    <div className="product-modal-overlay">
      <div className="product-modal">
        <button className="close-button" onClick={onClose}>×</button>
        <div className="product-modal-content">
          <h2 className="product-modal-title">{product.product_title}</h2>
          <div className="product-modal-info-section">
            <p className="product-modal-description">{product.product_description || 'No description available.'}</p>
            <h3 className="product-modal-subtitle">Categories</h3>
            <div className="product-modal-categories">
              <span className="product-modal-category-tag">{product.product_category}</span>
            </div>
            <h3 className="product-modal-subtitle">Available Options</h3>
            <div className="product-modal-options">
              <select className="product-modal-select" onChange={handleOptionChange}>
                {product.product_group ? (
                  product.product_group.map(option => (
                    <option key={option.product_id} value={option.product_id}>
                      {option.product_title} - ${option.product_price}
                    </option>
                  ))
                ) : (
                  <option value={product.product_id}>
                    {product.product_title} - ${product.product_price}
                  </option>
                )}
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
              Total: ${(quantity * productPrice).toFixed(2)}
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
