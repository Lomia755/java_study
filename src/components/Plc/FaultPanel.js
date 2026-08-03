import React from 'react';
import { singlePointApi } from '../../api';

export default function FaultPanel({ faults, motors, toast, onUpdated }) {
  const items = [
    { key: 'overload', label: '热磁电机过载' },
    { key: 'm4SwingFault', label: 'M4 摆轮故障' }
  ];

  const toggle = async (faultType, active) => {
    try {
      const res = await singlePointApi.setFault(faultType, active);
      toast(res.message, res.success ? 'success' : 'error');
      if (res.success) onUpdated();
    } catch { toast('请求失败', 'error'); }
  };

  const faultMotors = motors ? motors.filter(m => m.hasFault) : [];

  return (
    <div className="fault-row">
      {items.map(item => (
        <div key={item.key}
          className={`fault-chip ${faults?.[item.key] ? 'active' : ''}`}
          onClick={() => toggle(item.key, !faults?.[item.key])}
          title="点击切换"
        >
          <span className="fault-dot" />
          {item.label}
          <span style={{ fontSize: 10 }}>{faults?.[item.key] ? '🔴' : '🟢'}</span>
        </div>
      ))}
      {faultMotors.length > 0 && (
        <span style={{ fontSize: 10, color: 'var(--color-danger)', marginLeft: 8 }}>
          电机故障: {faultMotors.map(m => 'M' + m.num).join(', ')}
        </span>
      )}
      {!faultMotors.length && !items.some(i => faults?.[i.key]) && (
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>全部正常</span>
      )}
    </div>
  );
}
