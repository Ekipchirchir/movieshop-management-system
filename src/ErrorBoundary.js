import React, { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '24px',
          textAlign: 'center',
          color: '#DC2626',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: '16px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
