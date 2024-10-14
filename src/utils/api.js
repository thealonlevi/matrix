/**
 * Utility function to generate a unique request key based on URL, method, and body.
 */
import { fetchUserAttributes } from 'aws-amplify/auth';
const generateRequestKey = (url, method, body) => {
  const bodyString = JSON.stringify(body || {});
  console.log("Generated Request Key: ", bodyString);
  return `${method}:${url}:${bodyString}`;
};

/**
 * Utility function to check for duplicate requests.
 */
const isDuplicateRequest = (requestKey, timeout = 0.2*1000) => { // 5 minutes default timeout
  const requestInfo = localStorage.getItem(requestKey);
  if (requestInfo) {
    const { timestamp } = JSON.parse(requestInfo);
    const currentTime = new Date().getTime();
    if (currentTime - timestamp < timeout) {
      return true; // Duplicate request
    } else {
      localStorage.removeItem(requestKey); // Clean up expired entry
    }
  }
  return false;
};

/**
 * Utility function to store request in local storage.
 */
const storeRequestInLocalStorage = (requestKey) => {
  const requestInfo = {
    timestamp: new Date().getTime(),
  };
  localStorage.setItem(requestKey, JSON.stringify(requestInfo));
};

// API URL
const ADMIN_PERMISSION_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_AdminPermission';

/**
 * Function to check if a user has admin permission.
 * @param {string} email - The email of the user.
 * @param {string} userId - The user ID.
 * @returns {Promise} - Resolves with the response message if permission is granted or denied, rejects with an error message.
 */
export const checkAdminPermission = async (email, userId) => {
  try {
    const response = await fetch(ADMIN_PERMISSION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        userId: userId,
      }),
    });

    const data = await response.json();
    if (data.statusCode !== 200) {
      console.warn('Permission denied due to non-200 status code:', response.status);
      return 'Permission denied';  // Explicitly return 'Permission denied' for non-200 status codes
    }
    console.log(data);
    // Check if the body contains 'Permission granted'
    return data.body;  // Either 'Permission granted' or 'Permission denied'
  } catch (error) {
    console.error('Error checking admin permission:', error);
    throw new Error('Failed to check admin permission. Please try again later.');
  }
};

// API URL
const APPEND_PRODUCT_GROUP_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_AppendProductGroup';

/**
 * Function to append a product to a group.
 * @param {string} groupId - The ID of the group to which the product should be appended.
 * @param {string} productId - The ID of the product to append.
 * @returns {Promise} - Resolves with a success message or rejects with an error message.
 */
export const appendProductToGroup = async (groupId, productId) => {
  try {
    const response = await fetch(APPEND_PRODUCT_GROUP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        groupId: groupId,
        productId: productId,
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();

    return data.body;  // Success message or error message
  } catch (error) {
    console.error('Error appending product to group:', error);
    throw new Error('Failed to append product to group. Please try again later.');
  }
};

// API URL
const COUPON_CHECKER_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_CouponChecker';

/**
 * Function to check if a coupon code is valid and retrieve the discount percentage.
 * @param {string} couponCode - The coupon code to check.
 * @returns {Promise} - Resolves with the discount percentage if the coupon code is valid, rejects with an error message.
 */
export const checkCouponCode = async (couponCode) => {
  try {
    console.log("Checking ", couponCode)
    const response = await fetch(COUPON_CHECKER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coupon_code: couponCode,
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = JSON.parse((await response.json()).body);
    console.log(data.discount);

    if (data.discount !== undefined) {
        console.log(data.discount);
      return data.discount;  // Return the discount percentage
    } else {
      throw new Error(data.body);  // Return the error message if coupon code not found
    }
  } catch (error) {
    console.error('Error checking coupon code:', error);
    throw new Error('Failed to check coupon code. Please try again later.');
  }
};


// API URL
const CREATE_GROUP_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_CreateGroup';

/**
 * Function to create a new product group.
 * @param {string} title - The title of the group.
 * @param {string} category - The category of the group.
 * @param {string} imageUrl - The image URL of the group.
 * @param {Array<string>} productIds - The list of product IDs to add to the group.
 * @returns {Promise} - Resolves with a success message or rejects with an error message.
 */
export const createProductGroup = async (title, category, imageUrl, productIds) => {
  // Generate a unique request key for this API call
  const requestKey = generateRequestKey(CREATE_GROUP_API_URL, 'POST', {
    title,
    category,
    image_url: imageUrl,
    product_ids: productIds,
  });

  // Check if the request is a duplicate
  if (isDuplicateRequest(requestKey)) {
    console.warn('Duplicate request detected. Skipping API call.');
    throw new Error('Duplicate request detected. Please try again later.');
  }

  try {
    // Store the request in local storage to prevent duplicates
    storeRequestInLocalStorage(requestKey);

    const response = await fetch(CREATE_GROUP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
        category: category,
        image_url: imageUrl,
        product_ids: productIds,
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();

    return data.body;  // Success message or error message
  } catch (error) {
    console.error('Error creating product group:', error);
    throw new Error('Failed to create product group. Please try again later.');
  }
};


// API URL
const CREATE_ORDER_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_CreateOrder';

/**
 * Function to create a new order.
 * @param {string} userEmail - The email of the user placing the order.
 * @param {Array<Object>} orderContents - The list of products and their quantities for the order.
 * @param {string} [userId='GUEST'] - The ID of the user placing the order; defaults to 'GUEST'.
 * @param {string} [paymentMethod='Balance'] - The payment method for the order; defaults to 'Balance'.
 * @param {string} [couponCode=null] - The coupon code to apply for a discount; optional.
 * @param {string} [ipAddress='N/A'] - The IP address of the user; optional.
 * @param {string} [userAgent='Unknown'] - The user agent string; optional.
 * @param {string} [deviceType='Unknown'] - The device type (mobile, desktop, etc.); optional.
 * @returns {Promise} - Resolves with order creation details or rejects with an error message.
 */
export const createOrder = async (
  userEmail,
  orderContents,
  userId = 'GUEST',
  paymentMethod = 'Balance',
  couponCode = null,
  ipAddress = 'N/A',
  userAgent = 'Unknown',
  deviceType = 'Unknown'
) => {
  // Generate a unique request key for this API call
  const requestKey = generateRequestKey(CREATE_ORDER_API_URL, 'POST', {
    user_email: userEmail,
    order_contents: orderContents,
    user_id: userId,
    payment_method: paymentMethod,
    coupon_code: couponCode,
    ip_address: ipAddress,
    user_agent: userAgent,
    device_type: deviceType,
  });

  // Check if the request is a duplicate
  if (isDuplicateRequest(requestKey)) {
    console.warn('Duplicate request detected. Skipping API call.');
    throw new Error('Duplicate request detected. Please try again later.');
  }

  try {
    // Store the request in local storage to prevent duplicates
    storeRequestInLocalStorage(requestKey);

    console.log(userEmail);
    console.log(orderContents);
    console.log(userId);
    const response = await fetch(CREATE_ORDER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_email: userEmail,
        order_contents: orderContents,
        user_id: userId,
        payment_method: paymentMethod,
        coupon_code: couponCode,
        ip_address: ipAddress,
        user_agent: userAgent,
        device_type: deviceType,
      }),
    });
    console.log(response);

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = JSON.parse((await response.json()).body);
    console.log(data);
    if (data.order_id) {
      console.log('True');
      return {
        message: data.message,
        orderId: data.order_id,
        amountToBePaid: data.amount_to_be_paid,
      }; // Return the order creation details
    } else {
      throw new Error(data.error || 'Failed to create order.');
    }
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order. Please try again later.');
  }
};


