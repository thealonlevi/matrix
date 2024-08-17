import React, { useState, useEffect } from 'react';
import ProductModal from './ProductDetailsModal'; // Import the new modal component
import '../styles/ProductDetails.css';
import { useCart } from './cart/CartContext'; // Import the CartContext hook

const ProductDetails = ({ productId, isOpen, onClose }) => {
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);
  const { addToCart } = useCart(); // Destructure addToCart from useCart

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchProductDetails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product_id: productId }),
        });

        if (response.ok) {
          const data = await response.json();
          const parsedData = JSON.parse(data.body);
          setProduct(parsedData);
        } else {
          setError('Failed to fetch product details');
        }
      } catch (error) {
        setError('Error fetching product details');
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleAddToCart = () => {
    if (product && product.product_id) {
      addToCart({
        product_id: product.product_id,
        quantity: quantity
      });
      onClose(); // Close the modal after adding to cart
    } else {
      console.error("Product details not loaded yet");
    }
  };

  return (
    <ProductModal
      product={product}
      isOpen={isOpen}
      onClose={onClose}
      onAddToCart={handleAddToCart}
      quantity={quantity}
      setQuantity={setQuantity}
    />
  );
};

export default ProductDetails;
