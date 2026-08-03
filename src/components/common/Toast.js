import React from 'react';

export default function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div className={`toast ${type || 'success'}`} onClick={onClose}>
      {message}
    </div>
  );
}
