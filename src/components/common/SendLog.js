import React from 'react';

export default function SendLog({ children }) {
  return (
    <div className="send-log">
      <div className="send-log-header">
        <span className="example-label">实时发送</span>
        {children}
      </div>
    </div>
  );
}
