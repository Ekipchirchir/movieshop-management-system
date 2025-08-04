import React, { useState, useEffect } from 'react';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://movieshop.up.railway.app/api/customers?search=${search}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();
        setCustomers(data);
      } catch (err) {
        console.error('Error fetching customers:', err);
      }
      setLoading(false);
    };
    fetchCustomers();
  }, [search]);

  const handleExport = async () => {
    try {
      const response = await fetch('https://movieshop.up.railway.app/api/customers', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const customers = await response.json();
      const csv = [
        'ID Number,Name,Address,Created At',
        ...customers.map(c => `${c.idNumber},${c.name},${c.address},${new Date(c.createdAt).toLocaleDateString()}`),
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'customers.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting customers:', err);
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
        PlayStation Rental Customers
      </h2>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <input
          type="text"
          placeholder="Search by name or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #D1D5DB',
            fontSize: '14px',
            backgroundColor: '#F9FAFB',
            outline: 'none',
            width: '100%',
          }}
        />
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
      {loading ? (
        <p style={{
          fontSize: '14px',
          color: '#111827',
          textAlign: 'center',
        }}>
          Loading...
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0 6px',
            color: '#111827',
            minWidth: '600px',
          }}>
            <thead>
              <tr>
                {['ID Number', 'Name', 'Address', 'Created At'].map((header) => (
                  <th key={header} style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1E40AF',
                    padding: '8px',
                    textAlign: 'left',
                    backgroundColor: '#F9FAFB',
                  }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id} style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  borderRadius: '6px',
                }}>
                  <td style={{
                    padding: '8px',
                    fontSize: '13px',
                    color: '#4B5563',
                    borderTopLeftRadius: '6px',
                    borderBottomLeftRadius: '6px',
                  }}>
                    {customer.idNumber}
                  </td>
                  <td style={{ padding: '8px', fontSize: '13px', color: '#4B5563' }}>
                    {customer.name}
                  </td>
                  <td style={{ padding: '8px', fontSize: '13px', color: '#4B5563' }}>
                    {customer.address}
                  </td>
                  <td style={{
                    padding: '8px',
                    fontSize: '13px',
                    color: '#4B5563',
                    borderTopRightRadius: '6px',
                    borderBottomRightRadius: '6px',
                  }}>
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <style jsx>{`
        @media (max-width: 480px) {
          div[style*="maxWidth: '100%'"] {
            padding: 12px;
          }
          h2 {
            font-size: 18px;
          }
          input, button {
            font-size: 13px;
            padding: 8px;
          }
          th, td {
            font-size: 12px;
            padding: 6px;
          }
        }
      `}</style>
    </div>
  );
}

export default CustomerList;
