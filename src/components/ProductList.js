import React, { useEffect, useState, useMemo } from 'react';
import '../styles/ProductList.css';
import ShoppingCartIcon from '../assets/icons/white_shopping_cart.png';
import RedEyeIcon from '../assets/icons/red_eye.png';
import BlueEyeIcon from '../assets/icons/blue_eye.png';
import ProductDetailsModal from './ProductDetailsModal'; // Import the modal component
import { getProductList } from '../utils/api'; // Import the API utility function

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // State for selected product
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Starting to fetch products...');
    
    const fetchProducts = async () => {
      try {
        const data = await getProductList(); // Use API utility function to fetch product list
        console.log('Fetched product list:', data);

        if (data) {
          const productsWithDescriptions = data.map((product) => ({
            ...product,
            product_description: product.product_description || '', // Default to empty string if undefined
            visible: product.visible !== undefined ? product.visible : true // Default to true if undefined
          }));

          // Filter out products that are not visible
          const visibleProducts = productsWithDescriptions.filter(product => product.visible);
          setProducts(visibleProducts);

          // Save the visible products to local storage
          localStorage.setItem('visible_products', JSON.stringify(visibleProducts));
        } else {
          console.warn('No data found in the response.');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
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

  // Function to calculate the price range for a group (memoized)
  const getPriceRange = useMemo(() => (group) => {
    const prices = group.map(p => p.product_price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return `$${minPrice} - $${maxPrice}`;
  }, []);

  // Function to calculate total stock for a product group (memoized)
  const getTotalStock = useMemo(() => (group) => {
    return group.reduce((total, product) => total + (product.available_stock_count || 0), 0);
  }, []);

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="product-list">
      {products.length > 0 ? (
        products.map((product, index) => {
          // Check if the product has a product_group array
          const isGroup = Array.isArray(product.product_group);

          const price = isGroup 
            ? getPriceRange(product.product_group)
            : (product.product_price !== undefined && !isNaN(product.product_price)
                ? `$${parseFloat(product.product_price).toFixed(2)}`
                : 'Price Unavailable');

          const stock = isGroup 
            ? getTotalStock(product.product_group)
            : (product.available_stock_count !== undefined ? product.available_stock_count : '0');

          return (
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
                    <span>In Stock: {stock}</span>
                  </div>
                  <p className="product-price">
                    {price}
                  </p>
                </div>
                <button
                  className={`buy-now-button ${
                    index % 2 === 0 ? 'buy-now-button-red' : 'buy-now-button-blue'
                  }`}
                  onClick={() => handleOpenModal(product)} // Open modal on click
                >
                  <img src={ShoppingCartIcon} alt="cart" />
                  {isGroup ? 'View Options' : 'Buy Now'}
                </button>
              </div>
            </div>
          );
        })
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
