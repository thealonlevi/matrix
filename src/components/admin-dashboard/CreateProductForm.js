import React, { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import './styles/CreateProductForm.css'; // Import the CSS file
import { checkAdminPermission } from './utils/checkAdminPermissions'; // Import the utility function
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from './utils/api'; // Import the fetchProducts function
import { appendProductToGroup } from './utils/groupUtils';

const CreateProductForm = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [groupId, setGroupId] = useState('');
  const [groups, setGroups] = useState([]); // State to store all groups
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAccessAndFetchGroups = async () => {
      try {
        const hasPermission = await checkAdminPermission();

        if (!hasPermission) {
          setError('Page not found.');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setLoading(false);

          // Fetch all products to find groups
          const products = await fetchProducts();
          const groupProducts = products.filter(product => Array.isArray(product.product_group));
          setGroups(groupProducts);
        }
      } catch (error) {
        setError('An error occurred during permission verification or fetching groups.');
      }
    };

    verifyAccessAndFetchGroups();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only title and price are required
    if (!title || !price) {
      setError('Title and Price are required.');
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
          product_category: category, // Optional
          product_img_url: imageUrl || '', // Optional, default to empty string if not provided
          product_price: parseFloat(price),
          product_title: title,
          product_description: description,  // Optional
        }),
      });

      if (response.ok) {
        const data = JSON.parse((await response.json()).body);
        alert(`Product created successfully with ID: ${data.product_id}`);

        // Check if a group ID is selected and append the product to the group
        if (groupId) {
          try {
            await appendProductToGroup(groupId, data.product_id);
            alert(`Product successfully assigned to group with ID: ${groupId}`);
          } catch (error) {
            setError(`Error assigning product to group: ${error.message}`);
          }
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create product');
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
    }
    navigate('/admin/products'); 
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
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
        <div className="form-group">
          <label>Description (Optional):</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter product description"
          />
        </div>
        <div className="form-group">
          <h3>Upload an Image (Optional)</h3>
          <ImageUpload onUploadSuccess={(url) => setImageUrl(url)} />
        </div>
        <div className="form-group">
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
  );
};

export default CreateProductForm;
