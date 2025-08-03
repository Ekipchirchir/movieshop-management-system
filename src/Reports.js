import React, { useState } from 'react';

function Reports() {
  const [period, setPeriod] = useState('daily');

  const handleExport = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/sales/export/${period}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-${period}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting sales:', err);
    }
  };

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '700',
        color: '#1E40AF',
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        Sales Reports
      </h2>
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
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
            transition: 'border-color 0.3s ease',
            width: '200px',
          }}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
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
      <p style={{
        fontSize: '16px',
        color: '#4B5563',
        textAlign: 'center',
      }}>
        Select a period and click "Export CSV" to download sales data.
      </p>
    </div>
  );
}

export default Reports;

