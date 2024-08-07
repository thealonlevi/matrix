// src/components/ForgotPasswordForm.js
import React, { useState } from 'react';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import '../styles/ForgotPasswordForm.css';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const output = await resetPassword({ username: email });
      handleResetPasswordNextSteps(output);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleResetPasswordNextSteps = (output) => {
    const { nextStep } = output;
    switch (nextStep.resetPasswordStep) {
      case 'CONFIRM_RESET_PASSWORD_WITH_CODE':
        const codeDeliveryDetails = nextStep.codeDeliveryDetails;
        setMessage(`Confirmation code was sent to ${codeDeliveryDetails.DeliveryMedium}`);
        setStep(2);
        break;
      case 'DONE':
        setMessage('Successfully reset password.');
        setStep(3);
        break;
      default:
        setError('Unknown step.');
    }
  };

  const handleConfirmResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await confirmResetPassword({ username: email, confirmationCode, newPassword });
      setMessage('Password successfully reset.');
      setStep(3);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="forgot-password-form-container">
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}
      {step === 1 && (
        <form onSubmit={handleResetPassword} className="forgot-password-form">
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="form-button">Reset Password</button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleConfirmResetPassword} className="forgot-password-form">
          <div className="form-group">
            <label>Confirmation Code:</label>
            <input
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="form-button">Confirm Reset Password</button>
        </form>
      )}
      {step === 3 && (
        <p>Your password has been reset successfully. Please <a href="/login">log in</a> with your new password.</p>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
