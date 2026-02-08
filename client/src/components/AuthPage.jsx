import React, { useState } from 'react';
import api from '../api';
import './AuthPage.css';

const AuthPage = ({ onAuth }) => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    specialization: 'Ayurveda Practitioner',
    hospitalName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const updateField = field => event => {
    setForm(prev => ({ ...prev, [field]: event.target.value }));
  };

  const switchMode = nextMode => {
    setMode(nextMode);
    setError(null);
    setNotice(null);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === 'forgot') {
        await api.post('/api/auth/forgot-password', { email: form.email });
        setNotice('If the email exists, a reset link has been sent.');
        setMode('login');
        return;
      }

      if (mode === 'login') {
        const res = await api.post('/api/auth/login', {
          email: form.email,
          password: form.password
        });
        onAuth(res.data);
      } else {
        const res = await api.post('/api/auth/register', {
          name: form.name,
          email: form.email,
          password: form.password,
          specialization: form.specialization,
          hospitalName: form.hospitalName
        });
        onAuth(res.data);
      }
    } catch (err) {
      const message = err?.response?.data?.error || 'Authentication failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Doctor Access</h2>
          <p>Secure login to save patient history and generate prescriptions.</p>
        </div>

        <div className="auth-toggle">
          <button
            className={mode === 'login' ? 'active' : ''}
            onClick={() => switchMode('login')}
            type="button"
          >
            Login
          </button>
          <button
            className={mode === 'register' ? 'active' : ''}
            onClick={() => switchMode('register')}
            type="button"
          >
            Register
          </button>
        </div>

        {mode === 'forgot' && (
          <div className="auth-hint">Enter your email to receive a password reset link.</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <label>
                Full Name
                <input type="text" value={form.name} onChange={updateField('name')} required />
              </label>
              <label>
                Specialization
                <input
                  type="text"
                  value={form.specialization}
                  onChange={updateField('specialization')}
                />
              </label>
              <label>
                Hospital Name
                <input
                  type="text"
                  value={form.hospitalName}
                  onChange={updateField('hospitalName')}
                />
              </label>
            </>
          )}

          <label>
            Email
            <input type="email" value={form.email} onChange={updateField('email')} required />
          </label>

          {mode !== 'forgot' && (
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={updateField('password')}
                required
              />
            </label>
          )}

          {notice && <div className="auth-notice">{notice}</div>}
          {error && <div className="auth-error">{error}</div>}

          <button className="auth-button" type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : mode === 'forgot'
                ? 'Send Reset Link'
                : mode === 'login'
                  ? 'Login'
                  : 'Create Account'}
          </button>

          {mode === 'login' && (
            <button className="auth-link" type="button" onClick={() => switchMode('forgot')}>
              Forgot password?
            </button>
          )}
          {mode === 'forgot' && (
            <button className="auth-link" type="button" onClick={() => switchMode('login')}>
              Back to login
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
