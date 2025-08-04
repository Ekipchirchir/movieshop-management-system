import React, { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F9FAFB 0%, #E0E7FF 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '10px',
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '380px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
        }} />
        <h3 style={{
          fontSize: '25px',
          fontWeight: '400',
          color: '#1E40AF',
          marginBottom: '20px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          Login to Movie Shop
        </h3>
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '15px', fontWeight: '600', color: '#1F2937' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '15px',
                backgroundColor: '#F9FAFB',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#10B981')}
              onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '15px', fontWeight: '600', color: '#1F2937' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '15px',
                backgroundColor: '#F9FAFB',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#10B981')}
              onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '12px',
              background: 'linear-gradient(90deg, #10B981, #059669)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.3s ease',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {error && (
          <p style={{
            marginTop: '16px',
            fontSize: '14px',
            color: '#DC2626',
            textAlign: 'center',
            backgroundColor: '#FEF2F2',
            padding: '8px',
            borderRadius: '6px',
            position: 'relative',
            zIndex: 1,
          }}>
            {error}
          </p>
        )}
        <style jsx>{`
          @media (max-width: 480px) {
            div[style*="maxWidth: '380px'"] {
              padding: 16px;
            }
            h2 {
              font-size: 22px;
              marginBottom: 16px;
            }
            input, button {
              font-size: 14px;
              padding: 8px;
            }
            label {
              font-size: 14px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default Login;
