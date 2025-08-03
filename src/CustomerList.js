import React, { useState, useEffect } from 'react';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/customers?search=${search}`, {
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
      const response = await fetch('http://localhost:5000/api/customers', {
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
        PlayStation Rental Customers
      </h2>
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        <input
          type="text"
          placeholder="Search by name or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #D1D5DB',
            fontSize: '16px',
            backgroundColor: '#F9FAFB',
            outline: 'none',
            flex: 1,
            minWidth: '200px',
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
      {loading ? (
        <p style={{
          fontSize: '16px',
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
            borderSpacing: '0 8px',
            color: '#111827',
          }}>
            <thead>
              <tr>
                {['ID Number', 'Name', 'Address', 'Created At'].map((header) => (
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
              {customers.map((customer) => (
                <tr key={customer._id} style={{
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
                    {customer.idNumber}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#4B5563' }}>
                    {customer.name}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#4B5563' }}>
                    {customer.address}
                  </td>
                  <td style={{
                    padding: '12px',
                    fontSize: '14px',
                    color: '#4B5563',
                    borderTopRightRadius: '8px',
                    borderBottomRightRadius: '8px',
                  }}>
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CustomerList;