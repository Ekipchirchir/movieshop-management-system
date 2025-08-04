import React, { useState, useEffect } from 'react';
import SalesForm from './SalesForm';
import CustomerForm from './CustomerForm';
import Dashboard from './Dashboard';
import CustomerList from './CustomerList';
import Reports from './Reports';
import Login from './Login';
import { FiMenu, FiX, FiHome, FiDollarSign, FiUserPlus, FiUsers, FiPieChart, FiLogOut } from 'react-icons/fi';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    if (!isMobile) {
      setIsSidebarOpen(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome /> },
    { id: 'sales', label: 'Record Sale', icon: <FiDollarSign /> },
    { id: 'customers', label: 'Add Customer', icon: <FiUserPlus /> },
    { id: 'customerList', label: 'Customer List', icon: <FiUsers /> },
    { id: 'reports', label: 'Reports', icon: <FiPieChart /> },
  ];

  return (
    <div className="app-container">
      {/* Mobile Header */}
      {isMobile && (
        <header className="mobile-header">
          <h2 className="app-title">Movie Shop</h2>
          <button className="menu-button" onClick={toggleSidebar}>
            {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </header>
      )}

      <div className="app-content">
        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          {!isMobile && (
            <div className="sidebar-header">
              <h2 className="app-title">Movie Shop</h2>
            </div>
          )}
          
          <nav className="sidebar-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
            
            <button
              onClick={handleLogout}
              className="logout-button"
            >
              <span className="nav-icon"><FiLogOut /></span>
              <span className="nav-label">Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`main-content ${isSidebarOpen && !isMobile ? 'sidebar-open' : ''}`}>
          {renderContent()}
        </main>
      </div>

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: #f8fafc;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .mobile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background-color: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          z-index: 50;
        }
        
        .app-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e40af;
          margin: 0;
        }
        
        .menu-button {
          background: none;
          border: none;
          color: #4b5563;
          cursor: pointer;
          padding: 0.5rem;
        }
        
        .app-content {
          display: flex;
          flex: 1;
          position: relative;
        }
        
        .sidebar {
          background-color: white;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
          z-index: 40;
          overflow-y: auto;
        }
        
        .sidebar-header {
          padding: 1.5rem 1rem 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          padding: 1rem;
          gap: 0.5rem;
        }
        
        .nav-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          border: none;
          background-color: transparent;
          color: #4b5563;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .nav-button:hover {
          background-color: #f3f4f6;
        }
        
        .nav-button.active {
          background-color: #3b82f6;
          color: white;
        }
        
        .nav-icon {
          font-size: 1.125rem;
          display: flex;
        }
        
        .nav-label {
          flex: 1;
          text-align: left;
        }
        
        .logout-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          border: none;
          background-color: #fee2e2;
          color: #dc2626;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.2s ease;
        }
        
        .logout-button:hover {
          background-color: #fecaca;
        }
        
        .main-content {
          flex: 1;
          padding: 1.5rem;
          width: 100%;
          transition: all 0.3s ease;
        }
        
        /* Desktop styles */
        @media (min-width: 768px) {
          .sidebar {
            width: 240px;
            height: 100vh;
            position: sticky;
            top: 0;
          }
          
          .main-content.sidebar-open {
            width: calc(100% - 240px);
            margin-left: 100px;
          }
        }
        
        /* Mobile styles */
        @media (max-width: 767px) {
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: 260px;
            transform: translateX(-100%);
          }
          
          .sidebar.open {
            transform: translateX(0);
          }
          
          .main-content {
            padding: 1rem;
          }
        }
        
        /* Small mobile devices */
        @media (max-width: 480px) {
          .sidebar {
            width: 220px;
          }
          
          .main-content {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