// Corrected `createProduct` function
const CREATE_PRODUCT_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_CreateProduct';

/**
 * Function to create a new product.
 * @param {string} productTitle - The title of the product.
 * @param {number} productPrice - The price of the product.
 * @param {string} [productCategory=''] - The category of the product; optional.
 * @param {string} [productImgUrl=''] - The image URL of the product; optional.
 * @param {string} [productDescription=''] - The description of the product; optional.
 * @returns {Promise} - Resolves with the new product ID or rejects with an error message.
 */
export const createProduct = async (
  productTitle,
  productPrice,
  productCategory = '',
  productImgUrl = '',
  productDescription = ''
) => {
  // Generate a unique request key for this API call
  const requestKey = generateRequestKey(CREATE_PRODUCT_API_URL, 'POST', {
    product_title: productTitle,
    product_price: productPrice,
    product_category: productCategory,
    product_img_url: productImgUrl,
    product_description: productDescription,
  });

  // Check if the request is a duplicate
  if (isDuplicateRequest(requestKey)) {
    console.warn('Duplicate request detected. Skipping API call.');
    throw new Error('Duplicate request detected. Please try again later.');
  }

  try {
    // Store the request in local storage to prevent duplicates
    storeRequestInLocalStorage(requestKey);

    const response = await fetch(CREATE_PRODUCT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_title: productTitle,
        product_price: productPrice,
        product_category: productCategory,
        product_img_url: productImgUrl,
        product_description: productDescription,
      }),
    });

    if (!response.ok) {
      // Handle non-200 responses
      const errorData = await response.json();
      throw new Error(errorData.error || 'Unexpected response from the server.');
    }

    // Correctly parse the response body
    const data = await response.json();
    const parsedData = JSON.parse(data.body); // Correctly parse the 'body' field from the response

    if (parsedData && parsedData.product_id !== undefined) {
      return parsedData.product_id; // Return the new product ID
    } else {
      throw new Error('Failed to create product. Product ID not found in response.');
    }
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product. Please try again later.');
  }
};



// API URL
const DELETE_PRODUCT_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_DeleteProduct';

/**
 * Function to delete a product or a product within a group.
 * @param {string} productId - The ID of the product to delete. Can include a group ID in the format "groupId/productId".
 * @returns {Promise} - Resolves with a success message or rejects with an error message.
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await fetch(DELETE_PRODUCT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();

    if (data.body.includes('deleted successfully')) {
      return data.body;  // Return the success message
    } else {
      throw new Error(data.body || 'Failed to delete product.');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product. Please try again later.');
  }
};

// API URL
const DETACH_PRODUCT_GROUP_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_DetachProductGroup';

/**
 * Function to detach a product from a group and add it back to the main product list.
 * @param {string} groupId - The ID of the group from which the product should be detached.
 * @param {string} productId - The ID of the product to detach.
 * @returns {Promise} - Resolves with a success message or rejects with an error message.
 */
