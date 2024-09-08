import React, { useState } from 'react';
import './styles/ImageUpload.css'; // Ensure the CSS is imported
import { uploadPublicImage } from '../../utils/api'; // Import the API function

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
        const base64Data = reader.result.split(',')[1]; // Get the base64 encoded string part

        // Use the `uploadPublicImage` function from `api.js`
        const imageUrl = await uploadPublicImage(base64Data); // Pass base64 data instead of the file object
        
        console.log("Image URL received from API:", imageUrl); // Debugging: Log the URL received from the API

        setImageUrl(imageUrl);
        onUploadSuccess(imageUrl); // Pass the URL to the parent component
        console.log("Image URL passed to parent component:", imageUrl); // Debugging: Confirm the URL passed to parent
      };
      reader.onerror = (error) => {
        setError('Error reading file: ' + error.message);
        setUploading(false);
      };
    } catch (error) {
      setError('Error uploading file: ' + error.message);
    } finally {
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
