// productutils.js

export const toggleGroupExpansion = (groupId, expandedGroups, setExpandedGroups) => {
    setExpandedGroups((prevExpandedGroups) =>
      prevExpandedGroups.includes(groupId)
        ? prevExpandedGroups.filter((id) => id !== groupId)
        : [...prevExpandedGroups, groupId]
    );
  };
  
  export const handleDeleteProduct = async (productId, products, setProducts, setError) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_DeleteProduct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product_id: String(productId)}), // Pass product_id in request body
        });
  
        // Check if the response is successful
        if (!response.ok) {
          throw new Error(`Failed to delete product with ID: ${productId}`);
        }
  
        // If successful, remove the product from the list
        setProducts(products.filter((product) => product.product_id !== productId));
      } catch (error) {
        setError(`Error deleting product with ID: ${productId} - ${error.message}`);
      }
    }
  };
  
  
  export const handleToggleProductVisibility = async (productId, products, setProducts, setError) => {
    try {
      // Make the API call to toggle product visibility
      const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_ToggleVisibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product_id: productId.toString() }) // Convert product ID to string
      });
  
      if (!response.ok) {
        throw new Error(`Failed to toggle visibility for product ID: ${productId}`);
      }
  
      // Update the local state to reflect the new visibility status
      setProducts(
        products.map((product) =>
          product.product_id === productId
            ? { ...product, visible: !product.visible }
            : product
        )
      );
    } catch (error) {
      setError(`Error toggling visibility for product ID: ${productId} - ${error.message}`);
    }
  };
  
  