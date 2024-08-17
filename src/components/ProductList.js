import React, { useEffect, useState } from 'react';
import '../styles/ProductList.css';
import ShoppingCartIcon from '../assets/icons/white_shopping_cart.png';
import RedEyeIcon from '../assets/icons/red_eye.png';
import BlueEyeIcon from '../assets/icons/blue_eye.png';
import ProductDetailsModal from './ProductDetailsModal'; // Import the modal component

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // State for selected product
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_GetProductList');
        const data = await response.json();
        
        if (data && data.body) {
          const parsedData = JSON.parse(data.body);

          // Ensure that every product has a product_description, even if it's just an empty string
          const productsWithDescriptions = parsedData.map(product => ({
            ...product,
            product_description: product.product_description || '', // Default to empty string if undefined
          }));

          setProducts(productsWithDescriptions);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleOpenModal = (product) => {
    setSelectedProduct(product); // Set the selected product
    setIsModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedProduct(null); // Clear the selected product
  };

  return (
    <div className="product-list">
      {products.length > 0 ? (
        products.map((product, index) => (
          <div
            key={index}
            className="product-card"
            style={{
              borderColor: index % 2 === 0 ? '#b94247' : '#4970f4',
              borderWidth: '2px',
              borderStyle: 'solid',
            }}
          >
            <img src={product.product_img_url} alt={product.product_title} className="product-image" />
            <div className="product-info">
              <p
                className="product-category"
                style={{ color: index % 2 === 0 ? '#b94247' : '#4970f4' }}
              >
                {product.product_category}
              </p>
              <h3 className="product-title">{product.product_title}</h3>
              <div className="product-details">
                <div
                  className="product-stock"
                  style={{ color: index % 2 === 0 ? '#b94247' : '#4970f4' }}
                >
                  <img src={index % 2 === 0 ? RedEyeIcon : BlueEyeIcon} alt="eye" />
                  <span>In Stock: {product.product_stock !== undefined ? product.product_stock : '0'}</span>
                </div>
                <p className="product-price">
                  {product.product_price !== undefined && !isNaN(product.product_price)
                    ? `$${product.product_price.toFixed(2)}`
                    : 'Price Unavailable'}
                </p>
              </div>
              <button
                className={`buy-now-button ${
                  index % 2 === 0 ? 'buy-now-button-red' : 'buy-now-button-blue'
                }`}
                onClick={() => handleOpenModal(product)} // Open modal on click
              >
                <img src={ShoppingCartIcon} alt="cart" />
                Buy Now
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No products found.</p>
      )}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ProductList;
