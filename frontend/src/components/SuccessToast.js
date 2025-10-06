import React from 'react';

// Reusable Success Toast Notification (Bootstrap-styled)
// Props:
// - show: boolean (render toast when true)
// - title: string
// - message: string
// - onClose: function
// - className: string (optional extra classes)
// - style: object (optional inline styles)
export default function SuccessToast({
  show = false,
  title = 'Berhasil! ',
  message = 'Aksi berhasil dilakukan.',
  onClose = () => {},
  className = '',
  style = {},
}) {
  if (!show) return null;

  return (
    <div
      className={`success-card ${className}`}
      role="alert"
      style={{ ...style }}
    >
      <button
        type="button"
        aria-label="Tutup"
        className="success-close"
        onClick={onClose}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 3l8 8M11 3 3 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      <div className="success-icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-4.5-3.5-5.5 6-2.5-2.5" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="success-title">{title}</h2>
      <p className="success-message">{message}</p>
    </div>
  );
}