export const detachProductFromGroup = async (groupId, productId) => {
  try {
    const response = await fetch(DETACH_PRODUCT_GROUP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        group_id: groupId,
        product_id: productId,
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();

    if (data.body.includes('removed from group')) {
      return data.body;  // Return the success message
    } else {
      throw new Error(data.body || 'Failed to detach product from group.');
    }
  } catch (error) {
    console.error('Error detaching product from group:', error);
    throw new Error('Failed to detach product from group. Please try again later.');
  }
};


// API URL
const FETCH_ORDER_DETAILS_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchOrderDetails';

/**
 * Function to fetch order details for a given order ID.
 * @param {string} orderId - The ID of the order to fetch details for.
 * @returns {Promise} - Resolves with the order details or rejects with an error message.
 */
export const fetchOrderDetails = async (orderId) => {
  try {
    const response = await fetch(FETCH_ORDER_DETAILS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: orderId,
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();
    console.log("ORDER DETAILS: ", data);
    return data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw new Error('Failed to fetch order details. Please try again later.');
  }
};

// API URL
const FETCH_ORDERS_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchOrders';

/**
 * Function to fetch all orders from the database.
 * @returns {Promise} - Resolves with the list of all orders or rejects with an error message.
 */
export const fetchAllOrders = async () => {
  try {
    const response = await fetch(FETCH_ORDERS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return JSON.parse(data.body);  // Return the list of orders
    } else {
      throw new Error(data.body || 'Failed to fetch orders.');
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to fetch orders. Please try again later.');
  }
};

// API URL
const FETCH_ORDERS_CACHE_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchOrdersCache';

/**
 * Function to fetch cached orders if the client timestamp is outdated.
 * @param {string} clientTimestamp - The timestamp of the last known update on the client side.
 * @returns {Promise} - Resolves with the status of the cache ('up-to-date' or 'updated') and data if updated, or rejects with an error message.
 */
export const fetchOrdersCache = async (clientTimestamp) => {
  try {
    const response = await fetch(FETCH_ORDERS_CACHE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_timestamp: clientTimestamp,
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();

    if (data.body && data.body.status) {
      return data.body;  // Return the cache status and data
    } else {
      throw new Error('Failed to fetch orders cache.');
    }
  } catch (error) {
    console.error('Error fetching orders cache:', error);
    throw new Error('Failed to fetch orders cache. Please try again later.');
  }
};

// API URL
const FETCH_PRODUCT_DETAILS_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchProductDetails';

/**
 * Function to fetch product details for a given product ID.
 * @param {string} productId - The ID of the product to fetch details for. Can include a group ID in the format "groupId/productId".
 * @returns {Promise} - Resolves with the product details or rejects with an error message.
 */
export const fetchProductDetails = async (productId) => {
  try {
    const response = await fetch(FETCH_PRODUCT_DETAILS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();

    if (data.body && !data.body.includes('not found')) {
      return JSON.parse(data.body);  // Return the product details
    } else {
      throw new Error(data.body || 'Failed to fetch product details.');
    }
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw new Error('Failed to fetch product details. Please try again later.');
  }
};

// API URL
const FULFILL_ORDER_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FulfillOrder';

/**
 * Function to fulfill an order by processing its contents and notifying the customer.
 * @param {string} orderId - The ID of the order to fulfill.
 * @returns {Promise} - Resolves with a success message or rejects with an error message.
 */
export const fulfillOrder = async (orderId, product_id=null, quantity=null, note) => {
  // Generate a unique request key for this API call
  const requestKey = generateRequestKey(FULFILL_ORDER_API_URL, 'POST', {
    order_id: orderId,
    product_id: product_id,
    quantity: quantity,
    note: note
  });

  // Check if the request is a duplicate
  if (isDuplicateRequest(requestKey)) {
    console.warn('Duplicate request detected. Skipping API call.');
    throw new Error('Duplicate request detected. Please try again later.');
  }

  try {
    // Store the request in local storage to prevent duplicates
    storeRequestInLocalStorage(requestKey);
    const { email } = await fetchUserAttributes();
    const response = await fetch(FULFILL_ORDER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: orderId,
        product_id,
        quantity,
        operator_email: email,
        note
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();

    if (data.body && !data.body.includes('Error')) {
      return data.body;  // Return the success message
    } else {
      throw new Error(data.body || 'Failed to fulfill order.');
    }
  } catch (error) {
    console.error('Error fulfilling order:', error);
    throw new Error('Failed to fulfill order. Please try again later.');
  }
};

// API URL
const GET_PRODUCT_LIST_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_GetProductList';

/**
 * Function to fetch the list of all products.
 * @returns {Promise} - Resolves with the list of products or rejects with an error message.
 */
export const getProductList = async () => {
  try {
    const response = await fetch(GET_PRODUCT_LIST_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();

    if (data && data.body) {
      const productList = JSON.parse(data.body);  // Parse the body to get the actual product list
      return productList;  // Return the list of products
    } else {
      throw new Error('Failed to fetch product list.');
    }
  } catch (error) {
    console.error('Error fetching product list:', error);
    throw new Error('Failed to fetch product list. Please try again later.');
  }
};


// API URL
const MODIFY_PRODUCT_DETAILS_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_ModifyProductDetails';

/**
 * Function to modify the details of a product.
 * @param {string} productId - The ID of the product to be modified. Can include a group ID in the format "groupId/productId".
 * @param {Object} productDetails - The details of the product to update (category, image URL, price, title, description).
 * @returns {Promise} - Resolves with a success message and updated attributes or rejects with an error message.
 */
export const modifyProductDetails = async (productId, productDetails) => {
  try {
    const response = await fetch(MODIFY_PRODUCT_DETAILS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        ...productDetails,  // Spread product details in the request body
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();

    if (data.body && !data.body.includes('Internal Server Error')) {
      return data.body;  // Return the success message and updated attributes
    } else {
      throw new Error(data.body || 'Failed to modify product details.');
    }
  } catch (error) {
    console.error('Error modifying product details:', error);
    throw new Error('Failed to modify product details. Please try again later.');
  }
};
// API URL
const PUBLIC_IMAGE_UPLOAD_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_PublicImageUpload';

/**
 * Function to upload an image to a public S3 bucket.
 * @param {string} base64ImageData - The base64 encoded image data to be uploaded.
 * @returns {Promise} - Resolves with the URL of the uploaded image or rejects with an error message.
 */
export const uploadPublicImage = async (base64ImageData) => {
    try {
      const response = await fetch(PUBLIC_IMAGE_UPLOAD_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: base64ImageData,  // Base64 encoded image data
        }),
      });
  
      if (!response.ok) {
        throw new Error('Unexpected response from the server.');
      }
  
      const data = await response.json();
      console.log('Upload response data:', data); // Debugging line
  
      // Check if response contains the imageUrl key
      if (data.body) {
        const parsedBody = JSON.parse(data.body); // Parse the body if needed
        if (parsedBody.imageUrl) {
          return parsedBody.imageUrl;  // Return the URL of the uploaded image
        } else {
          throw new Error('Image URL not found in the response.');
        }
      } else {
        throw new Error('No response body found.');
      }
    } catch (error) {
      console.error('Error uploading public image:', error);
      throw new Error('Failed to upload image. Please try again later.');
    }
  };
  


// API URL
const TOGGLE_VISIBILITY_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_ToggleVisibility';

/**
 * Function to toggle the visibility of a product.
 * @param {string} productId - The ID of the product to toggle visibility for. Can include a group ID in the format "groupId/productId".
 * @returns {Promise} - Resolves with the new visibility status of the product or rejects with an error message.
 */
export const toggleProductVisibility = async (productId) => {
  // Generate a unique request key for this API call
  const requestKey = generateRequestKey(TOGGLE_VISIBILITY_API_URL, 'POST', {
    product_id: productId,
  });

  // Check if the request is a duplicate
  if (isDuplicateRequest(requestKey)) {
    console.warn('Duplicate request detected. Skipping API call.');
    throw new Error('Duplicate request detected. Please try again later.');
  }

  try {
    // Store the request in local storage to prevent duplicates
    storeRequestInLocalStorage(requestKey);

    const response = await fetch(TOGGLE_VISIBILITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();

    if (data.new_visibility !== undefined) {
      return data;  // Return the new visibility status of the product
    } else {
      throw new Error(data.body || 'Failed to toggle product visibility.');
    }
  } catch (error) {
    console.error('Error toggling product visibility:', error);
    throw new Error('Failed to toggle product visibility. Please try again later.');
  }
};

// API URL
const LOGGING_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_Logging';

/**
 * Function to log a request to the Matrix Logging API.
 */
export const logRequest = async (functionName, productId) => {
  // Generate a unique request key for this API call
  const requestKey = generateRequestKey(LOGGING_API_URL, 'POST', {
    function_name: functionName,
    product_id: productId,
  });

  console.log("Logging: ", functionName, productId);

  // Check if the request is a duplicate
  if (isDuplicateRequest(requestKey)) {
    console.warn('Duplicate request detected. Skipping API call.');
    throw new Error('Duplicate request detected. Please try again later.');
  }

  try {
    // Store the request in local storage to prevent duplicates
    storeRequestInLocalStorage(requestKey);

    const response = await fetch(LOGGING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        function_name: functionName,
        product_id: productId,
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    return true;
  } catch (error) {
    console.error('Error logging request:', error);
    throw new Error('Failed to log request. Please try again later.');
  }
};

  

const FETCH_STOCK_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchStock';

/**
 * Function to fetch the stock for a given product ID.
 * @param {string} productId - The ID of the product to fetch the stock for.
 * @returns {Promise<string|number>} - Resolves with the stock if found, or an empty string if not.
 */
export const fetchProductStock = async (productId) => {
  console.log("Request received for: ", productId);
  
  try {
    console.log('Fetching stock for product ID:', productId); // Debugging line

    const response = await fetch(FETCH_STOCK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
      }),
    });

    if (!response.ok) {
      console.error('Fetch Stock API response not ok:', response.status, response.statusText);
      throw new Error(`Failed to fetch product stock. Server responded with status: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Fetch Stock API raw response:', data); // Debugging line

    if (data.body) {
      if (!data.body.includes('Incorrect request')) {
        return data.body; // Return the product stock value directly if found
      } else {
        console.warn('Stock not found for product ID:', productId);
        return ''; // Return an empty string if the request was incorrect or stock not found
      }
    } else {
      console.warn('No stock data found for product ID:', productId);
      return ''; // Return an empty string if no body is present in the response
    }

  } catch (error) {
    console.error('Error fetching product stock:', error);
    return ''; // Return an empty string on error
  }
};


const MODIFY_STOCK_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/ModifyStock';
/**
 * Function to modify the stock of a product.
 */
export const modifyProductStock = async (productId, newStock) => {
  try {
    const response = await fetch(MODIFY_STOCK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        product_stock: newStock,
      }),
    });

    if (!response.ok) {
      console.error('Modify Stock API response not ok:', response.statusText);
      throw new Error('Failed to modify product stock.');
    }

    const data = await response.json();

    if (data.body && !data.body.includes('Failed')) {
      console.log('Stock modification successful:', data.body); // Debugging line
      return true;  // Indicate success
    } else {
      console.error('Modify Stock API response error:', data.body);
      throw new Error('Failed to modify product stock.');
    }
  } catch (error) {
    console.error('Error modifying product stock:', error);
    throw new Error('Failed to modify product stock. Please try again later.');
  }
};

// API URL
const USER_INFO_UTIL_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_UserInfoUtil';

/**
 * Function to interact with the Matrix_UserInfoUtil API to perform CRUD operations.
 * @param {string} action - The action to perform ('GET', 'POST', 'PUT', 'DELETE').
 * @param {Object} payload - The payload to send with the request, if applicable.
 * @returns {Promise} - Resolves with the API response data or rejects with an error message.
 */
export const userInfoUtil = async (action, payload = {}) => {
  try {
    // Validate action
    const validActions = ['GET', 'POST', 'PUT', 'DELETE'];
    if (!validActions.includes(action)) {
      throw new Error(`Invalid action: ${action}. Valid actions are ${validActions.join(', ')}.`);
    }

    // Set up the request options
    const options = {
      method: action,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add payload for non-GET requests
    if (action !== 'GET' && Object.keys(payload).length > 0) {
      options.body = JSON.stringify(payload);
    }

    // Make the API request
    const response = await fetch(USER_INFO_UTIL_API_URL, options);

    // Check if the response is OK
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    // Parse the response JSON
    const data = await response.json();

    // Return the response data
    return data;
  } catch (error) {
    console.error('Error interacting with Matrix_UserInfoUtil API:', error);
    throw new Error('Failed to interact with Matrix_UserInfoUtil API. Please try again later.');
  }
};

// API URL
const FETCH_USER_ORDERS_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchUserOrders';

/**
 * Function to fetch user orders from the Matrix_FetchUserOrders API.
 * @param {Object} payload - The payload to send with the request, containing the user's email and userId.
 * @returns {Promise} - Resolves with the API response data or rejects with an error message.
 */
export const fetchUserOrders = async (payload = {}) => {
  try {
    // Ensure the payload contains necessary data
    if (!payload.email || !payload.userId) {
      throw new Error('Both email and userId are required in the payload.');
    }

    // Set up the request options
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    // Make the API request
    const response = await fetch(FETCH_USER_ORDERS_API_URL, options);

    // Check if the response is OK
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    // Parse the response JSON
    const data = await response.json();

    // Return the response data
    return data;
  } catch (error) {
    console.error('Error fetching user orders from Matrix_FetchUserOrders API:', error);
    throw new Error('Failed to fetch user orders. Please try again later.');
  }
};

/**
 * Fetches all users from the Matrix_GetAllUsers API.
 * 
 * This function makes a GET request to the API Gateway URL to retrieve
 * all user information from the 'matrix_userinfo' DynamoDB table.
 * 
 * @returns {Promise<Array>} A promise that resolves to an array of user objects.
 *                           Each user object contains user details like email, userId, roles, etc.
 * @throws {Error} If the API request fails or the response is not as expected.
 */
export const fetchAllUsers = async () => {
  const apiUrl = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_GetAllUsers';

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Ensure the response is OK before parsing
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    // Parse the response body only once
    const data = await response.json();
    console.log(data);

    // Validate the format of the response
    if (!data || !data.body) {
      throw new Error('Invalid response format.');
    }

    // Parse the body field from the response data
    const parsedData = JSON.parse(data.body);

    if (!parsedData.users) {
      throw new Error('No users found in the response.');
    }

    // Return the list of users
    return parsedData.users;

  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
};


// API URL
const ADD_CREDIT_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_AddCredit';

/**
 * Function to add credit to a user.
 * @param {string} staffEmail - The email of the staff member issuing the credit.
 * @param {string} staffUserId - The user ID of the staff member issuing the credit.
 * @param {string} userEmail - The email of the user receiving the credit.
 * @param {number} creditAmount - The amount of credit to add.
 * @returns {Promise} - Resolves with a success message or rejects with an error message.
 */
export const addCredit = async (staffEmail, staffUserId, userEmail, creditAmount) => {
  // Generate a unique request key for this API call
  const requestKey = generateRequestKey(ADD_CREDIT_API_URL, 'POST', {
    staff_email: staffEmail,
    staff_user_id: staffUserId,
    user_email: userEmail,
    credit_amount: creditAmount,
  });
  console.log("Hola")

  // Check if the request is a duplicate
  if (isDuplicateRequest(requestKey)) {
    console.warn('Duplicate request detected. Skipping API call.');
    throw new Error('Duplicate request detected. Please try again later.');
  }

  try {
    // Store the request in local storage to prevent duplicates
    storeRequestInLocalStorage(requestKey);

    const response = await fetch(ADD_CREDIT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        staff_email: staffEmail,
        staff_user_id: staffUserId,
        user_email: userEmail,
        credit_amount: creditAmount,
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();

    if (data.body && data.body.includes('Successfully added')) {
      return data.body;  // Return the success message
    } else {
      throw new Error(data.body || 'Failed to add credit.');
    }
  } catch (error) {
    console.error('Error adding credit:', error);
    throw new Error('Failed to add credit. Please try again later.');
  }
};

// API URL
const REMOVE_CREDIT_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_RemoveCredit';

/**
 * Function to remove credit from a user.
 * @param {string} staffEmail - The email of the staff member removing the credit.
 * @param {string} staffUserId - The user ID of the staff member removing the credit.
 * @param {string} userEmail - The email of the user from whom the credit is being removed.
 * @param {number} creditAmount - The amount of credit to remove.
 * @returns {Promise} - Resolves with a success message or rejects with an error message.
 */
export const removeCredit = async (staffEmail, staffUserId, userEmail, creditAmount) => {
  // Generate a unique request key for this API call
  const requestKey = generateRequestKey(REMOVE_CREDIT_API_URL, 'POST', {
    staff_email: staffEmail,
    staff_user_id: staffUserId,
    user_email: userEmail,
    credit_amount: creditAmount,
  });

  // Check if the request is a duplicate
  if (isDuplicateRequest(requestKey)) {
    console.warn('Duplicate request detected. Skipping API call.');
    throw new Error('Duplicate request detected. Please try again later.');
  }

  try {
    // Store the request in local storage to prevent duplicates
    storeRequestInLocalStorage(requestKey);

    const response = await fetch(REMOVE_CREDIT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        staff_email: staffEmail,
        staff_user_id: staffUserId,
        user_email: userEmail,
        credit_amount: creditAmount,
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();

    if (data.body && data.body.includes('Successfully deducted')) {
      return data.body;  // Return the success message
    } else {
      throw new Error(data.body || 'Failed to remove credit.');
    }
  } catch (error) {
    console.error('Error removing credit:', error);
    throw new Error('Failed to remove credit. Please try again later.');
  }
};
// API URL
const GET_STAFF_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_GetStaff';

/**
 * Function to fetch all staff data from the Matrix_GetStaff API.
 * @returns {Promise<Array>} - Resolves with an array of staff objects or rejects with an error message.
 */
export const fetchAllStaff = async () => {
  try {
    const response = await fetch(GET_STAFF_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check if the response is OK
    if (!response.ok) {
      throw new Error(`Failed to fetch staff data: ${response.statusText}`);
    }

    // Parse the response body
    const data = await response.json();
    const parsedBody = JSON.parse(data.body);  // Parse the 'body' field in the response
    console.log(parsedBody);

    // Ensure the response has a 'data' field with staff info
    if (parsedBody && parsedBody.data) {
      return parsedBody.data;  // Return the list of staff members
    } else {
      throw new Error('No staff data found in the response.');
    }

  } catch (error) {
    console.error('Error fetching staff data:', error);
    throw error;  // Re-throw the error so it can be handled by the caller
  }
};

// API URL
const MODIFY_STAFF_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_ModifyStaff';

/**
 * Function to modify staff information.
 * @param {Object} staffData - The updated staff data to be sent to the API.
 * @returns {Promise} - Resolves with a success message or rejects with an error message.
 */
export const modifyStaff = async (staffData) => {
  // Generate a unique request key for this API call
  const requestKey = generateRequestKey(MODIFY_STAFF_API_URL, 'POST', staffData);

  // Check if the request is a duplicate
  if (isDuplicateRequest(requestKey)) {
    console.warn('Duplicate request detected. Skipping API call.');
    throw new Error('Duplicate request detected. Please try again later.');
  }

  try {
    // Store the request in local storage to prevent duplicates
    storeRequestInLocalStorage(requestKey);

    const response = await fetch(MODIFY_STAFF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        body: JSON.stringify(staffData),  // Nesting JSON in the 'body' field as per API's requirement
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();
    if (data.body.includes('updated successfully')) {
      return data.body;  // Return the success message
    } else {
      throw new Error(data.body || 'Failed to update staff data.');
    }
  } catch (error) {
    console.error('Error modifying staff data:', error);
    throw new Error('Failed to modify staff data. Please try again later.');
  }
};

// API URL
const FETCH_TICKETS_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_Fetchtickets';

/**
 * Function to fetch support tickets from the DynamoDB table via the Matrix_Fetchtickets API.
 * @returns {Promise<Array>} - Resolves with the list of support tickets or rejects with an error message.
 */
export const fetchSupportTickets = async () => {
  try {
    const response = await fetch(FETCH_TICKETS_API_URL, {
      method: 'GET', // or 'POST' depending on your API setup
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json(); // Parse the response body

    if (data && data.body) {
      return JSON.parse(data.body);  // Parse and return the tickets
    } else {
      throw new Error('Failed to fetch tickets.');
    }
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    throw new Error('Failed to fetch support tickets. Please try again later.');
  }

  
};

// Define constant for the Submit Ticket API URL
const SUBMIT_TICKET_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/matrix_ticketform';

/**
 * Function to submit a support ticket.
 * @param {Object} ticketData - The ticket data to be submitted.
 * @returns {Promise<Object>} - Resolves with the API response data or rejects with an error message.
 */
export const submitSupportTicket = async (ticketData) => {
  try {
    const response = await fetch(SUBMIT_TICKET_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData),
    });

    if (!response.ok) {
      throw new Error('Failed to submit the ticket');
    }

    const result = await response.json();
    return result;  // Return the result for further handling
  } catch (error) {
    console.error('Error submitting ticket:', error);
    throw error;  // Rethrow the error so it can be caught in the calling component
  }
};

// Import the necessary configurations
const SUBMIT_ISSUE_REPLACEMENT_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_IssueReplacement';

// Function to submit an issue replacement
export const issueReplacement = async (ticketData) => {
  try {
    const response = await fetch(SUBMIT_ISSUE_REPLACEMENT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData), // Send ticket data as JSON
    });

    if (!response.ok) {
      throw new Error('Failed to issue replacement.');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error issuing replacement:', error);
    throw error; // Re-throw the error to handle it in the component
  }
};

// Define constant for the Matrix_AddCreditViaTicket API URL
const ADD_CREDIT_VIA_TICKET_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_AddCreditViaTicket';

/**
 * Function to add credit via a support ticket.
 * @param {Object} creditData - The credit data to be submitted.
 * @returns {Promise<Object>} - Resolves with the API response data or rejects with an error message.
 */
export const addCreditViaTicket = async (creditData) => {
  try {
    const response = await fetch(ADD_CREDIT_VIA_TICKET_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(creditData),
    });

    if (!response.ok) {
      throw new Error('Failed to add credit via ticket.');
    }

    const result = await response.json();
    return result;  // Return the result for further handling
  } catch (error) {
    console.error('Error adding credit via ticket:', error);
    throw error;  // Rethrow the error to handle in the calling component
  }
};
// Define constant for the Matrix_ResolveDenyButtons API URL
const RESOLVE_DENY_TICKET_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_ResolveDenyButtons';

/**
 * Function to resolve or deny a ticket.
 * @param {Object} resolveDenyData - The data containing the ticket ID and status (resolved or denied).
 * @returns {Promise<Object>} - Resolves with the API response data or rejects with an error message.
 */
export const resolveOrDenyTicket = async (resolveDenyData) => {
  try {
    const response = await fetch(RESOLVE_DENY_TICKET_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resolveDenyData), // Send resolve/deny data as JSON
    });

    if (!response.ok) {
      throw new Error('Failed to update ticket status.');
    }

    const result = await response.json();
    return result;  // Return the result for further handling
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw error;  // Rethrow the error to handle in the calling component
  }
};

// Define constant for the Matrix_FetchAllTimeRevenue API URL
const FETCH_ALL_TIME_REVENUE_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchAllTimeRevenue';

/**
 * Function to fetch the all-time total revenue from the Matrix_FetchAllTimeRevenue API.
 * @returns {Promise<Object>} - Resolves with the API response data containing total revenue or rejects with an error message.
 */
export const fetchAllTimeRevenue = async () => {
  try {
    const response = await fetch(FETCH_ALL_TIME_REVENUE_API_URL, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch all-time revenue.');
    }

    const result = await response.json();
    return result;  // Return the result for further handling
  } catch (error) {
    console.error('Error fetching all-time revenue:', error);
    throw error;  // Rethrow the error to handle in the calling component
  }
};

// Define constant for the Matrix_UpdateUserTimestamp API URL
const UPDATE_USER_TIMESTAMP_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_UserActivityUpdater';

/**
 * Function to update user timestamps (LastActiveTimestamp and/or LastLoginDate).
 * @param {string} email - The email of the user to update.
 * @param {boolean} login - Whether this update includes login or only activity.
 * @returns {Promise<Object>} - Resolves with a success message or skips the request if duplicate.
 */
// Utility function to debounce API calls
const debounce = (func, wait = 5000) => {
  let timeout;
  return (...args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Wrap the updateUserTimestamp function with debounce
export const updateUserTimestamp = debounce(async (login = false) => {
  const { email } = await fetchUserAttributes();
  const requestKey = generateRequestKey(UPDATE_USER_TIMESTAMP_API_URL, 'POST', {
    email,
    login,
  });
  console.log("Trying: ", requestKey);

  // Check if the request is a duplicate without throwing an error
  if (isDuplicateRequest(requestKey)) {
    console.warn('Duplicate request detected. Skipping API call.');
    return; // Skip further execution if duplicate found
  }

  try {
    storeRequestInLocalStorage(requestKey);

    const response = await fetch(UPDATE_USER_TIMESTAMP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        login: login,
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();
    console.log(data);

    if (data.statusCode === 200) {
      return data;  // Return the success message
    } else {
      throw new Error(data.message || 'Failed to update user timestamp.');
    }
  } catch (error) {
    console.error('Error updating user timestamp:', error);
    throw new Error('Failed to update user timestamp. Please try again later.');
  }
}, 5000); // Wait for 5 seconds before making another API call

// API URL
const INSERT_TICKET_NOTE_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_InsertTicketNote';

/**
 * Function to insert a staff note into a support ticket.
 * @param {string} ticketId - The ID of the ticket to which the note should be added.
 * @param {string} staffEmail - The email of the staff member adding the note.
 * @param {string} noteContent - The content of the note.
 * @returns {Promise} - Resolves with a success message or skips the request if duplicate.
 */
// Function to insert a staff note into a support ticket.
export const insertTicketNote = async (ticketId, noteContent) => {
  const requestKey = generateRequestKey(INSERT_TICKET_NOTE_API_URL, 'POST', {
    ticket_id: ticketId,
    note_content: noteContent,
  });

  if (isDuplicateRequest(requestKey)) {
    console.warn('Duplicate request detected. Skipping API call.');
    return; 
  }

  try {
    storeRequestInLocalStorage(requestKey);
    const { email } = await fetchUserAttributes();
    const response = await fetch(INSERT_TICKET_NOTE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticket_id: ticketId,
        staff_email: email,
        note_content: noteContent,
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();
    return data.body || 'Successfully inserted ticket note.';
  } catch (error) {
    console.error('Error inserting ticket note:', error);
    throw new Error('Failed to insert ticket note. Please try again later.');
  }
};

// API URL
const INSERT_USER_NOTE_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_InsertUserNote';

/**
 * Function to insert a staff note into a user.
 * @param {string} userEmail - The email of the user which we should add the note to.
 * @param {string} staffEmail - The email of the staff member adding the note.
 * @param {string} noteContent - The content of the note.
 * @returns {Promise} - Resolves with a success message or skips the request if duplicate.
 */
// Function to insert a staff note into a user.
export const insertUserNote = async (userEmail, noteContent) => {
  const requestKey = generateRequestKey(INSERT_USER_NOTE_API_URL, 'POST', {
    user_email: userEmail,
    note: noteContent,
  });

  if (isDuplicateRequest(requestKey)) {
    console.warn('Duplicate request detected. Skipping API call.');
    return; 
  }

  try {
    storeRequestInLocalStorage(requestKey);
    const { email } = await fetchUserAttributes();
    const response = await fetch(INSERT_USER_NOTE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_email: userEmail,
        staff_email: email,
        note: noteContent,
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();
    return data.body || 'Successfully inserted user note.';
  } catch (error) {
    console.error('Error inserting user note:', error);
    throw new Error('Failed to insert user note. Please try again later.');
  }
};

/**
 * Function to insert a customer notice into a ticket.
 * @param {string} ticketId - The ID of the ticket to which we should add the notice.
 * @param {string} noticeContent - The content of the notice.
 * @returns {Promise} - Resolves with a success message or skips the request if duplicate.
 */
export const insertTicketNotice = async (ticketId, noticeContent) => {
  const requestKey = generateRequestKey('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_InsertTicketNotice', 'POST', {
    ticket_id: ticketId,
    notice_content: noticeContent,
  });

  if (isDuplicateRequest(requestKey)) {
    console.warn('Duplicate request detected. Skipping API call.');
    return;
  }

  try {
    storeRequestInLocalStorage(requestKey);
    const { email } = await fetchUserAttributes();
    const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_InsertTicketNotice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticket_id: ticketId,
        sender_email: email,
        notice_content: noticeContent,
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();
    return data.body || 'Successfully inserted ticket notice.';
  } catch (error) {
    console.error('Error inserting ticket notice:', error);
    throw new Error('Failed to insert ticket notice. Please try again later.');
  }
};

// API URL
const FETCH_USER_INFO_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchUserInfo';

/**
 * Function to insert a staff note into a user.
 * @param {string} email - The email of the user which we fetch information from.
 * @returns {Promise} - Resolves with a success message.
 */
// Function to insert a staff note into a user.
export const fetchUserInfo = async (email) => {

  try {
    const response = await fetch(FETCH_USER_INFO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();
    return data.body || 'Successfully fetched user info.';
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw new Error('Failed to fetch user info. Please try again later.');
  }
};

// API URL for sending requests to SQS
const MODIFY_ORDER_STATUS_SQS_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_ModifyOrderStatusSQS';

/**
 * Function to modify the order status by sending a request to an SQS queue.
 * @param {string} orderId - The ID of the order to be updated.
 * @param {string} requestedStatus - The new status to set for the order.
 * @param {string} [ticketId] - (Optional) The ID of the ticket associated with the operation.
 * @returns {Promise} - Resolves with a success message or rejects with an error message.
 */
export const modifyOrderStatusSQS = async (orderId, requestedStatus, ticketId = null) => {
  const requestKey = generateRequestKey(MODIFY_ORDER_STATUS_SQS_API_URL, 'POST', {
    order_id: orderId,
    requested_status: requestedStatus,
  });

  if (isDuplicateRequest(requestKey)) {
    console.warn('Duplicate request detected. Skipping API call.');
    return;
  }

  try {
    storeRequestInLocalStorage(requestKey);
    const { email } = await fetchUserAttributes();

    // Construct the request body with or without ticket_id based on its presence
    const requestBody = {
      order_id: orderId,
      requested_status: requestedStatus,
      operator: email,
    };

    if (ticketId) {
      requestBody.ticket_id = ticketId;  // Add ticket_id if provided
    }

    console.log(orderId, requestedStatus, ticketId);
    
    const response = await fetch(MODIFY_ORDER_STATUS_SQS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body: JSON.stringify(requestBody) }),  // Wrap requestBody in "body"
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();
    console.log(data);

    if (data.body && !JSON.parse(data.body).error) {
      return data.body;  // Return the success message
    } else {
      throw new Error(data.body || 'Failed to submit order status update request.');
    }
  } catch (error) {
    console.error('Error modifying order status via SQS:', error);
    throw new Error('Failed to modify order status. Please try again later.');
  }
};
/**
 * Function to flag a ticket for admin review.
 * @param {Object} ticketData - The data required to flag a ticket.
 * @param {string} ticketData.ticket_id - The ID of the ticket to be flagged.
 * @param {string} ticketData.flaggedBy - The email of the operator who flagged the ticket.
 * @returns {Promise} - Resolves with a success message or rejects with an error message.
 */
export const flagTicket = async ({ ticket_id, flaggedBy }) => {
  const FLAG_TICKET_API_URL =
    'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FlagTicket';

  try {
    const requestBody = {
      ticket_id,
      flaggedBy,
    };

    const response = await fetch(FLAG_TICKET_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();
    console.log(data);

    if (data.body && !JSON.parse(data.body).error) {
      return data.body; // Return success message if no error in response body
    } else {
      throw new Error(data.body || 'Failed to flag the ticket.');
    }
  } catch (error) {
    console.error('Error flagging ticket:', error);
    throw new Error('Failed to flag the ticket. Please try again later.');
  }
};
