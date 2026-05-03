import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from './api/auth';
import './ResetPassword.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const login = useMemo(() => searchParams.get('login') || '', [searchParams]);
  const key = useMemo(() => searchParams.get('key') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!login || !key) {
      setError('This password reset link is invalid.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword({ login, key, password });
      setSuccess('Your password has been reset successfully.');

      setTimeout(() => {
        navigate('/account');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Could not reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="reset-password-page">
      <div className="reset-password-card">
        <h1 className="reset-password-title">Reset password</h1>
        <p className="reset-password-subtitle">Enter your new password below.</p>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="reset-password-field">
            <input
              id="reset-password-new"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor="reset-password-new">New password</label>
          </div>

          <div className="reset-password-field">
            <input
              id="reset-password-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor="reset-password-confirm">Confirm new password</label>
          </div>

          {error ? <p className="reset-password-error">{error}</p> : null}
          {success ? <p className="reset-password-success">{success}</p> : null}

          <button className="reset-password-button" type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <p className="reset-password-footer">
          Remember your password? <Link to="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}