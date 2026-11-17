import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ZELORA Uncaught Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0B0B0E',
          color: '#F6F6F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: "'Montserrat', sans-serif"
        }}>
          <div style={{
            maxWidth: '460px',
            width: '100%',
            backgroundColor: '#131318',
            border: '1px solid #2E2E38',
            borderRadius: '12px',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(198, 166, 100, 0.12)',
              border: '1px solid rgba(198, 166, 100, 0.3)',
              color: '#C6A664',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '20px',
              fontWeight: 700
            }}>
              Z
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '1px', marginBottom: '8px', color: '#F6F6F9' }}>
              Experience Interrupted
            </h2>
            <p style={{ fontSize: '13px', color: '#9E9EA8', lineHeight: 1.6, marginBottom: '24px' }}>
              A temporary interface state transition occurred. Your session and data remain secure.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#C6A664',
                  color: '#0B0B0E',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                style={{
                  backgroundColor: '#1A1A24',
                  color: '#F6F6F9',
                  border: '1px solid #2E2E38',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
