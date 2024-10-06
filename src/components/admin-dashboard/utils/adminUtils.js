import { checkAdminPermission } from './checkAdminPermissions'; // Import the permission utility
import { logRequest as logRequestApi, fetchProductDetails, modifyOrderStatusSQS, fetchOrderDetails, fetchOrdersCache, getProductList } from '../../../utils/api'; // Import necessary API functions

// Log a request using the API utility
export const logRequest = async (functionName, productId) => {
  try {
    const response = await logRequestApi(functionName, productId); // Use the logRequest function from api.js
    return true;
  } catch (error) {
    console.error('Error logging the request:', error);
    return false;
  }
};

// Fetch data using the API utility
export const fetchData = async (apiEndpoint, requestBody) => {
  try {
    // Use fetchProductDetails, fetchOrderDetails, etc., as needed
    const data = await fetchOrderDetails(requestBody); // Example: replace with the appropriate function
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

// Retrieve user ID for a given order ID from localStorage
export const getUserIdForOrder = (orderId) => {
  const orderUserIdList = JSON.parse(localStorage.getItem('orderUserIdList')) || [];
  const orderUserMap = orderUserIdList.find(item => item.orderId === orderId);

  if (orderUserMap) {
    return orderUserMap.userId;
  } else {
    console.error('User ID not found for this order.');
    return null;
  }
};

// Global variables to manage permission state
let hasPermissionCached = null;
let permissionCheckInProgress = false; // Flag to prevent concurrent permission checks

// Check permissions and fetch data securely with permission caching
export const checkPermissionAndFetchData = async (fetchCallback, logFunctionName, logProductId) => {
  if (hasPermissionCached !== null) {
    // If we already have the cached permission value, use it.
    if (!hasPermissionCached) throw new Error('Access denied: Admin permissions required.');
  } else {
    // If a permission check is already in progress, wait for it to complete.
    if (permissionCheckInProgress) {
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!permissionCheckInProgress) {
            clearInterval(interval);
            resolve();
          }
        }, 50); // Poll every 50ms to check if the permission check is complete
      });
    }

    // Check again if permission was cached after waiting
    if (hasPermissionCached === null) {
      permissionCheckInProgress = true;
      try {
        const hasPermission = await checkAdminPermission();
        hasPermissionCached = hasPermission; // Cache the permission result
        if (!hasPermission) throw new Error('Access denied: Admin permissions required.');
      } catch (error) {
        hasPermissionCached = false;
        console.error('Failed to check permissions:', error);
        throw error;
      } finally {
        permissionCheckInProgress = false; // Reset the flag once permission check is complete
      }
    } else {
      // If permission is cached after waiting, check again
      if (!hasPermissionCached) throw new Error('Access denied: Admin permissions required.');
    }
  }

  const logged = await logRequest(logFunctionName, logProductId);
  if (!logged) throw new Error('Failed to log the request');

  return await fetchCallback();
};

// Fetch product title by product ID, including group handling
export const getProductTitleById = (productId) => {
  console.log(`\n--- Fetching product title for Product ID: ${productId} ---`);

  let offlineProductList = localStorage.getItem('offlineProductList');

  // Parse the JSON string into an array
  try {
    offlineProductList = JSON.parse(offlineProductList);
  } catch (error) {
    console.error('Failed to parse offlineProductList:', error);
  }

  if (!Array.isArray(offlineProductList)) {
    console.error('offlineProductList is not an array:', offlineProductList);
    return `Product ID: ${productId}`;
  }

  console.log(`Offline product list loaded. Total products found: ${offlineProductList.length}`);

  if (productId.includes('/')) {
    const [groupId, subProductId] = productId.split('/');
    console.log(`Product ID is a group-based ID. Group ID: ${groupId}, Sub Product ID: ${subProductId}`);

    let group = offlineProductList.find(item => item.product_id.toString() === groupId.toString());

    if (group && Array.isArray(group.product_group)) {
      const product = group.product_group.find(product => product.product_id.toString() === subProductId.toString());
      if (product) {
        console.log(`Found product in group: ${product.product_title}`);
        return `${group.product_title} - ${product.product_title}`;  // Return combined title
      } else {
        console.warn(`Sub Product with ID: ${subProductId} not found in group with ID: ${groupId}.`);
        return `Product ID: ${productId}`;
      }
    } else {
      console.warn(`Group with ID: ${groupId} not found or product_group is not an array.`);
      return `Product ID: ${productId}`;
    }
  } else {
    console.log(`Product ID is a standalone ID. Searching for Product ID: ${productId}`);
    const product = offlineProductList.find(item => item.product_id.toString() === productId.toString());
    if (product) {
      console.log(`Found product: ${product.product_title}`);
      return product.product_title;
    } else {
      console.warn(`Product with ID: ${productId} not found in offlineProductList.`);
      return `Product ID: ${productId}`;
    }
  }
};

// Add a function to get group titles
export const getGroupTitleById = async (groupId) => {
  // This is a placeholder. Replace with an actual API call if needed.
  let offlineProductList = JSON.parse(localStorage.getItem('offlineProductList')) || [];

  const group = offlineProductList.find(item => item.product_id.toString() === groupId.toString());
  if (group) {
    return group.product_title;
  } else {
    console.warn(`Group with ID: ${groupId} not found.`);
    return `Group ID: ${groupId}`;
  }
};
