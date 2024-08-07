// src/components/SignInForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from 'aws-amplify/auth';
import '../styles/SignInForm.css';

const SignInForm = () => {
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
      navigate('/'); // Redirect to Home page
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
      </form>
      <p>Don't have an account? <button onClick={() => navigate('/register')} className="link-button">Sign Up</button></p>
    </div>
  );
};

export default SignInForm;
