import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from './api/auth';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await forgotPassword(email);
      setSuccess(data.message || 'If an account exists for that email, a reset link has been sent.');
    } catch (err) {
      setError(err.message || 'Could not send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="forgot-password-page">
      <div className="forgot-password-card">
        <h1 className="forgot-password-title">Forgot password</h1>
        <p className="forgot-password-subtitle">
          Enter your email address and we’ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="forgot-password-field">
            <input
              id="forgot-password-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor="forgot-password-email">Email</label>
          </div>

          {error ? <p className="forgot-password-error">{error}</p> : null}
          {success ? <p className="forgot-password-success">{success}</p> : null}

          <button className="forgot-password-button" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p className="forgot-password-footer">
          Remember your password? <Link to="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}