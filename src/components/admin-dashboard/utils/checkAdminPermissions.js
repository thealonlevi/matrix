// src/components/admin-dashboard/utils/checkAdminPermission.js
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';

export const checkAdminPermission = async () => {
  try {
    const userResponse = await fetchUserAttributes();
    const currentUser = await getCurrentUser();
    const { userId } = currentUser;
    const { email } = userResponse;

    const permissionResponse = await fetch('https://p1hssnsfz2.execute-api.eu-west-1.amazonaws.com/prod/Matrix_AdminPermission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email, userId: userId })
    });

    const data = await permissionResponse.json();

    if (permissionResponse.status === 200 && data.body === "Permission granted") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error occurred during admin permission check: ', error);
    return false;
  }
};
