import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/ModifyProductForm.css';
import { checkAdminPermission, fetchProductDetails, modifyProductDetails, uploadPublicImage } from '../../utils/api'; // Import API functions from api.js

const ModifyProductForm = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);

  // Extract productId at the top level so it's available throughout the component
  const href = window.location.href;
  const productId = href.split('/admin/modifyproduct/')[1];

  useEffect(() => {
    const verifyAccessAndFetchProduct = async () => {
      try {
        const hasPermission = await checkAdminPermission();

        if (!hasPermission) {
          setError('Page not found.');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else if (productId) {
          await fetchProductDetailsHandler(productId);
        }
      } catch (error) {
        setError('An error occurred during permission verification.');
      }
    };

    verifyAccessAndFetchProduct();
  }, [productId, navigate]);

  const fetchProductDetailsHandler = async (id) => {
    try {
      const data = await fetchProductDetails(id); // Use API function to fetch product details

      setProduct(data);
      setCategory(data.product_category);
      setPrice(data.product_price);
      setTitle(data.product_title);
      setDescription(data.product_description || '');
      setImgUrl(data.product_img_url);
    } catch (error) {
      setError('Error fetching product details: ' + error.message);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    setImageFile(file);

    try {
      // Upload the image using the API function and get the URL
      const imageUrl = await uploadPublicImage(file);
      setImgUrl(imageUrl); // Set the new image URL
    } catch (error) {
      setError('Error uploading image: ' + error.message);
    }
  };

  const handleSave = async () => {
    try {
      // Use API function to modify product details
      await modifyProductDetails(productId, {
        product_category: category,
        product_price: price,
        product_title: title,
        product_description: description,
        product_img_url: imgUrl,
      });

      alert(`Product updated successfully`);
      navigate('/admin/products');
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
            <label>Description:</label>
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
