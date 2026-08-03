import React, { useState, useEffect, useCallback } from 'react';
import { singlePointApi } from '../../api';

export default function ModbusLogTable() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('recent');

  const refresh = useCallback(() => {
    singlePointApi.getModbusLogs(filter, 100)
      .then(data => setLogs(data.logs || []))
      .catch(() => {});
  }, [filter]);

  useEffect(() => { refresh(); const t = setInterval(refresh, 3000); return () => clearInterval(t); }, [refresh]);

  const filters = [
    { key: 'recent', label: '全部' },
    { key: 'writes', label: '写操作' },
    { key: 'linkage', label: '联动触发' },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h2>📡 Modbus 通信日志</h2>
        <span className="card-desc">共 {logs.length} 条记录</span>
        <div className="log-filter-group">
          {filters.map(f => (
            <button key={f.key} className={`log-filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
        <button className="btn btn-outline btn-sm" onClick={refresh} style={{ marginLeft: 4 }}>🔄</button>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        <div className="modbus-log-table-wrapper">
          <table className="modbus-log-table">
            <thead>
              <tr>
                <th className="col-time">时间</th>
                <th>功能码</th>
                <th>寄存器</th>
                <th>旧值 → 新值</th>
                <th>变化位</th>
                <th>联动</th>
                <th>上位机IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="7" className="log-empty">暂无日志记录</td></tr>
              ) : logs.map((log, i) => {
                const isWrite = [6, 16, 5, 15].includes(log.functionCode);
                let rowClass = '';
                if (log.linkageTriggered === 1) rowClass = 'log-row-linkage';
                else if (isWrite) rowClass = 'log-row-write';

                let timeStr = log.eventTime || '';
                if (timeStr.indexOf('T') >= 0) timeStr = timeStr.replace('T', ' ').substring(11, 23);
                else if (timeStr.length > 19) timeStr = timeStr.substring(11, 23);
                else if (timeStr.length >= 8) timeStr = timeStr.substring(0, 8);

                const fcHex = '0x' + ((log.functionCode || 0) < 16 ? '0' : '') + (log.functionCode || 0).toString(16).toUpperCase();
                const fcName = (log.functionName || '').replace('Holding','Hld').replace('Register','Reg').replace('Multiple','Multi').replace('Single','Sgl');
                const fcDisplay = fcHex + ' ' + fcName;

                const regAddr = log.registerOffset != null ? 'HR' + log.registerOffset : '—';
                const counts = log.registerCount > 1 ? '×' + log.registerCount : '';

                let valChange = '—';
                if (log.oldValueHex && log.newValueHex) {
                  const changed = log.oldValueHex !== log.newValueHex;
                  valChange = <><span className="log-val-old">{log.oldValueHex}</span>
                    <span className="log-arrow"> → </span>
                    <span className={`log-val-new ${changed ? 'log-val-changed' : ''}`}>{log.newValueHex}</span></>;
                }

                let bitsMask = '—';
                if (log.changedBitsMask && log.changedBitsMask !== '0x0000') {
                  bitsMask = <span className="log-bits-changed">{log.changedBitsMask}</span>;
                } else if (log.changedBitsMask === '0x0000') {
                  bitsMask = <span className="log-bits-none">未变化</span>;
                }

                let linkage = '—';
                if (log.linkageTriggered === 1) {
                  const detail = (log.linkageDetail || '联动已触发');
                  const short = detail.length > 40 ? detail.substring(0, 37) + '...' : detail;
                  linkage = <span className="log-linkage-tag" title={detail}>⚡ {short}</span>;
                }

                return (
                  <tr key={i} className={rowClass}>
                    <td className="col-time">{timeStr}</td>
                    <td><span className={`fc-badge fc-${isWrite ? 'write' : 'read'}`}>{fcDisplay}</span></td>
                    <td style={{fontWeight:700,color:'var(--color-primary)'}}>{regAddr}{counts}</td>
                    <td>{valChange}</td>
                    <td>{bitsMask}</td>
                    <td>{linkage}</td>
                    <td style={{color:'var(--text-secondary)',fontSize:10}}>{log.clientIp || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
