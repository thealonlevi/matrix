// src/components/SignUpForm.js
import React, { useState } from 'react';
import { signUp, confirmSignUp } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/SignUpForm.css';

const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      navigate('/'); // Redirect to homepage
    } catch (error) {
      setError(`Error confirming sign up: ${error.message}`);
    }
  };

  return (
    <div className="signup-form-container">
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
