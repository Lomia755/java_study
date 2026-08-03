import React, { useState } from 'react';
import { singlePointApi } from '../../api';

export default function MotorDialog({ motor, onClose, toast, onUpdated }) {
  const [showCustom, setShowCustom] = useState(false);
  const [customMs, setCustomMs] = useState(5000);

  if (!motor) return null;

  const callRun = async (running, autoOffMs = 0) => {
    try {
      const res = await singlePointApi.motorRun(motor.num, running, autoOffMs);
      toast(res.message, res.success ? 'success' : 'error');
      if (res.success) { onUpdated(); onClose(); }
    } catch { toast('请求失败', 'error'); }
  };

  const toggleFault = async () => {
    try {
      const res = await singlePointApi.motorFault(motor.num, !motor.hasFault);
      toast(res.message, res.success ? 'success' : 'error');
      if (res.success) { onUpdated(); onClose(); }
    } catch { toast('请求失败', 'error'); }
  };

  const hasFault = typeof motor.hasFault !== 'undefined';
  const durations = [
    { ms: 3000, label: '⏱ 3 秒' },
    { ms: 5000, label: '⏱ 5 秒' },
    { ms: 10000, label: '⏱ 10 秒' },
    { ms: 30000, label: '⏱ 30 秒' },
  ];

  return (
    <div className="dash-overlay" onClick={onClose}>
      <div className="dash-dialog" onClick={e => e.stopPropagation()}>
        <div className="dash-dialog-header">
          <span>M{motor.num} {motor.name || ''} 操作</span>
          <button className="dash-dialog-close" onClick={onClose}>✕</button>
        </div>
        <div className="dash-dialog-body">
          <p className="dialog-hint">
            当前状态：{motor.running ? '🟢 运行中' : '⚪ 已停止'}
            {motor.hasFault ? ' | 🔴 故障' : ''}
          </p>
          <div className="motor-actions">
            <button className="btn btn-primary" disabled={motor.running} onClick={() => callRun(true)}>▶ 启动</button>
            <button className="btn btn-danger" disabled={!motor.running} onClick={() => callRun(false)}>⏹ 停止</button>
          </div>
          <div className="dash-dialog-divider" />
          <p className="dialog-hint">定时启动（到时自动停止）</p>
          <div className="duration-options">
            {durations.map(d => (
              <button key={d.ms} className="dur-btn" onClick={() => callRun(true, d.ms)}>{d.label}</button>
            ))}
            <button className="dur-btn custom" onClick={() => setShowCustom(!showCustom)}>⚙ 自定义...</button>
          </div>
          {showCustom && (
            <div className="custom-dur-row">
              <input type="number" value={customMs} onChange={e => setCustomMs(e.target.value)} min="100" step="100" />
              <span>ms</span>
              <button className="btn btn-primary btn-sm" onClick={() => callRun(true, parseInt(customMs) || 5000)}>确认</button>
            </div>
          )}
          {hasFault && (
            <>
              <div className="dash-dialog-divider" />
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span>故障状态：</span>
                <span className={`fault-status-text ${motor.hasFault ? 'has-fault' : ''}`}>
                  {motor.hasFault ? '🔴 故障中' : '🟢 正常'}
                </span>
                <button className="btn btn-warn btn-sm" onClick={toggleFault}>
                  {motor.hasFault ? '🟢 清除故障' : '🔴 置故障'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
