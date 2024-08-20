import { createGroupAPI, appendProductGroupAPI } from './api'; // Assuming you have API calls in the `api.js` file

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
