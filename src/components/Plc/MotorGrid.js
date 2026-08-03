import React from 'react';

export default function MotorGrid({ motors, onMotorClick }) {
  if (!motors || !motors.length) return <div className="motor-grid" />;

  return (
    <div className="motor-grid">
      {motors.map(m => {
        let cls = `motor-card m${m.num}`;
        if (m.running) cls += ' running';
        if (m.hasFault) cls += ' fault';
        let statusText = m.running ? '运行中' : '已停止';
        if (m.hasFault) statusText = '故障!';
        return (
          <div key={m.num} className={cls} onClick={() => onMotorClick(m)} title={`点击管理 M${m.num}`}>
            {m.hasFault && <span className="motor-fault-badge">故障</span>}
            <div className="motor-num">M{m.num}</div>
            <div className="motor-name">{m.name || ''}</div>
            <div className="motor-status-row">
              <span className="motor-status-dot motor-run-dot" />
              <span className="motor-status-text">{statusText}</span>
              {typeof m.hasFault !== 'undefined' && (
                <span className="motor-status-dot motor-fault-dot" style={{ opacity: m.hasFault ? 1 : 0.2 }} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
