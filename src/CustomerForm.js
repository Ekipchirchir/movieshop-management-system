import React, { useState } from 'react';

function CustomerForm() {
  const [formData, setFormData] = useState({
    idNumber: '',
    name: '',
    address: '',
  });
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.idNumber || !formData.name || !formData.address) {
      setMessage('All customer details are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          entity: 'playstation_rental',
          amount: 500,
          idNumber: formData.idNumber,
          name: formData.name,
          address: formData.address,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage('Customer and rental recorded successfully!');
        setFormData({ idNumber: '', name: '', address: '' });
      } else {
        setMessage(result.message || 'Error recording customer');
      }
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
    setShowConfirm(false);
  };

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
      maxWidth: '600px',
      margin: '0 auto',
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '700',
        color: '#1E40AF',
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        Add PlayStation Rental Customer
      </h2>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
            ID Number
          </label>
          <input
            type="text"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            required
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              fontSize: '16px',
              backgroundColor: '#F9FAFB',
              outline: 'none',
              transition: 'border-color 0.3s ease',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              fontSize: '16px',
              backgroundColor: '#F9FAFB',
              outline: 'none',
              transition: 'border-color 0.3s ease',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              fontSize: '16px',
              backgroundColor: '#F9FAFB',
              outline: 'none',
              transition: 'border-color 0.3s ease',
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '12px',
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
          Add Customer & Record Rental
        </button>
      </form>
      {message && (
        <p style={{
          marginTop: '16px',
          fontSize: '16px',
          color: message.includes('Error') ? '#DC2626' : '#10B981',
          textAlign: 'center',
        }}>
          {message}
        </p>
      )}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
            maxWidth: '400px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '16px', color: '#111827', marginBottom: '24px' }}>
              Confirm adding customer and recording rental?
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={confirmSubmit}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerForm;