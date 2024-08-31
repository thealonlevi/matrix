import React, { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import './styles/CreateGroupForm.css'; 
import { checkAdminPermission } from './utils/checkAdminPermissions'; 
import { createGroup } from './utils/groupUtils'; // Import createGroup utility
import { useNavigate } from 'react-router-dom';
import { useNotification } from './utils/Notification'; // Import useNotification hook

const CreateGroupForm = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState(''); // State for group description
  const [imageUrl, setImageUrl] = useState(null);
  const [productIds, setProductIds] = useState(''); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { showNotification } = useNotification(); // Use the notification context
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const hasPermission = await checkAdminPermission();
        console.log('Admin permission check:', hasPermission);

        if (!hasPermission) {
          showNotification('Access denied. Redirecting...', 'error');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking permission:', error);
        showNotification('An error occurred during permission verification.', 'error');
      }
    };

    verifyAccess();
  }, [navigate, showNotification]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !imageUrl) {
      showNotification('Title and image are required.', 'error');
      return;
    }

    setError(null);
    console.log('Creating group with title:', title);

    const productIdsArray = productIds ? productIds.split(',').map(id => id.trim()) : [];

    try {
      const groupDetails = {
        title,
        category,
        description,
        image_url: imageUrl,
        product_ids: productIdsArray,
      };
      
      const response_unprocessed = await createGroup(groupDetails); // Use createGroup from groupUtils
      const response = JSON.parse(response_unprocessed.body);
      console.log('Group created successfully:', response);
      showNotification(`${response}`, 'success');
      navigate('/admin/products'); 
    } catch (error) {
      console.error('Error creating group:', error);
      showNotification(`Error creating group: ${error.message}`, 'error');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="create-group-page">
      <div className="create-group-container">
        <h2 className="form-header">Create a New Product Group</h2>
        <form onSubmit={handleSubmit} className="group-form">
          <div className="form-group">
            <label>Title:</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Category (Optional):</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="form-group full-width">
            <label>Description:</label> {/* New input for group description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description"
            />
          </div>
          <div className="form-group full-width">
            <label>Product IDs (comma-separated, optional):</label>
            <input
              type="text"
              value={productIds}
              onChange={(e) => setProductIds(e.target.value)}
              placeholder="e.g., 1, 2, 3"
            />
          </div>
          <div className="upload-section">
            <h3>Upload an Image</h3>
            <ImageUpload onUploadSuccess={(url) => setImageUrl(url)} />
          </div>
          <button type="submit" className="submit-button">Create Group</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreateGroupForm;
