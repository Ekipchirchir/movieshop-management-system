import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend);

function Dashboard() {
  const [salesData, setSalesData] = useState([]);
  const [kpis, setKpis] = useState({ totalSales: 0, topEntity: '', customerCount: 0, averageSale: 0 });
  const [period, setPeriod] = useState('daily');
  const [entityFilter, setEntityFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSales = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      console.log('Token sent:', token); // Debug token
      if (!token) {
        setError('Please log in to view dashboard');
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }

      const query = new URLSearchParams({
        period,
        ...(entityFilter !== 'all' && { entity: entityFilter }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
      }).toString();

      const response = await fetch(`http://localhost:5000/api/sales?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 401) {
        // Attempt to refresh token
        const refreshResponse = await fetch('http://localhost:5000/api/refresh-token', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (refreshResponse.ok) {
          const { token: newToken } = await refreshResponse.json();
          localStorage.setItem('token', newToken);
          // Retry the original request
          const retryResponse = await fetch(`http://localhost:5000/api/sales?${query}`, {
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
        throw new Error('Failed to fetch sales data');
      } else {
        const data = await response.json();
        processSalesData(data);
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError(err.message || 'Failed to load dashboard data');
      setSalesData([]);
    }
    setLoading(false);
  };

  const processSalesData = (data) => {
    if (!Array.isArray(data)) {
      console.error('Expected array, got:', data);
      setError('Invalid data format from server');
      setSalesData([]);
      return;
    }
    setSalesData(data);

    // Calculate KPIs
    const totalSales = data.reduce((sum, item) => sum + item.total, 0);
    const saleCount = data.reduce((sum, item) => sum + item.entities.reduce((c, e) => c + e.count, 0), 0);
    const averageSale = saleCount > 0 ? (totalSales / saleCount).toFixed(2) : 0;
    const entityTotals = data.flatMap(item => item.entities)
      .reduce((acc, curr) => ({
        ...acc,
        [curr.entity]: (acc[curr.entity] || 0) + curr.totalAmount,
      }), {});
    const topEntity = Object.entries(entityTotals).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0])[0];

    const customerResponse = fetch('http://localhost:5000/api/customers', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    }).then(res => {
      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return Promise.reject('Unauthorized');
      }
      return res.json();
    }).then(customers => {
      setKpis({ totalSales, topEntity, customerCount: customers.length, averageSale });
    }).catch(err => {
      console.error('Error fetching customers:', err);
      setError('Failed to load customer data');
    });
  };

  useEffect(() => {
    fetchSales();
    const interval = setInterval(fetchSales, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [period, entityFilter, dateRange]);

  const handleExport = async () => {
    try {
      const query = new URLSearchParams({
        period,
        ...(entityFilter !== 'all' && { entity: entityFilter }),
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
      }).toString();
      const response = await fetch(`http://localhost:5000/api/sales/export?${query}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-${period}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error exporting data: ' + err.message);
    }
  };

  const barChartData = {
    labels: salesData.map(item => item._id || period),
    datasets: [
      {
        label: 'Sales (KES)',
        data: salesData.map(item => item.total),
        backgroundColor: '#36A2EB',
        borderColor: '#1E3A8A',
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: ['Movie Shop', 'PlayStation Game', 'PlayStation Rental', 'Wi-Fi Vending'],
    datasets: [{
      data: [
        salesData.flatMap(item => item.entities.find(e => e.entity === 'movie')?.totalAmount || 0).reduce((a, b) => a + b, 0),
        salesData.flatMap(item => item.entities.find(e => e.entity === 'playstation_game')?.totalAmount || 0).reduce((a, b) => a + b, 0),
        salesData.flatMap(item => item.entities.find(e => e.entity === 'playstation_rental')?.totalAmount || 0).reduce((a, b) => a + b, 0),
        salesData.flatMap(item => item.entities.find(e => e.entity === 'wifi')?.totalAmount || 0).reduce((a, b) => a + b, 0),
      ],
      backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'],
      borderColor: ['#1E3A8A', '#9F1239', '#D97706', '#0E7490'],
      borderWidth: 1,
    }],
  };

  const lineChartData = {
    labels: salesData.map(item => item._id || period),
    datasets: [
      {
        label: 'Sales Trend (KES)',
        data: salesData.map(item => item.total),
        fill: false,
        borderColor: '#10B981',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 14 } } },
      title: {
        display: true,
        text: `${period.charAt(0).toUpperCase() + period.slice(1)} Sales`,
        font: { size: 20, weight: '700' },
        color: '#1E40AF',
      },
      tooltip: { enabled: true },
    },
    animation: { duration: 1000, easing: 'easeOutQuart' },
  };

  return (
    <div style={{
      display: 'grid',
      gap: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#111827',
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1E40AF',
          marginBottom: '16px',
        }}>
          Business Dashboard
        </h2>
        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              fontSize: '16px',
              backgroundColor: '#F9FAFB',
              outline: 'none',
              width: '200px',
            }}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              fontSize: '16px',
              backgroundColor: '#F9FAFB',
              outline: 'none',
              width: '200px',
            }}
          >
            <option value="all">All Entities</option>
            <option value="movie">Movie Shop</option>
            <option value="playstation_game">PlayStation Game</option>
            <option value="playstation_rental">PlayStation Rental</option>
            <option value="wifi">Wi-Fi Vending</option>
          </select>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              fontSize: '16px',
              backgroundColor: '#F9FAFB',
              outline: 'none',
              width: '200px',
            }}
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              fontSize: '16px',
              backgroundColor: '#F9FAFB',
              outline: 'none',
              width: '200px',
            }}
          />
          <button
            onClick={handleExport}
            style={{
              padding: '12px 24px',
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
            Export CSV
          </button>
        </div>
      </div>
      {error && (
        <p style={{
          fontSize: '16px',
          color: '#DC2626',
          textAlign: 'center',
          backgroundColor: '#FFF1F2',
          padding: '12px',
          borderRadius: '8px',
        }}>
          {error}
        </p>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}>
        {[
          { label: 'Total Sales', value: `${kpis.totalSales} KES`, color: '#1E40AF' },
          { label: 'Top Entity', value: kpis.topEntity || 'N/A', color: '#10B981' },
          { label: 'Customers', value: kpis.customerCount, color: '#FF6384' },
          { label: 'Average Sale', value: `${kpis.averageSale} KES`, color: '#4BC0C0' },
        ].map((kpi, index) => (
          <div key={index} style={{
            backgroundColor: '#FFFFFF',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#4B5563' }}>
              {kpi.label}
            </h3>
            <p style={{ fontSize: '24px', fontWeight: '700', color: kpi.color }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>
      {loading ? (
        <p style={{
          fontSize: '16px',
          color: '#111827',
          textAlign: 'center',
          padding: '24px',
        }}>
          Loading...
        </p>
      ) : salesData.length === 0 ? (
        <p style={{
          fontSize: '16px',
          color: '#111827',
          textAlign: 'center',
          padding: '24px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
        }}>
          No sales data available for the selected filters
        </p>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{ height: '400px' }}>
              <Bar data={barChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Sales by Period' } } }} />
            </div>
            <div style={{ height: '400px' }}>
              <Pie data={pieChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Sales by Entity' } } }} />
            </div>
          </div>
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{ height: '400px' }}>
              <Line data={lineChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Sales Trend' } } }} />
            </div>
          </div>
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
            overflowX: 'auto',
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1E40AF',
              marginBottom: '16px',
            }}>
              Recent Sales
            </h3>
            <table style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: '0 8px',
              color: '#111827',
            }}>
              <thead>
                <tr>
                  {['Entity', 'Amount (KES)', 'Date', 'Customer'].map(header => (
                    <th key={header} style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1E40AF',
                      padding: '12px',
                      textAlign: 'left',
                      backgroundColor: '#F9FAFB',
                    }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {salesData.flatMap(item => item.entities.map(entity => ({
                  entity: entity.entity,
                  amount: entity.totalAmount,
                  date: item._id,
                  customer: entity.customerName || 'N/A',
                }))).slice(0, 10).map((sale, index) => (
                  <tr key={index} style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    borderRadius: '8px',
                  }}>
                    <td style={{
                      padding: '12px',
                      fontSize: '14px',
                      color: '#4B5563',
                      borderTopLeftRadius: '8px',
                      borderBottomLeftRadius: '8px',
                    }}>
                      {sale.entity.replace('_', ' ')}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#4B5563' }}>
                      {sale.amount}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#4B5563' }}>
                      {sale.date}
                    </td>
                    <td style={{
                      padding: '12px',
                      fontSize: '14px',
                      color: '#4B5563',
                      borderTopRightRadius: '8px',
                      borderBottomRightRadius: '8px',
                    }}>
                      {sale.customer}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;