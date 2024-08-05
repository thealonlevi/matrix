import React, { useEffect, useState } from 'react';
import '../styles/ProductList.css';
import ShoppingCartIcon from '../assets/icons/white_shopping_cart.png';
import RedEyeIcon from '../assets/icons/red_eye.png';
import BlueEyeIcon from '../assets/icons/blue_eye.png';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_GetProductList')
      .then(response => response.json())
      .then(data => {
        if (data && data.body) {
          try {
            const parsedData = JSON.parse(data.body);
            console.log(parsedData);
            setProducts(parsedData);
          } catch (error) {
            console.error("Error parsing data:", error);
          }
        }
      })
      .catch(error => console.error('Error fetching products:', error));
  }, []);

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
    </div>
  );
};

export default ProductList;
