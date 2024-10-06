// src/components/admin-dashboard/utils/checkAdminPermission.js

import { fetchUserAttributes } from 'aws-amplify/auth';
import { checkAdminPermission as checkAdminPermissionAPI } from '../../../utils/api'; // Import the API function

let lastPermissionCheckTime = 0; // Timestamp of the last permission check
let lastPermissionResult = false; // Result of the last permission check
const PERMISSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

export const checkAdminPermission = async () => {
  const currentTime = Date.now();

  // If the last permission check was done within the interval, return cached result
  if (currentTime - lastPermissionCheckTime < PERMISSION_CHECK_INTERVAL) {
    console.log("Returning cached permission result:", lastPermissionResult ? 'Permission granted' : 'Permission denied');
    return lastPermissionResult ? 'Permission granted' : false;
  }

  try {
    const userResponse = await fetchUserAttributes();
    const userId = userResponse.sub;
    const { email } = userResponse;

    console.log("User ID: ", userId);
    console.log("Email: ", email);
    console.log("User Response: ", userResponse);

    // Use the API function from api.js to check permissions
    const permissionResponse = await checkAdminPermissionAPI(email, userId);
    if (permissionResponse === 'Permission granted') {
      // Update cache
      lastPermissionCheckTime = currentTime;
      lastPermissionResult = true;
      return 'Permission granted';
    } else {
      lastPermissionCheckTime = currentTime;
      lastPermissionResult = false;
      return false;
    }
  } catch (error) {
    console.error('Error occurred during admin permission check: ', error);
    lastPermissionResult = false; // Set permission to false on error
    return false;
  }
};
