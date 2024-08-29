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
    console.log('Starting to fetch products...');

    const fetchProducts = async () => {
      try {
        const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_GetProductList');
        console.log('API response received:', response);

        const data = await response.json();
        console.log('Parsed JSON data:', data);

        if (data && data.body) {
          const parsedData = JSON.parse(data.body);
          console.log('Parsed product list:', parsedData);

          // Ensure that every product has a product_description, even if it's just an empty string
          const productsWithDescriptions = parsedData.map((product, index) => {
            console.log(`Processing product at index ${index}:`, product);

            // Log the full structure of the product for debugging
            console.log('Full product structure:', product);

            return {
              ...product,
              product_description: product.product_description || '', // Default to empty string if undefined
              visible: product.visible !== undefined ? product.visible : true // Default to true if undefined
            };
          });

          // Filter out products that are not visible
          const visibleProducts = productsWithDescriptions.filter(product => product.visible);
          setProducts(visibleProducts);
          console.log('Visible products set in state:', visibleProducts);

          // Save the visible products to local storage
          localStorage.setItem('visible_products', JSON.stringify(visibleProducts));
          console.log('Visible products saved to local storage.');

          // Save product titles to local storage for use in other components
          const productTitles = visibleProducts.reduce((acc, product) => {
            acc[product.product_id] = product.product_title;
            return acc;
          }, {});
          localStorage.setItem('product_titles', JSON.stringify(productTitles));
          console.log('Product titles saved to local storage.');
        } else {
          console.warn('No data body found in the response.');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleOpenModal = (product) => {
    console.log('Opening modal for product:', product);
    setSelectedProduct(product); // Set the selected product
    setIsModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    console.log('Closing modal');
    setIsModalOpen(false); // Close the modal
    setSelectedProduct(null); // Clear the selected product
  };

  // Function to calculate the price range for a group
  const getPriceRange = (group) => {
    console.log('Calculating price range for group:', group);
    const prices = group.map(p => {
      const price = p.product_price;
      console.log('Individual price in group:', price);
      return price;
    });

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    console.log(`Calculated price range: $${minPrice} - $${maxPrice}`);
    return `$${minPrice} - $${maxPrice}`;
  };

  // Function to calculate total stock for a product group
  const getTotalStock = (group) => {
    console.log('Calculating total stock for group:', group);
    return group.reduce((total, product) => {
      const stock = product.available_stock_count || 0; // Use stock count if available, else default to 0
      return total + stock;
    }, 0);
  };

  return (
    <div className="product-list">
      {products.length > 0 ? (
        products.map((product, index) => {
          // Check if the product has a product_group array
          const isGroup = Array.isArray(product.product_group) && product.product_group.length > 0;
          console.log(`Rendering product at index ${index}:`, product);
          console.log('Is this product a group?', isGroup);

          const price = isGroup 
            ? getPriceRange(product.product_group)
            : (product.product_price !== undefined && !isNaN(product.product_price)
                ? `$${parseFloat(product.product_price).toFixed(2)}`
                : 'Price Unavailable');

          const stock = isGroup 
            ? getTotalStock(product.product_group)
            : (product.available_stock_count !== undefined ? product.available_stock_count : '0');

          console.log(`Final price for rendering:`, price);
          console.log(`Final stock for rendering:`, stock);

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
