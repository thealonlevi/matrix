// src/components/admin-dashboard/utils/checkAdminPermission.js

import { fetchUserAttributes } from 'aws-amplify/auth';
import { checkAdminPermission as checkAdminPermissionAPI } from '../../../utils/api'; // Import the API function

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

    console.log("User ID: ", userId);
    console.log("Email: ", email);
    console.log("User Response: ", userResponse);

    // Use the API function from api.js instead of making a direct request
    const permissionGranted = await checkAdminPermissionAPI(email, userId);

    lastPermissionResult = permissionGranted; // Update cached result
    lastPermissionCheckTime = currentTime; // Update the timestamp of the last request
    return lastPermissionResult;

  } catch (error) {
    console.error('Error occurred during admin permission check: ', error);
    return false;
  }
};
