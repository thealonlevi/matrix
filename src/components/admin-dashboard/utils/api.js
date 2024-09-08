// Import necessary functions from api.js
import { 
  getProductList,
  deleteProduct as apiDeleteProduct,
  toggleProductVisibility as apiToggleVisibility,
  createProductGroup as apiCreateGroup,
  appendProductToGroup as apiAppendProductGroup,
  detachProductFromGroup as apiDetachProductGroup
} from '../../../utils/api';

export const fetchProducts = async () => {
  try {
    // Use the getProductList function from api.js
    const products = await getProductList();
    return products;
  } catch (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }
};

export const deleteProduct = async (productId) => {
  try {
    // Use the deleteProduct function from api.js
    await apiDeleteProduct(productId);
  } catch (error) {
    throw new Error(`Failed to delete product with ID: ${productId}. ${error.message}`);
  }
};

export const toggleProductVisibility = async (productId) => {
  try {
    // Use the toggleVisibility function from api.js
    await apiToggleVisibility(productId);
  } catch (error) {
    throw new Error(`Failed to toggle visibility for product ID: ${productId}. ${error.message}`);
  }
};

export const createGroupAPI = async (groupDetails) => {
  try {
    // Use the createGroup function from api.js
    const response = await apiCreateGroup(groupDetails);
    return response;
  } catch (error) {
    throw new Error(`Error creating group: ${error.message}`);
  }
};

export const appendProductGroupAPI = async (groupId, productId) => {
  try {
    // Use the appendProductToGroup function from api.js
    const response = await apiAppendProductGroup(groupId, productId);
    return response;
  } catch (error) {
    throw new Error(`Error appending product to group: ${error.message}`);
  }
};

export const detachProductGroupAPI = async (groupId, productId) => {
  try {
    // Use the detachProductFromGroup function from api.js
    const response = await apiDetachProductGroup(groupId, productId);
    return response;
  } catch (error) {
    throw new Error(`Error detaching product from group: ${error.message}`);
  }
};
