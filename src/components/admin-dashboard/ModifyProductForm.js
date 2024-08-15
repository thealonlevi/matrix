import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './styles/ModifyProductForm.css';
import { checkAdminPermission } from './utils/checkAdminPermissions'; // Import the utility function

const ModifyProductForm = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // New state for product description
  const [imgUrl, setImgUrl] = useState('');
  const [imageFile, setImageFile] = useState(null); // Image file
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAccessAndFetchProduct = async () => {
      try {
        const hasPermission = await checkAdminPermission();

        if (!hasPermission) {
          setError('Page not found.');
          setTimeout(() => {
            navigate('/'); // Redirect to the home page after 2 seconds
          }, 2000);
        } else if (productId) {
          fetchProductDetails(productId);
        }
      } catch (error) {
        setError('An error occurred during permission verification.');
      }
    };

    verifyAccessAndFetchProduct();
  }, [productId, navigate]);

  const fetchProductDetails = async (id) => {
    try {
      const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchProductDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id: id }),
      });

      if (response.ok) {
        const data = await response.json();
        const parsedBody = JSON.parse(data.body);

        console.log("Parsed product details:", parsedBody);  // Log parsed data

        setProduct(parsedBody);
        setCategory(parsedBody.product_category);
        setPrice(parsedBody.product_price);
        setTitle(parsedBody.product_title);
        setDescription(parsedBody.product_description || ''); // Set description, default to empty string
        setImgUrl(parsedBody.product_img_url);
      } else {
        setError('Failed to fetch product details');
      }
    } catch (error) {
      setError('Error fetching product details: ' + error.message);
      console.error("Fetch error:", error);  // Log error message
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setImageFile(file);

    // Simulate image upload and get URL (in a real scenario, upload to S3 and get the URL)
    const simulatedImageUrl = URL.createObjectURL(file);
    setImgUrl(simulatedImageUrl);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_ModifyProductDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          product_category: category,
          product_price: price,
          product_title: title,
          product_description: description, // Include product description
          product_img_url: imgUrl,
        }),
      });

      if (response.ok) {
        alert(`Product updated successfully`);
        navigate('/admin/products');
      } else {
        setError('Failed to update product');
      }
    } catch (error) {
      setError('Error updating product: ' + error.message);
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  return (
    <div className="modify-product-form-container">
      <h2>Modify Product Details</h2>
      {error && <p className="error-message">{error}</p>}
      {product ? (
        <>
          <div className="form-group">
            <label>Title:</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Category:</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Price:</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Description:</label> {/* New input for product description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
            />
          </div>
          <div className="form-group">
            <label>Current Image:</label>
            <div className="image-preview">
              <img src={imgUrl} alt="Product" />
            </div>
            <label>Upload New Image:</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          <button className="save-button" onClick={handleSave}>Save Changes</button>
          <button className="cancel-button" onClick={handleCancel}>Cancel</button>
        </>
      ) : (
        <p>{error ? error : 'Loading product details...'}</p>
      )}
    </div>
  );
};

export default ModifyProductForm;
