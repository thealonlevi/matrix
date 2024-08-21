// src/components/admin-dashboard/utils/adminUtils.js
import { checkAdminPermission } from './checkAdminPermissions'; // Import the permission utility

export const logRequest = async (functionName, productId) => {
  try {
    const logResponse = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_Logging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ function_name: functionName, product_id: productId }),
    });

    if (logResponse.status === 200) {
      return true;
    } else {
      throw new Error('Failed to log the request');
    }
  } catch (error) {
    console.error('Error logging the request:', error);
    return false;
  }
};

export const fetchData = async (apiEndpoint, requestBody) => {
  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      return data.body;
    } else {
      throw new Error('Failed to fetch data from API');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

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

export const checkPermissionAndFetchData = async (fetchCallback, logFunctionName, logProductId) => {
  const hasPermission = await checkAdminPermission();
  if (!hasPermission) {
    throw new Error('Access denied: Admin permissions required.');
  }

  const logged = await logRequest(logFunctionName, logProductId);
  if (!logged) {
    throw new Error('Failed to log the request');
  }

  return await fetchCallback();
};


export const getProductTitleById = (productId) => {
    console.log(`Fetching product title for Product ID: ${productId}...`);
    const offlineProductList = JSON.parse(localStorage.getItem('offlineProductList')) || [];
    const product = offlineProductList.find(item => item.product_id.toString() === productId.toString());
  
    if (product) {
      console.log(`Found product: ${product.product_title}`);
      return product.product_title;
    } else {
      console.warn(`Product with ID: ${productId} not found in offlineProductList.`);
      return `Product ID: ${productId}`;
    }
  };
  