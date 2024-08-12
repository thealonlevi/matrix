import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ProductDetails.css';
import { useCart } from './cart/CartContext'; // Import the CartContext hook

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
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
                    console.log("Product details fetched: ", data);

                    // Check the structure of `data.body` and ensure it's parsed correctly.
                    const parsedData = JSON.parse(data.body);
                    console.log("Parsed product details: ", parsedData);

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
            console.log("Adding to cart:", {
                product_id: product.product_id,
                quantity: quantity
            });
            addToCart({
                product_id: product.product_id,
                quantity: quantity
            });
            navigate('/cart'); // Redirect to cart page after adding to cart
        } else {
            console.error("Product details not loaded yet");
        }
    };


  return (
    <div className="product-details-container">
      {product ? (
        <>
          <img src={product.product_img_url} alt={product.product_title} className="product-details-image" />
          <h2 className="product-details-title">{product.product_title}</h2>
          <p className="product-details-category">{product.product_category}</p>
          <p className="product-details-price">${product.product_price}</p>
          <div className="product-details-quantity">
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="number"
              id="quantity"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
          </div>
          <button className="add-to-cart-button" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </>
      ) : (
        <p>{error ? error : 'Loading product details...'}</p>
      )}
    </div>
  );
};

export default ProductDetails;
