import React from 'react';

// Error notice component based on provided JSX.
// Props:
// - show: boolean
// - message: string (defaults to provided text)
// - onClose: function
// - className: string (optional)
// - style: object (optional)
export default function ErrorNotice({
  show = false,
  message = 'Oops! Something went terribly wrong.',
  onClose = () => {},
  className = '',
  style = {},
}) {
  if (!show) return null;

  return (
    <div className="toast-overlay" style={{ ...style }}>
      <div className={`error-card ${className}`} role="alert" aria-live="assertive">
        <button type="button" aria-label="Tutup" className="notice-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M3 3l8 8M11 3 3 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <div className="error-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 17h.01" stroke="var(--bad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9m9-1V7" stroke="var(--bad)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="error-title">Terjadi Kesalahan</h2>
        <p className="error-message">{message}</p>
      </div>
    </div>
  );
}