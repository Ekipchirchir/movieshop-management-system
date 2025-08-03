import React, { useState, useEffect } from 'react';
import SalesForm from './SalesForm';
import CustomerForm from './CustomerForm';
import Dashboard from './Dashboard';
import CustomerList from './CustomerList';
import Reports from './Reports';
import Login from './Login';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'sales':
        return <SalesForm />;
      case 'customers':
        return <CustomerForm />;
      case 'dashboard':
        return <Dashboard />;
      case 'customerList':
        return <CustomerList />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F9FAFB',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#111827',
      display: 'flex',
    }}>
      <aside style={{
        width: '240px',
        backgroundColor: '#FFFFFF',
        padding: '24px',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1E40AF',
          marginBottom: '32px',
        }}>
          Movie Shop
        </h2>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: '📊' },
          { id: 'sales', label: 'Record Sale', icon: '💰' },
          { id: 'customers', label: 'Add Customer', icon: '👤' },
          { id: 'customerList', label: 'Customer List', icon: '📋' },
          { id: 'reports', label: 'Reports', icon: '📈' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              backgroundColor: activeTab === tab.id ? '#3B82F6' : 'transparent',
              color: activeTab === tab.id ? '#FFFFFF' : '#4B5563',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '8px',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginTop: '24px',
          }}
        >
          <span>🚪</span>
          Logout
        </button>
      </aside>
      <main style={{
        flex: 1,
        padding: '24px',
        maxWidth: '1280px',
        margin: '0 auto',
      }}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;