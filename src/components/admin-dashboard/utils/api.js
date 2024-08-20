// api.js

export const fetchProducts = async () => {
    const response = await fetch(
      'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_GetProductList'
    );
    if (!response.ok) {
      throw new Error(`Error fetching products: ${response.statusText}`);
    }
    const data = await response.json();
    return JSON.parse(data.body);
  };
  
  export const deleteProduct = async (productId) => {
    const response = await fetch(
      'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_DeleteProduct',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id: productId }),
      }
    );
  
    if (!response.ok) {
      const responseBody = await response.json();
      throw new Error(
        `Failed to delete product with ID: ${productId}. ${responseBody}`
      );
    }
  };
  
  export const toggleProductVisibility = async (productId) => {
    const response = await fetch(
      'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_ToggleVisibility',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id: productId }),
      }
    );
  
    if (!response.ok) {
      throw new Error(`Failed to toggle visibility for product ID: ${productId}`);
    }
  };

  export const createGroupAPI = async (groupDetails) => {
    const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_CreateGroup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupDetails),
    });
  
    if (!response.ok) {
      throw new Error(`Error creating group: ${response.statusText}`);
    }
  
    return await response.json();
  };
  
  export const appendProductGroupAPI = async (groupId, productId) => {
    const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_AppendProductGroup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ groupId, productId }),
    });
  
    if (!response.ok) {
      throw new Error(`Error appending product to group: ${response.statusText}`);
    }
  
    return await response.json();
  };
  
  