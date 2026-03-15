import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#f9fafb', fontFamily: 'system-ui, sans-serif', padding: '20px'
        }}>
          <div style={{
            maxWidth: '500px', backgroundColor: 'white', padding: '40px',
            borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center'
          }}>
            <h1 style={{ color: '#ef4444', marginBottom: '16px', fontSize: '24px' }}>Oops! Something went wrong.</h1>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              We're sorry, but an unexpected error occurred. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#3b82f6', color: 'white', padding: '10px 20px',
                borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
