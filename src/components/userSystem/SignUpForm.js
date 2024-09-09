// src/components/SignUpForm.js
import React, { useState, useEffect } from 'react';
import { signUp, confirmSignUp, fetchUserAttributes, signIn } from 'aws-amplify/auth'; // Correct imports from aws-amplify/auth
import { useNavigate } from 'react-router-dom';
import { userInfoUtil } from '../../utils/api'; // Import userInfoUtil from api.js
import './styles/SignUpForm.css';

const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [error, setError] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [deviceInfo, setDeviceInfo] = useState({});
  const navigate = useNavigate();

  // Fetch IP address and device information on component mount
  useEffect(() => {
    // Fetch user's IP address
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
        setIpAddress(data.ip);
        console.log('Fetched IP Address:', data.ip);
      })
      .catch(error => console.error('Failed to fetch IP address:', error));

    // Gather device information
    const userAgent = navigator.userAgent;
    const deviceType = /mobile|tablet|ip(ad|hone|od)|android/i.test(userAgent) ? 'Mobile' : 'Desktop';
    setDeviceInfo({
      userAgent: userAgent,
      deviceType: deviceType,
      platform: navigator.platform,
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    if (email === '' || password === '' || confirmPassword === '') {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
          },
        },
      });
      setIsSignedUp(true);
    } catch (error) {
      setError(`Error signing up: ${error.message}`);
    }
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    if (confirmationCode === '') {
      setError('Confirmation code is required');
      return;
    }

    try {
      await confirmSignUp({
        username: email,
        confirmationCode: confirmationCode,
      });
      console.log('Confirmation successful');

      // Sign the user in after confirmation
      await signIn({ username: email, password: password });  // Ensure to sign in the user after confirmation
      console.log('Sign-in successful');

      // Fetch user attributes after successful sign-in
      const userResponse = await fetchUserAttributes();
      const userId = userResponse.sub; // Extract user ID
      const { email: confirmedEmail, updated_at, createdAt } = userResponse; // Extract additional attributes if available

      console.log("User ID: ", userId);
      console.log("Email: ", confirmedEmail);
      console.log("Updated At: ", updated_at);
      console.log("Creation Date: ", createdAt);

      // Call userInfoUtil to add email, userId, and other relevant data to DynamoDB
      await userInfoUtil('POST', {
        email: confirmedEmail,
        userId: userId,
        role: 'user', // Default role for new users
        RegistrationDate: createdAt,
        LastLoginDate: new Date().toISOString(),
        LastActiveTimestamp: updated_at || new Date().toISOString(),
        SessionHistory: [], // Initialize empty session history
        IPAddresses: [ipAddress], // Initialize with current IP address
        OrderHistory: [], // Initialize empty order history
        GeolocationData: { ip: ipAddress, country: 'Unknown', city: 'Unknown' }, // Initialize geolocation data (replace with actual data if available)
        DeviceInformation: deviceInfo // Send device information
      });

      console.log('User information added to DynamoDB');

      navigate('/'); // Redirect to homepage
    } catch (error) {
      setError(`Error confirming sign up or signing in: ${error.message}`);
    }
  };

  return (
    <div className="signup-form-container">
      <h2>Create Your Account</h2>
      {error && <p className="error-message">{error}</p>}
      {!isSignedUp ? (
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="form-button">Sign Up</button>
        </form>
      ) : (
        <form onSubmit={handleConfirmSubmit} className="signup-form">
          <div className="form-group">
            <label>Confirmation Code:</label>
            <input
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="form-button">Confirm Sign Up</button>
        </form>
      )}
    </div>
  );
};

export default SignUpForm;
