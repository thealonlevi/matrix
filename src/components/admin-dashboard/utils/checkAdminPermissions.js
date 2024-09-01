// src/components/admin-dashboard/utils/checkAdminPermission.js
import { fetchUserAttributes } from 'aws-amplify/auth';

let lastPermissionCheckTime = 0; // Timestamp of the last permission check
let lastPermissionResult = false; // Result of the last permission check

export const checkAdminPermission = async () => {
  const currentTime = Date.now();
  
  // Check if a minute has passed since the last request
  if (currentTime - lastPermissionCheckTime < 60000) { // 60000 ms = 1 minute
    console.log('Returning cached permission result');
    return lastPermissionResult; // Return cached result
  }

  try {
    const userResponse = await fetchUserAttributes();
    const userId = userResponse.sub;
    const { email } = userResponse;

    const permissionResponse = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_AdminPermission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email, userId: userId })
    });

    console.log("User ID: ", userId);
    console.log("Email: ", email);
    console.log("User Response: ", userResponse);

    const data = await permissionResponse.json();

    if (permissionResponse.status === 200 && data.body === "Permission granted") {
      lastPermissionResult = true; // Update cached result
    } else {
      lastPermissionResult = false; // Update cached result
    }

    lastPermissionCheckTime = currentTime; // Update the timestamp of the last request
    return lastPermissionResult;

  } catch (error) {
    console.error('Error occurred during admin permission check: ', error);
    return false;
  }
};
