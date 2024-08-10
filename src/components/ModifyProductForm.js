import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ModifyProductForm.css';

const ModifyProductForm = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [title, setTitle] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (productId) {
      fetchProductDetails(productId);
    }
  }, [productId]);

  const fetchProductDetails = async (id) => {
    try {
      console.log(`Fetching details for product ID: ${id}`);

      const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchProductDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id: id }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Raw response data:', data);

        const parsedBody = JSON.parse(data.body);
        console.log('Parsed response body:', parsedBody);

        setProduct(parsedBody);
        setCategory(parsedBody.product_category);
        setPrice(parsedBody.product_price);
        setTitle(parsedBody.product_title);
        setImgUrl(parsedBody.product_img_url);
      } else {
        setError('Failed to fetch product details');
        console.error('Fetch failed with status:', response.status);
      }
    } catch (error) {
      setError('Error fetching product details: ' + error.message);
      console.error('Error during fetch:', error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    setImageFile(file);

    // Simulate image upload and get URL (in a real scenario, upload to S3 and get the URL)
    const simulatedImageUrl = URL.createObjectURL(file);
    setImgUrl(simulatedImageUrl);
  };

  const handleSave = async () => {
    try {
      console.log('Saving changes...');
      console.log({
        product_id: productId,
        product_category: category,
        product_price: price,
        product_title: title,
        product_img_url: imgUrl,
      });

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
          product_img_url: imgUrl,
        }),
      });

      if (response.ok) {
        alert(`Product updated successfully`);
        console.log('Product updated successfully');
        navigate('/admin/products');
      } else {
        setError('Failed to update product');
        console.error('Update failed with status:', response.status);
      }
    } catch (error) {
      setError('Error updating product: ' + error.message);
      console.error('Error during update:', error);
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
        <p>Loading product details...</p>
      )}
    </div>
  );
};

export default ModifyProductForm;
