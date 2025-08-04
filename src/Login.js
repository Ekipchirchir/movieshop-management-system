import React, { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://movieshop.up.railway.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Token received:', data.token);
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
      padding: '10px',
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '350px',
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1E40AF',
          marginBottom: '16px',
          textAlign: 'center',
        }}>
          Login to Movie Shop
        </h2>
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                backgroundColor: '#F9FAFB',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                backgroundColor: '#F9FAFB',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '10px',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
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
            marginTop: '12px',
            fontSize: '14px',
            color: '#DC2626',
            textAlign: 'center',
          }}>
            {error}
          </p>
        )}
        <style jsx>{`
          @media (max-width: 480px) {
            div[style*="maxWidth: '350px'"] {
              padding: 12px;
            }
            h2 {
              font-size: 20px;
            }
            input, button {
              font-size: 13px;
              padding: 8px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default Login;
