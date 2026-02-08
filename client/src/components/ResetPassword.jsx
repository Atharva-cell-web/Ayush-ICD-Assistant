import React, { useState } from 'react';
import api from '../api';
import './AuthPage.css';

const ResetPassword = ({ token, onDone }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const handleSubmit = async event => {
    event.preventDefault();
    setError(null);

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setStatus('loading');

    try {
      await api.post('/api/auth/reset-password', { token, password });
      setStatus('success');
    } catch (err) {
      const message = err?.response?.data?.error || 'Reset failed.';
      setError(message);
      setStatus('idle');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p>Create a new password for your account.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            New Password
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              required
            />
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
              required
            />
          </label>

          {error && <div className="auth-error">{error}</div>}
          {status === 'success' && (
            <div className="auth-notice">
              Password updated. You can now login with your new password.
            </div>
          )}

          <button className="auth-button" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Updating...' : 'Reset Password'}
          </button>

          {status === 'success' && (
            <button className="auth-link" type="button" onClick={onDone}>
              Back to login
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
