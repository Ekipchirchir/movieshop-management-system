import React, { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Token received:', data.token); // Debug token
        localStorage.setItem('token', data.token);
        onLogin();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F9FAFB',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1E40AF',
          marginBottom: '24px',
          textAlign: 'center',
        }}>
          Login to Movie Shop Dashboard
        </h2>
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '16px',
                backgroundColor: '#F9FAFB',
                outline: 'none',
                transition: 'border-color 0.3s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '16px',
                backgroundColor: '#F9FAFB',
                outline: 'none',
                transition: 'border-color 0.3s ease',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '12px',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
          >
            Login
          </button>
        </form>
        {error && (
          <p style={{
            marginTop: '16px',
            fontSize: '16px',
            color: '#DC2626',
            textAlign: 'center',
          }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
