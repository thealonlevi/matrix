// src/components/SignInForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from 'aws-amplify/auth';
import './styles/SignInForm.css';

const SignInForm = ({ onSignUpClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signIn({
        username: email,
        password: password,
      });
      console.log('Sign in successful');
      navigate('/'); // Redirect to UserAreaScreen
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err.message);
    }
  };

  return (
    <div className="signin-form-container">
      <form onSubmit={handleSubmit} className="signin-form">
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
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="form-button">Sign In</button>
        <div className="signup-prompt">
          <p>Don't have an account? <a href="/register">Sign Up</a></p>
        </div>
        <div className="forgot-password">
          <a href="/forgot-password">Forgot Password?</a>
        </div>
      </form>
    </div>
  );
};

export default SignInForm;
