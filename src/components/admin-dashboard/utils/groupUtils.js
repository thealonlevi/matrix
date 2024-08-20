import { createGroupAPI, appendProductGroupAPI, detachProductGroupAPI } from './api';

export const createGroup = async (groupDetails) => {
  try {
    const response = await createGroupAPI(groupDetails);
    return response; // Return response or any necessary data
  } catch (error) {
    throw new Error(`Failed to create group: ${error.message}`);
  }
};

export const appendProductToGroup = async (groupId, productId) => {
  try {
    const response = await appendProductGroupAPI(groupId, productId);
    return response; // Return response or any necessary data
  } catch (error) {
    throw new Error(`Failed to append product to group: ${error.message}`);
  }
};

// Add the new function here:
export const detachProductFromGroup = async (groupId, productId) => {
  try {
    const response = await detachProductGroupAPI(groupId, productId);
    return response; // Return response or any necessary data
  } catch (error) {
    throw new Error(`Failed to detach product from group: ${error.message}`);
  }
};
