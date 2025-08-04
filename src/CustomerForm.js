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
      const response = await fetch('https://movieshop.up.railway.app/api/sales', {
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
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      maxWidth: '100%',
      margin: '0 auto',
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#1E40AF',
        marginBottom: '16px',
        textAlign: 'center',
      }}>
        Add PlayStation Rental Customer
      </h2>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
            ID Number
          </label>
          <input
            type="text"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            required
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '14px',
              backgroundColor: '#F9FAFB',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '14px',
              backgroundColor: '#F9FAFB',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '14px',
              backgroundColor: '#F9FAFB',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px',
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
          Add Customer & Record Rental
        </button>
      </form>
      {message && (
        <p style={{
          marginTop: '12px',
          fontSize: '14px',
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
          padding: '10px',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            maxWidth: '90%',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '14px', color: '#111827', marginBottom: '16px' }}>
              Confirm adding customer and recording rental?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={confirmSubmit}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
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
          div[style*="maxWidth: '90%'"] {
            max-width: 95%;
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
}

export default CustomerForm;
