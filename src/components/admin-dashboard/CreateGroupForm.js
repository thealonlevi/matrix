import React, { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import './styles/CreateGroupForm.css';
import { checkAdminPermission } from './utils/checkAdminPermissions'; 
import { createGroup } from './utils/groupUtils'; // Import createGroup utility
import { useNavigate } from 'react-router-dom';

const CreateGroupForm = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState(''); // New state for group description
  const [imageUrl, setImageUrl] = useState(null);
  const [productIds, setProductIds] = useState(''); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const hasPermission = await checkAdminPermission();

        if (!hasPermission) {
          setError('Page not found.');
          setTimeout(() => {
            navigate('/'); 
          }, 2000);
        } else {
          setLoading(false);
        }
      } catch (error) {
        setError('An error occurred during permission verification.');
      }
    };

    verifyAccess();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !imageUrl || !productIds) {
      setError('Title, image, and at least one product ID are required.');
      return;
    }

    setError(null);

    const productIdsArray = productIds.split(',').map(id => id.trim());

    try {
      const groupDetails = {
        title,
        category,
        description, // Include description in the group details
        image_url: imageUrl,
        product_ids: productIdsArray,
      };
      
      const response = await createGroup(groupDetails); // Use createGroup from groupUtils
      alert(`Group created successfully with ID: ${response.product_id}`);
      navigate('/admin/products'); 
    } catch (error) {
      setError(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="create-group-container">
      <h2 className="form-header">Create a New Product Group</h2>
      <form onSubmit={handleSubmit} className="group-form">
        <div className="form-group">
          <label>Title:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Category (Optional):</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Description:</label> {/* New input for group description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter group description"
          />
        </div>
        <div className="form-group">
          <label>Product IDs (comma-separated):</label>
          <input
            type="text"
            value={productIds}
            onChange={(e) => setProductIds(e.target.value)}
            placeholder="e.g., 1, 2, 3"
          />
        </div>
        <div className="form-group">
          <h3>Upload an Image</h3>
          <ImageUpload onUploadSuccess={(url) => setImageUrl(url)} />
        </div>
        <button type="submit" className="submit-button">Create Group</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default CreateGroupForm;
