import React, { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import './styles/CreateProductForm.css'; 
import { checkAdminPermission } from './utils/checkAdminPermissions'; 
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from './utils/api'; 
import { appendProductToGroup } from './utils/groupUtils';
import { showNotification } from './utils/Notification';  // Import the showNotification function

const CreateProductForm = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [groupId, setGroupId] = useState('');
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const verifyAccessAndFetchGroups = async () => {
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
          const products = await fetchProducts();
          const groupProducts = products.filter(product => Array.isArray(product.product_group));
          setGroups(groupProducts);
          console.log('Groups fetched:', groupProducts);
        }
      } catch (error) {
        console.error('Error fetching groups or checking permission:', error);
        showNotification('An error occurred during permission verification or fetching groups.', 'error');
      }
    };

    verifyAccessAndFetchGroups();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !price) {
      showNotification('Title and Price are required.', 'error');
      return;
    }

    setError(null);
    console.log('Creating product with title:', title, 'and price:', price);

    try {
      const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_CreateProduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_category: category, 
          product_img_url: imageUrl || '', 
          product_price: parseFloat(price),
          product_title: title,
          product_description: description,  
        }),
      });

      if (response.ok) {
        const data = JSON.parse((await response.json()).body);
        console.log('Product created successfully:', data.product_id);
        showNotification(`Product created successfully with ID: ${data.product_id}`, 'success');

        // Check if a group ID is selected and append the product to the group
        if (groupId) {
          try {
            await appendProductToGroup(groupId, data.product_id);
            console.log('Product assigned to group with ID:', groupId);
            showNotification(`Product successfully assigned to group with ID: ${groupId}`, 'success');
          } catch (error) {
            console.error('Error assigning product to group:', error);
            showNotification(`Error assigning product to group: ${error.message}`, 'error');
          }
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to create product:', errorData.error);
        showNotification(errorData.error || 'Failed to create product', 'error');
      }
    } catch (error) {
      console.error('Error during product creation:', error);
      showNotification(`Error: ${error.message}`, 'error');
    }
    navigate('/admin/products'); 
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="create-product-page">
      <div className="create-product-container">
        <h2 className="form-header">Create a New Product</h2>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Title:</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Category (Optional):</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Price:</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="form-group full-width">
            <label>Description (Optional):</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
            />
          </div>
          <div className="upload-section">
            <h3>Upload an Image (Optional)</h3>
            <ImageUpload onUploadSuccess={(url) => setImageUrl(url)} />
          </div>
          <div className="form-group full-width">
            <label>Assign to Group (Optional):</label>
            <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
              <option value="">Select a Group</option>
              {groups.map((group) => (
                <option key={group.product_id} value={group.product_id}>
                  {group.product_title} (ID: {group.product_id})
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="submit-button">Create Product</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreateProductForm;
