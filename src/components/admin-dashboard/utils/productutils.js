// productutils.js

export const toggleGroupExpansion = (groupId, expandedGroups, setExpandedGroups) => {
    setExpandedGroups((prevExpandedGroups) =>
      prevExpandedGroups.includes(groupId)
        ? prevExpandedGroups.filter((id) => id !== groupId)
        : [...prevExpandedGroups, groupId]
    );
  };
  
  export const handleDeleteProduct = async (productId, products, setProducts, setError, deleteProduct) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        setProducts(products.filter((product) => product.product_id !== productId));
      } catch (error) {
        setError(`Error deleting product with ID: ${productId}`);
      }
    }
  };
  
  export const handleToggleProductVisibility = async (productId, products, setProducts, setError, toggleProductVisibility) => {
    try {
      await toggleProductVisibility(productId);
      setProducts(
        products.map((product) =>
          product.product_id === productId
            ? { ...product, visible: !product.visible }
            : product
        )
      );
    } catch (error) {
      setError(`Error toggling visibility for product ID: ${productId}`);
    }
  };
  