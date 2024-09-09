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

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();

    return data.body;  // 'Permission granted' or 'Permission denied'
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
  try {
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
  try {
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
    console.log(response)

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = JSON.parse((await response.json()).body);
    console.log(data)
    if (data.order_id) {
        console.log("True")
      return {
        message: data.message,
        orderId: data.order_id,
        amountToBePaid: data.amount_to_be_paid,
      };  // Return the order creation details
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
  try {
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
const EXPORT_STOCK_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_ExportStock';

/**
 * Function to export stock for a given product.
 * @param {string} productId - The ID of the product for which to export stock.
 * @param {number} quantity - The quantity of stock to export.
 * @returns {Promise} - Resolves with the exported stock or rejects with an error message.
 */
export const exportProductStock = async (productId, quantity) => {
  try {
    const response = await fetch(EXPORT_STOCK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
      }),
    });

    if (!response.ok) {
      throw new Error('Unexpected response from the server.');
    }

    const data = await response.json();

    if (data.body && !data.body.includes('Failed')) {
      return data.body;  // Return the exported stock
    } else {
      throw new Error(data.body || 'Failed to export stock.');
    }
  } catch (error) {
    console.error('Error exporting stock:', error);
    throw new Error('Failed to export stock. Please try again later.');
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
export const fulfillOrder = async (orderId) => {
  try {
    const response = await fetch(FULFILL_ORDER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: orderId,
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


// API URL for sending requests to SQS
const MODIFY_ORDER_STATUS_SQS_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_ModifyOrderStatusSQS';

/**
 * Function to modify the order status by sending a request to an SQS queue.
 * @param {string} orderId - The ID of the order to be updated.
 * @param {string} requestedStatus - The new status to set for the order.
 * @returns {Promise} - Resolves with a success message or rejects with an error message.
 */
export const modifyOrderStatusSQS = async (orderId, requestedStatus) => {
  try {
    const requestBody = {
        body: JSON.stringify({
          order_id: orderId,
          requested_status: requestedStatus,
        }),
      };
    console.log(orderId, requestedStatus);
    const response = await fetch(MODIFY_ORDER_STATUS_SQS_API_URL, {
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
      return data.body;  // Return the success message
    } else {
        console.log("Fk")
        throw new Error(data.body || 'Failed to submit order status update request.');
    }
  } catch (error) {
    console.error('Error modifying order status via SQS:', error);
    throw new Error('Failed to modify order status. Please try again later.');
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
  try {
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
const MODIFY_STOCK_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/ModifyStock';
const FETCH_STOCK_API_URL = 'https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_FetchStock';

/**
 * Function to log a request to the Matrix Logging API.
 */
export const logRequest = async (functionName, productId) => {
    try {
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
  
      return true;
    } catch (error) {
      console.error('Error logging request:', error);
      throw new Error('Failed to log request. Please try again later.');
    }
  };
  

/**
 * Function to fetch the stock for a given product ID.
 */
export const fetchProductStock = async (productId) => {
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
  
      if (data.body && !data.body.includes('Incorrect request')) {
        return data.body; // Return the product stock value directly
      } else {
        console.error('Fetch Stock API response error:', data.body);
        throw new Error(data.body || 'Failed to fetch product stock.');
      }
    } catch (error) {
      console.error('Error fetching product stock:', error);
      throw new Error('Failed to fetch product stock. Please try again later.');
    }
  };

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
