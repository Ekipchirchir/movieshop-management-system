import React, { useState, useEffect, useCallback } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { FiDownload, FiFilter, FiDollarSign, FiTrendingUp, FiUsers, FiAward, FiRefreshCw } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend);

function Dashboard() {
  const [salesData, setSalesData] = useState([]);
  const [kpis, setKpis] = useState({ 
    totalSales: 0, 
    topEntity: '', 
    customerCount: 0, 
    averageSale: 0 
  });
  const [period, setPeriod] = useState('daily');
  const [entityFilter, setEntityFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('');

  const formatEntityName = useCallback((entity) => {
    if (!entity) return 'N/A';
    return entity
      .replace('_', ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }, []);

  const fetchCustomerCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://movieshop.up.railway.app/api/customers', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const customers = await response.json();
        setKpis(prev => ({
          ...prev,
          customerCount: Array.isArray(customers) ? customers.length : 0
        }));
      }
    } catch (err) {
      // Optionally handle error
    }
  }, []);

  const processSalesData = useCallback((data) => {
    if (!Array.isArray(data)) {
      console.error('Expected array, got:', data);
      setError('Invalid data format from server');
      setSalesData([]);
      return;
    }

    setSalesData(data);

    const totalSales = data.reduce((sum, item) => sum + (item.total || 0), 0);
    const saleCount = data.reduce((sum, item) => 
      sum + (item.entities?.reduce((c, e) => c + (e.count || 0), 0) || 0)
    , 0);
    const averageSale = saleCount > 0 ? (totalSales / saleCount).toFixed(2) : 0;

    const entityTotals = data.flatMap(item => item.entities || [])
      .reduce((acc, curr) => ({
        ...acc,
        [curr.entity]: (acc[curr.entity] || 0) + (curr.totalAmount || 0),
      }), {});

    const topEntity = Object.entries(entityTotals).reduce((a, b) => 
      a[1] > b[1] ? a : b, ['', 0]
    )[0];

    fetchCustomerCount();
    
    setKpis({ 
      totalSales, 
      topEntity: formatEntityName(topEntity), 
      customerCount: 0,
      averageSale 
    });
  }, [fetchCustomerCount, formatEntityName]);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view dashboard');
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }

      const queryObj = {
        period,
        ...(entityFilter !== 'all' && { entity: entityFilter }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
      };

      const query = new URLSearchParams(queryObj).toString();
      const response = await fetch(`https://movieshop.up.railway.app/api/sales?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 401) {
        const refreshResponse = await fetch('https://movieshop.up.railway.app/api/refresh-token', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (refreshResponse.ok) {
          const { token: newToken } = await refreshResponse.json();
          localStorage.setItem('token', newToken);
          const retryResponse = await fetch(`https://movieshop.up.railway.app/api/sales?${query}`, {
            headers: { 'Authorization': `Bearer ${newToken}` },
          });
          
          if (!retryResponse.ok) {
            throw new Error('Failed to fetch sales data after token refresh');
          }
          const data = await retryResponse.json();
          processSalesData(data);
        } else {
          localStorage.removeItem('token');
          window.location.href = '/';
          return;
        }
      } else if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      } else {
        const data = await response.json();
        processSalesData(data);
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError(err.message || 'Failed to load dashboard data');
      setSalesData([]);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date().toLocaleTimeString());
    }
  }, [period, entityFilter, dateRange, processSalesData]);

  useEffect(() => {
    fetchSales();
    const interval = setInterval(fetchSales, 300000);
    return () => clearInterval(interval);
  }, [fetchSales]);

  const handleExport = async () => {
    try {
      const query = new URLSearchParams({
        period,
        ...(entityFilter !== 'all' && { entity: entityFilter }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
      }).toString();

      const token = localStorage.getItem('token');
      const response = await fetch(`https://movieshop.up.railway.app/api/sales/export?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-export-${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        throw new Error('Export failed');
      }
    } catch (err) {
      setError('Error exporting data: ' + err.message);
    }
  };

  const handleRefresh = () => {
    fetchSales();
  };

  const handleDateChange = (type, value) => {
    setDateRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const barChartData = {
    labels: salesData.map(item => item._id || 'N/A'),
    datasets: [{
      label: 'Sales (KES)',
      data: salesData.map(item => item.total || 0),
      backgroundColor: '#3B82F6',
      borderColor: '#2563EB',
      borderWidth: 1,
    }],
  };

  const pieChartData = {
    labels: ['Movie Shop', 'PlayStation Games', 'PlayStation Rental', 'Internet'],
    datasets: [{
      data: [
        salesData.flatMap(item => item.entities?.find(e => e.entity === 'movie')?.totalAmount || 0).reduce((a, b) => a + b, 0),
        salesData.flatMap(item => item.entities?.find(e => e.entity === 'playstation_game')?.totalAmount || 0).reduce((a, b) => a + b, 0),
        salesData.flatMap(item => item.entities?.find(e => e.entity === 'playstation_rental')?.totalAmount || 0).reduce((a, b) => a + b, 0),
        salesData.flatMap(item => item.entities?.find(e => e.entity === 'wifi')?.totalAmount || 0).reduce((a, b) => a + b, 0),
      ],
      backgroundColor: ['#3B82F6', '#EF4444', '#FBBF24', '#10B981'],
      borderColor: ['#2563EB', '#B91C1C', '#D97706', '#059669'],
      borderWidth: 1,
    }],
  };

  const lineChartData = {
    labels: salesData.map(item => item._id || 'N/A'),
    datasets: [{
      label: 'Sales Trend (KES)',
      data: salesData.map(item => item.total || 0),
      fill: false,
      borderColor: '#10B981',
      tension: 0.4,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `${period.charAt(0).toUpperCase() + period.slice(1)} Sales`,
        font: { size: 14, weight: '600' },
        color: '#1E40AF',
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.raw} KES`
        }
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => `${value} KES`,
          font: { size: 10 }
        }
      },
      x: {
        ticks: {
          font: { size: 10 }
        }
      }
    }
  };

  const kpiCards = [
    { 
      label: 'Total Sales', 
      value: `${kpis.totalSales.toLocaleString()} KES`, 
      color: '#1E40AF', 
      icon: <FiDollarSign /> 
    },
    { 
      label: 'Top Entity', 
      value: kpis.topEntity || ' ', 
      color: '#10B981', 
      icon: <FiAward /> 
    },
    { 
      label: 'Customers', 
      value: kpis.customerCount.toLocaleString(), 
      color: '#EF4444', 
      icon: <FiUsers /> 
    },
    { 
      label: 'Avg Sale', 
      value: `${kpis.averageSale} KES`, 
      color: '#FBBF24', 
      icon: <FiTrendingUp /> 
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h2>Business Dashboard</h2>
        <div className="dashboard-actions">
          <button 
            className="refresh-button"
            onClick={handleRefresh}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          {lastRefreshed && (
            <span className="last-refreshed">
              {lastRefreshed}
            </span>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className={`filter-panel ${isFilterOpen ? 'open' : ''}`}>
        <div className="filter-group">
          <label>Period:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Entity:</label>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          >
            <option value="all">All Entities</option>
            <option value="movie">Movie Shop</option>
            <option value="playstation_game">PlayStation Game</option>
            <option value="playstation_rental">PlayStation Rental</option>
            <option value="wifi">Internet</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Start Date:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => handleDateChange('start', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>End Date:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => handleDateChange('end', e.target.value)}
          />
        </div>

        <button 
          className="apply-filters"
          onClick={() => {
            setIsFilterOpen(false);
            fetchSales();
          }}
        >
          Apply Filters
        </button>
      </div>

      {/* Mobile Filter Toggle */}
      <button 
        className="filter-toggle"
        onClick={() => setIsFilterOpen(!isFilterOpen)}
      >
        <FiFilter />
        <span>{isFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
      </button>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiCards.map((kpi, index) => (
          <div key={index} className="kpi-card">
            <div className="kpi-icon" style={{ color: kpi.color }}>
              {kpi.icon}
            </div>
            <div className="kpi-content">
              <h3>{kpi.label}</h3>
              <p style={{ color: kpi.color }}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          Loading dashboard data...
        </div>
      )}

      {/* Empty State */}
      {!loading && salesData.length === 0 && (
        <div className="empty-state">
          <p>No sales data available for the selected filters</p>
          <button onClick={fetchSales}>Try Again</button>
        </div>
      )}

      {/* Data Visualization */}
      {!loading && salesData.length > 0 && (
        <>
          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-container">
              <h3>Sales by Period</h3>
              <div className="chart-wrapper">
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </div>

            <div className="chart-container">
              <h3>Sales by Entity</h3>
              <div className="chart-wrapper">
                <Pie data={pieChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="chart-container full-width">
            <h3>Sales Trend</h3>
            <div className="chart-wrapper">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>

          {/* Recent Sales Table */}
          <div className="recent-sales">
            <div className="section-header">
              <h3>Recent Sales</h3>
              <button 
                className="export-button"
                onClick={handleExport}
              >
                <FiDownload />
                <span>Export CSV</span>
              </button>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Entity</th>
                    <th>Amount (KES)</th>
                    <th>Date</th>
                    <th>Customer</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.flatMap(item => 
                    (item.entities || []).map(entity => ({
                      entity: entity.entity,
                      amount: entity.totalAmount,
                      date: item._id,
                      customer: entity.customerName || '',
                    }))
                  ).slice(0, 10).map((sale, index) => (
                    <tr key={index}>
                      <td>{formatEntityName(sale.entity)}</td>
                      <td>{sale.amount?.toLocaleString() || '0'}</td>
                      <td>{sale.date || ' '}</td>
                      <td>{sale.customer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Styles */}
      <style jsx>{`
        .dashboard-container {
          padding: 0.5rem;
          background-color: #f8fafc;
          font-family: 'Inter', sans-serif;
          max-width: 100%;
          overflow-x: hidden;
        }

        .dashboard-header {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .dashboard-header h2 {
          font-size: 1.25rem;
          color: #1e40af;
          margin: 0;
        }

        .dashboard-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          justify-content: space-between;
        }

        .refresh-button {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: background-color 0.2s;
          font-size: 0.75rem;
        }

        .refresh-button:hover {
          background-color: #2563eb;
        }

        .refresh-button:disabled {
          background-color: #93c5fd;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .last-refreshed {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.25rem;
          margin-bottom: 0.75rem;
          cursor: pointer;
          font-size: 0.75rem;
        }

        .filter-toggle:hover {
          background-color: #f9fafb;
        }

        .filter-panel {
          display: ${isFilterOpen ? 'grid' : 'none'};
          grid-template-columns: 1fr;
          gap: 0.75rem;
          background-color: white;
          padding: 0.75rem;
          border-radius: 0.25rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 1rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .filter-group label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #4b5563;
        }

        .filter-group select,
        .filter-group input {
          padding: 0.4rem;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          width: 100%;
        }

        .apply-filters {
          padding: 0.4rem;
          background-color: #10b981;
          color: white;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: background-color 0.2s;
          font-size: 0.75rem;
        }

        .apply-filters:hover {
          background-color: #059669;
        }

        .error-message {
          padding: 0.75rem;
          background-color: #fee2e2;
          color: #dc2626;
          border-radius: 0.25rem;
          margin-bottom: 1rem;
          text-align: center;
          font-size: 0.75rem;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .kpi-card {
          background-color: white;
          border-radius: 0.25rem;
          padding: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .kpi-icon {
          font-size: 1.25rem;
          padding: 0.4rem;
          border-radius: 50%;
          background-color: rgba(59, 130, 246, 0.1);
          display: flex;
        }

        .kpi-content h3 {
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
          margin: 0 0 0.2rem;
        }

        .kpi-content p {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background-color: white;
          border-radius: 0.25rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 1rem;
          gap: 0.75rem;
          font-size: 0.75rem;
        }

        .spinner {
          width: 1.5rem;
          height: 1.5rem;
          border: 0.2rem solid rgba(59, 130, 246, 0.1);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .empty-state {
          padding: 1.5rem;
          background-color: white;
          border-radius: 0.25rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          text-align: center;
          margin-bottom: 1rem;
          font-size: 0.75rem;
        }

        .empty-state button {
          padding: 0.4rem 0.8rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.25rem;
          margin-top: 0.75rem;
          cursor: pointer;
          font-size: 0.75rem;
        }

        .charts-section {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .chart-container {
          background-color: white;
          border-radius: 0.25rem;
          padding: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .chart-container h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e40af;
          margin: 0 0 0.75rem;
        }

        .chart-wrapper {
          height: 200px;
          position: relative;
          width: 100%;
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .recent-sales {
          background-color: white;
          border-radius: 0.25rem;
          padding: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .section-header h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e40af;
          margin: 0;
        }

        .export-button {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          background-color: #10b981;
          color: white;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
          font-size: 0.75rem;
        }

        .table-container {
          overflow-x: auto;
          width: 100%;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.75rem;
        }

        th {
          font-weight: 600;
          color: #1e40af;
          padding: 0.5rem;
          background-color: #f9fafb;
          text-align: left;
          white-space: nowrap;
        }

        td {
          color: #4b5563;
          padding: 0.5rem;
          background-color: white;
          border-top: 1px solid #f3f4f6;
          border-bottom: 1px solid #f3f4f6;
          white-space: nowrap;
        }

        tr:hover td {
          background-color: #f9fafb;
        }

        td:first-child {
          border-left: 1px solid #f3f4f6;
          border-top-left-radius: 0.25rem;
          border-bottom-left-radius: 0.25rem;
        }

        td:last-child {
          border-right: 1px solid #f3f4f6;
          border-top-right-radius: 0.25rem;
          border-bottom-right-radius: 0.25rem;
        }

        /* Responsive Styles */
        @media (min-width: 640px) {
          .dashboard-container {
            padding: 1rem;
          }

          .dashboard-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
          }

          .dashboard-header h2 {
            font-size: 1.5rem;
          }

          .refresh-button {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }

          .last-refreshed {
            font-size: 0.875rem;
          }

          .filter-toggle {
            display: none;
          }

          .filter-panel {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            padding: 1rem;
            gap: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
          }

          .filter-group label {
            font-size: 0.875rem;
          }

          .filter-group select,
          .filter-group input {
            padding: 0.5rem;
            font-size: 0.875rem;
          }

          .apply-filters {
            padding: 0.5rem;
            font-size: 0.875rem;
          }

          .error-message {
            padding: 1rem;
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
          }

          .kpi-grid {
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .kpi-card {
            padding: 1rem;
          }

          .kpi-icon {
            font-size: 1.5rem;
            padding: 0.5rem;
          }

          .kpi-content h3 {
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
          }

          .kpi-content p {
            font-size: 1.25rem;
          }

          .loading-state {
            padding: 2rem;
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
          }

          .spinner {
            width: 2rem;
            height: 2rem;
            border-width: 0.25rem;
          }

          .empty-state {
            padding: 2rem;
            font-size: 0.875rem;
            margin-bottom: 1.5rem;
          }

          .empty-state button {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            margin-top: 1rem;
          }

          .charts-section {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .chart-container {
            padding: 1rem;
          }

          .chart-container h3 {
            font-size: 1rem;
            margin-bottom: 1rem;
          }

          .chart-wrapper {
            height: 250px;
          }

          .section-header {
            margin-bottom: 1rem;
          }

          .section-header h3 {
            font-size: 1rem;
          }

          .export-button {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }

          th, td {
            padding: 0.75rem;
            font-size: 0.875rem;
          }
        }

        @media (min-width: 1024px) {
          .filter-panel {
            grid-template-columns: repeat(4, 1fr);
          }

          .apply-filters {
            grid-column: auto;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
