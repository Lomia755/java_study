import React from 'react';

function SysItem({ icon, label, value, onText, offText, onClick }) {
  const active = !!value;
  const cls = `sys-indicator ${active ? (onText.includes('!') || onText.includes('故障') ? 'warn' : 'on') : 'off'}`;
  return (
    <div className={`sys-item ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <span className="sys-icon">{icon}</span>
      <span className="sys-label">{label}</span>
      <span className={cls}>{active ? onText : offText}</span>
    </div>
  );
}

export default function SystemBar({ system, onToggleSystem, onResetAll, onRefresh }) {
  if (!system) return null;
  return (
    <div className="system-bar">
      <SysItem icon="⚡" label="系统运行" value={system.running} onText="ON" offText="OFF" />
      <SysItem icon="⚠️" label="系统故障" value={system.fault} onText="故障" offText="正常" />
      <SysItem icon="🛑" label="急停" value={system.emergencyStop} onText="急停!" offText="正常" onClick={() => onToggleSystem('emergencyStop')} />
      <SysItem icon="📡" label="远程模式" value={system.remoteMode} onText="ON" offText="OFF" onClick={() => onToggleSystem('remoteMode')} />
      <div className="sys-spacer" />
      <button className="btn btn-danger btn-sm" onClick={onResetAll}>🔄 一键复位</button>
      <button className="btn btn-outline btn-sm" onClick={onRefresh}>🔄 刷新</button>
    </div>
  );
}
