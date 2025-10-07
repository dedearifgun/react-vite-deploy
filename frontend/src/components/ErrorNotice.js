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

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#dc2626', // red-600
    maxWidth: '20rem',
    width: '100%',
    background: 'rgba(220,38,38,0.1)', // red-600/10
    height: '2.5rem', // h-10
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    borderRadius: 8,
    ...style,
  };

  const railStyle = {
    height: '100%',
    width: '6px',
    background: '#dc2626',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  };

  const bodyStyle = {
    display: 'flex',
    alignItems: 'center',
  };

  const messageStyle = {
    fontSize: '0.875rem',
    marginLeft: '0.5rem',
  };

  const closeBtnStyle = {
    marginRight: '0.75rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit',
  };

  return (
    <div className={className} style={containerStyle} role="alert" aria-live="assertive">
      <div style={railStyle} aria-hidden="true"></div>
      <div style={bodyStyle}>
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path style={{ fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 1.95 }} d="M11.95 16.5h.1" />
          <path d="M3 12a9 9 0 0 1 9-9h0a9 9 0 0 1 9 9h0a9 9 0 0 1-9 9h0a9 9 0 0 1-9-9m9 0V7" style={{ fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 1.5 }} />
        </svg>
        <p style={messageStyle}>{message}</p>
      </div>
      <button type="button" aria-label="Tutup" style={closeBtnStyle} onClick={onClose}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}