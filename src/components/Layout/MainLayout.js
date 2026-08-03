import React from 'react';
import Header from './Header';

export default function MainLayout({ children, globalRunning, flowRunning, flowLoading, sendOneLoading, onFlowStart, onFlowStop, onSendOne }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page, #F9FAFB)' }}>
      <Header globalRunning={globalRunning} flowRunning={flowRunning} flowLoading={flowLoading}
              sendOneLoading={sendOneLoading}
              onFlowStart={onFlowStart} onFlowStop={onFlowStop} onSendOne={onSendOne} />
      <main className="dash-main">
        {children}
      </main>
      <footer className="dash-footer">
        包裹分拣模拟器 · Package Sorting Simulator · Dashboard v2.0
      </footer>
    </div>
  );
}
