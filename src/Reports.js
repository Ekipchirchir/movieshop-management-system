import React, { useState } from 'react';

function Reports() {
  const [period, setPeriod] = useState('daily');

  const handleExport = async () => {
    try {
      const response = await fetch(`https://movieshop.up.railway.app/api/sales/export/${period}`, {
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
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      maxWidth: '100%',
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#1E40AF',
        marginBottom: '16px',
        textAlign: 'center',
      }}>
        Sales Reports
      </h2>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '16px',
        alignItems: 'center',
      }}>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #D1D5DB',
            fontSize: '14px',
            backgroundColor: '#F9FAFB',
            outline: 'none',
            width: '100%',
            maxWidth: '200px',
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
            padding: '8px 16px',
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
          Export CSV
        </button>
      </div>
      <p style={{
        fontSize: '14px',
        color: '#4B5563',
        textAlign: 'center',
      }}>
        Select a period and click "Export CSV" to download sales data.
      </p>
      <style jsx>{`
        @media (max-width: 480px) {
          div[style*="maxWidth: '100%'"] {
            padding: 12px;
          }
          h2 {
            font-size: 18px;
          }
          select, button {
            font-size: 13px;
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
}

export default Reports;
