import React from 'react';

const ConfirmDialog = ({ show, title = 'Are you sure?', message = 'Do you really want to continue? This action cannot be undone.', onCancel, onConfirm }) => {
  if (!show) return null;
  return (
    <div className="confirm-overlay">
      <div className="confirm-container">
        <div className="confirm-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.875 5.75h1.917m0 0h15.333m-15.333 0v13.417a1.917 1.917 0 0 0 1.916 1.916h9.584a1.917 1.917 0 0 0 1.916-1.916V5.75m-10.541 0V3.833a1.917 1.917 0 0 1 1.916-1.916h3.834a1.917 1.917 0 0 1 1.916 1.916V5.75m-5.75 4.792v5.75m3.834-5.75v5.75" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn-confirm" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;