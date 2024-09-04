import { fetchUserAttributes } from 'aws-amplify/auth';

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
    const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_GetProductList');
    const data = await response.json();
    if (data && data.body) {
      const productList = JSON.parse(data.body);
      console.log('Product information fetched:', productList);
      return productList;
    }
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

    const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_CouponChecker', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ coupon_code: couponCode.trim() }),
    });

    const result = await response.json();
    console.log('Response data:', result);

    if (response.ok && result.body) {
      const responseBody = JSON.parse(result.body);
      const discountValue = parseFloat(responseBody.discount);

      if (!isNaN(discountValue)) {
        return discountValue;
      } else {
        alert('Invalid discount value received. Please try again.');
      }
    } else {
      alert('Invalid coupon code. Please try again.');
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

    const response = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_CreateOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const result_unprocessed = await response.json();
    const result = JSON.parse(result_unprocessed.body);

    console.log('Parsed response:', result);

    if (result_unprocessed.statusCode === 200) {
      clearCart();
      alert('Order created successfully! Order ID: ' + (result.order_id || 'undefined'));
    } else {
      const errorMessage = result.error || 'Failed to create order';
      alert(`Failed to create order! Error: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Checkout failed:', error);
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
