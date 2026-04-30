import React from 'react';
import useThemeMode from '../hooks/useThemeMode';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#ffebee', color: '#c62828', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2>Something went wrong in the Dashboard UI.</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px', background: '#fff', padding: '20px', borderRadius: '8px' }}>
            <summary style={{ fontWeight: 'bold', cursor: 'pointer' }}>Click to view exactly what caused this (Error details)</summary>
            {this.state.error && <p style={{ fontWeight: 'bold', marginTop: '10px' }}>{this.state.error.toString()}</p>}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <p style={{ marginTop: '20px' }}><strong>Please copy the text inside the details dropdown and paste it to me so I can fix the exact bug!</strong></p>
        </div>
      );
    }
    return this.props.children;
  }
}
