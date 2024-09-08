import { fetchUserAttributes } from 'aws-amplify/auth';
import { getProductList, checkCouponCode, createOrder as createOrderApi} from './api';

// Fetch the authenticated user's email or determine if they are a guest
export async function currentAuthenticatedUser() {
  try {
    const user = await fetchUserAttributes();
    const { email } = user;
    console.log(`The email: ${email}`);
    return { email, isGuest: false };
  } catch (err) {
    console.log(err);
    return { email: null, isGuest: true };
  }
}

// Fetch all product info from the product info database
export async function fetchProductInfo() {
  try {
    const productList = await getProductList();
    return productList;
  } catch (error) {
    console.error('Error fetching product info:', error);
  }
  return [];
}

// Fetch the client's IP address
export async function fetchClientIp() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    console.log('Client IP fetched:', data.ip);
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return '';
  }
}

// Apply the coupon code and return the discount
export async function applyCoupon(couponCode) {
  try {
    console.log('Sending coupon code:', couponCode);

    const discountValue = await checkCouponCode(couponCode);
    console.log("discountValue: ", discountValue)

    if (!isNaN(discountValue)) {
      return discountValue;
    } else {
      alert('Invalid discount value received. Please try again.');
    }
  } catch (error) {
    console.error('Error applying coupon:', error);
    alert('Failed to apply coupon. Please try again.');
  }
  return 0;
}

// Validate stock before checkout
export async function validateStockBeforeCheckout(cartItems, updateCartItem, productInfo) {
  try {
    console.log('Starting stock validation...');

    let stockUpdated = false;

    for (const cartItem of cartItems) {
      const { availableStock } = getProductDetails(cartItem.product_id, productInfo);

      if (availableStock !== undefined && cartItem.quantity > availableStock) {
        alert(`Insufficient stock for ${cartItem.product_title}. Only ${availableStock} items are available.`);
        updateCartItem(cartItem.product_id, availableStock);
        stockUpdated = true;
      }
    }

    if (stockUpdated) {
      alert('Your cart has been updated to reflect the maximum available stock. Please review and proceed.');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error validating stock:', error);
    alert('Error validating stock. Please try again.');
    return false;
  }
}

// Create an order and handle the checkout process
export async function createOrder(orderData, clearCart) {
  try {
    console.log('Preparing to send order data:', orderData);

    // Call the API function from api.js
    const result = await createOrderApi(
      orderData.user_email,
      orderData.order_contents,
      'GUEST',  // Assuming user is a guest for this example; adjust as necessary
      orderData.payment_method,
      orderData.coupon_code,
      orderData.ip_address,
      orderData.user_agent,
      orderData.device_type
    );
    console.log(result)

    // Debugging: Log the full response from the API
    console.log('Parsed response:', result);

    // Check if the result contains orderId and handle accordingly
    if (result && result.orderId) {
      clearCart();
      alert('Order created successfully! Order ID: ' + (result.orderId || 'undefined'));
    } else {
      // If the response does not have orderId, log the full result to understand the issue
      console.error('Unexpected result:', result);
      const errorMessage = result.error || 'Failed to create order';
      alert(`Failed to create order! Error: ${errorMessage}`);
    }
  } catch (error) {
    // More specific error handling for debugging purposes
    console.error('Checkout failed:', error.message);
    console.error('Full error object:', error);
    alert('Checkout failed. Please try again.');
  }
}

// Function to get the product details like group title, image, and stock for a product
export function getProductDetails(productId, productInfo) {
  // Check if the product is in the product info list directly
  const standaloneProduct = productInfo.find((product) => product.product_id === productId);

  if (standaloneProduct) {
    return { 
      title: '', 
      imageUrl: standaloneProduct.product_img_url,
      availableStock: standaloneProduct.available_stock_count || 0 
    }; 
  }

  // If not found, check if it belongs to a group
  for (const group of productInfo) {
    if (group.product_group) {
      const groupProduct = group.product_group.find((item) => item.product_id === productId);
      if (groupProduct) {
        return { 
          title: group.product_title, 
          imageUrl: group.product_img_url,
          availableStock: groupProduct.available_stock_count || 0
        };
      }
    }
  }

  return { title: '', imageUrl: '', availableStock: 0 }; // Return empty if no group title found
}