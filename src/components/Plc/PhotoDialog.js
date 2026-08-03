import React, { useState } from 'react';
import { singlePointApi } from '../../api';

export default function PhotoDialog({ photo, onClose, toast, onUpdated }) {
  const [showCustom, setShowCustom] = useState(false);
  const [customMs, setCustomMs] = useState(5000);

  if (!photo) return null;

  const doSet = async (triggered, autoOffMs = 0) => {
    try {
      const res = await singlePointApi.setPhoto(photo.num, triggered, autoOffMs);
      toast(res.message, res.success ? 'success' : 'error');
      if (res.success) { onUpdated(); onClose(); }
    } catch { toast('请求失败', 'error'); }
  };

  const durations = [
    { ms: 0, label: '👆 手动切换' },
    { ms: 2000, label: '⏱ 2 秒' },
    { ms: 5000, label: '⏱ 5 秒' },
    { ms: 10000, label: '⏱ 10 秒' },
    { ms: 30000, label: '⏱ 30 秒' },
  ];

  return (
    <div className="dash-overlay" onClick={onClose}>
      <div className="dash-dialog" onClick={e => e.stopPropagation()}>
        <div className="dash-dialog-header">
          <span>S{photo.num} 光电遮挡设置</span>
          <button className="dash-dialog-close" onClick={onClose}>✕</button>
        </div>
        <div className="dash-dialog-body">
          <p className="dialog-hint">选择遮挡时长（到时自动释放）</p>
          <div className="duration-options">
            {durations.map(d => (
              <button key={d.ms} className="dur-btn" onClick={() => {
                if (d.ms === 0) doSet(!photo.triggered, 0);
                else doSet(true, d.ms);
              }}>{d.label}</button>
            ))}
            <button className="dur-btn custom" onClick={() => setShowCustom(!showCustom)}>⚙ 自定义...</button>
          </div>
          {showCustom && (
            <div className="custom-dur-row">
              <input type="number" value={customMs} onChange={e => setCustomMs(e.target.value)} min="100" step="100" />
              <span>ms</span>
              <button className="btn btn-primary btn-sm" onClick={() => doSet(true, parseInt(customMs) || 5000)}>确认</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
