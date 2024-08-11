// src/components/CreateProductForm.js
import React, { useState } from 'react';
import ImageUpload from './ImageUpload';
import './styles/CreateProductForm.css';  // Import the CSS file

const CreateProductForm = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !category || !price || !imageUrl) {
      setError('All fields are required, and an image must be uploaded.');
      return;
    }

    setError(null);

    try {
      const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_CreateProduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_category: category,
          product_img_url: imageUrl,
          product_price: parseFloat(price),
          product_title: title,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Product created successfully with ID: ${data.product_id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create product');
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
    }
  };

  return (
    <div className="create-product-container">
      <h2 className="form-header">Create a New Product</h2>
      <form onSubmit={handleSubmit} className="product-form">
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
          <h3>Upload an Image</h3>
          <ImageUpload onUploadSuccess={(url) => setImageUrl(url)} />
        </div>
        <button type="submit" className="submit-button">Create Product</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default CreateProductForm;
