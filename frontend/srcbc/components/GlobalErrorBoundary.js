import React from 'react';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Optional: log to monitoring
    console.error('GlobalErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="with-navbar-offset container py-5 text-center">
          <h2>Maaf, terjadi kesalahan.</h2>
          <p>Coba muat ulang halaman atau kembali ke beranda.</p>
          <a className="btn btn-primary mt-3" href="/">Kembali ke Beranda</a>
        </div>
      );
    }
    return this.props.children;
  }
}

export default GlobalErrorBoundary;