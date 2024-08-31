import React, { useState } from 'react';
import '../styles/ProductDetailsModal.css';
import { useCart } from './cart/CartContext';

const ProductDetailsModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState(product.product_group ? product.product_group[0] : product);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    const availableStock = selectedOption.available_stock_count || 0; // Default to 0 if undefined

    if (quantity > availableStock) {
      alert(`Only ${availableStock} items available in stock. Please reduce the quantity.`);
      return;
    }

    addToCart({
      product_id: selectedOption.product_id,
      group_id: product.product_group ? product.product_id : null, // Include group_id if the product belongs to a group
      product_title: selectedOption.product_title,
      product_price: selectedOption.product_price,
      product_img_url: selectedOption.product_img_url,
      quantity
    });
    onClose(); // Close the modal after adding to cart
  };

  const handleOptionChange = (e) => {
    const selectedOptionId = parseFloat(e.target.value); // Convert the value to a float to match the product_id type
    const option = product.product_group.find(opt => opt.product_id === selectedOptionId);
    setSelectedOption(option);
    setQuantity(1); // Reset quantity to 1 when changing options
  };

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    const availableStock = selectedOption.available_stock_count || 0; // Default to 0 if undefined

    if (newQuantity > availableStock) {
      alert(`Only ${availableStock} items available in stock. Please reduce the quantity.`);
      setQuantity(availableStock);
    } else {
      setQuantity(newQuantity);
    }
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
            {product.product_group && (
              <>
                <h3 className="product-modal-subtitle">Available Options</h3>
                <div className="product-modal-options">
                  <select className="product-modal-select" onChange={handleOptionChange}>
                    {product.product_group.map(option => (
                      <option key={option.product_id} value={option.product_id}>
                        {`${option.product_title} - $${option.product_price} - ${option.available_stock_count || 0} In stock`}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div className="product-modal-quantity">
              <label htmlFor="quantity">Amount to Add</label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
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
