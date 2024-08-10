// src/components/ImageUpload.js
import React, { useState } from 'react';

const ImageUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1];

        // Send the POST request to the API Gateway
        const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_PublicImageUpload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ body: base64Data }),
        });

        if (response.ok) {
          const responseData = await response.json();
          const parsedBody = JSON.parse(responseData.body);
          const imageUrl = parsedBody.imageUrl;
          setImageUrl(imageUrl);
          onUploadSuccess(imageUrl); // Pass the URL to the parent component
          console.log("Image URL:", imageUrl);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to upload image');
        }
        setUploading(false);
      };
      reader.onerror = (error) => {
        setError('Error reading file: ' + error.message);
        setUploading(false);
      };
    } catch (error) {
      setError('Error uploading file: ' + error.message);
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Upload an Image</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {imageUrl && (
        <div>
          <p>Image uploaded successfully:</p>
          <a href={imageUrl} target="_blank" rel="noopener noreferrer">
            View Image
          </a>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
