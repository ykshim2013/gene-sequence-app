import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          background: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          margin: '2rem',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>
            Oops! Something went wrong
          </h2>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
            We're sorry, but there was an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </p>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ 
              textAlign: 'left', 
              background: '#f1f3f4', 
              padding: '1rem', 
              borderRadius: '4px',
              marginTop: '1rem'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{ 
                color: '#dc3545', 
                fontSize: '0.875rem', 
                overflow: 'auto',
                marginTop: '0.5rem'
              }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;