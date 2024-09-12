// src/components/admin-dashboard/utils/checkAdminPermission.js

import { fetchUserAttributes } from 'aws-amplify/auth';
import { checkAdminPermission as checkAdminPermissionAPI } from '../../../utils/api'; // Import the API function

let lastPermissionCheckTime = 0; // Timestamp of the last permission check
let lastPermissionResult = false; // Result of the last permission check

export const checkAdminPermission = async () => {
  const currentTime = Date.now();

  try {
    const userResponse = await fetchUserAttributes();
    const userId = userResponse.sub;
    const { email } = userResponse;

    console.log("User ID: ", userId);
    console.log("Email: ", email);
    console.log("User Response: ", userResponse);

    // Use the API function from api.js instead of making a direct request
    if (await checkAdminPermissionAPI(email, userId)=='Permission granted') {
      return 'Permission granted';
    }
    else {
      return ;
    }

  } catch (error) {
    console.error('Error occurred during admin permission check: ', error);
    return ;
  }
};
