import React, { useState } from 'react';
import './styles/ImageUpload.css'; // Ensure the CSS is imported

const ImageUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('No file chosen');

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : 'No file chosen');

    if (selectedFile) {
      await handleUpload(selectedFile);
    }
  };

  const handleUpload = async (fileToUpload) => {
    if (!fileToUpload) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(fileToUpload);
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
    <div className="custom-file-upload">
      <label htmlFor="file-upload" className="upload-button">
        Choose File
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="file-input"
      />
      <span className="file-name">{fileName}</span>
      {uploading && <p className="uploading-message">Uploading...</p>}
      {error && <p className="error-message">{error}</p>}
      {imageUrl && (
        <div className="success-message">
          <p>Image uploaded successfully:</p>
          <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="view-link">
            View Image
          </a>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
