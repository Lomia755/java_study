import React, { useState, useEffect } from 'react';
import { singlePointApi } from '../../api';

export default function RegisterMap() {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (expanded && !data) {
      singlePointApi.getRegisterMap().then(setData).catch(() => {});
    }
  }, [expanded, data]);

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card-header" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
        <h2>📖 寄存器功能说明</h2>
        <span className="card-desc">点击展开/折叠 — 所有 Holding Register 的位级功能定义</span>
        <span style={{ marginLeft: 'auto', fontSize: 16 }}>{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && data && (
        <div className="register-map-content">
          {Object.keys(data).map(key => {
            const reg = data[key];
            const isWrite = reg.direction && reg.direction.indexOf('上位机') >= 0;
            return (
              <div key={key} className="reg-card">
                <div className="reg-card-header">
                  <span className="reg-card-name">{key} · {reg.name}</span>
                  <span className={`reg-card-dir ${isWrite ? 'write' : 'read'}`}>{isWrite ? '写' : '读'}</span>
                  <span className="reg-card-addr">{reg.plcAddr}</span>
                </div>
                <div className="reg-card-body">
                  {reg.highByte && reg.highByte.length > 0 && (
                    <div className="reg-byte-group">
                      <div className="reg-byte-label">高字节</div>
                      {reg.highByte.map((b, i) => renderBitRow(b, i, isWrite))}
                    </div>
                  )}
                  {reg.lowByte && reg.lowByte.length > 0 && (
                    <div className="reg-byte-group">
                      <div className="reg-byte-label">低字节</div>
                      {reg.lowByte.map((b, i) => renderBitRow(b, i, isWrite))}
                    </div>
                  )}
                  {reg.pulseBits && reg.pulseBits.length > 0 && (
                    <div className="reg-pulse-note">⚡ 脉冲位 (上升沿触发，保留200ms自动复位): {reg.pulseBits.join(', ')}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function renderBitRow(bit, idx, isWrite) {
  if (bit.byteAddr) {
    return (
      <div key={idx} className="reg-data-row">
        <span className="reg-bit-num">{bit.byteAddr}</span>
        <span className="reg-bit-label">{bit.label}</span>
        <span className="reg-bit-desc">{bit.desc}</span>
      </div>
    );
  }
  const reserved = bit.label && bit.label.indexOf('预留') >= 0;
  const pulse = bit.label && bit.label.indexOf('⚡') >= 0;
  const numCls = `reg-bit-num${pulse ? ' pulse' : ''}${reserved ? ' reserved' : ''}`;
  const labelCls = `reg-bit-label${reserved ? ' reserved' : ''}`;
  const numText = bit.bit >= 8 ? `Bit${bit.bit} (L${bit.bit - 8})` : `Bit${bit.bit}`;
  return (
    <div key={idx} className="reg-bit-row">
      <span className={numCls}>{numText}</span>
      <span className={labelCls}>{bit.label}</span>
      <span className="reg-bit-desc">{bit.desc}</span>
    </div>
  );
}
