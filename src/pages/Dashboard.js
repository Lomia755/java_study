import React, { useState, useEffect } from 'react';
import CameraPanel from '../components/Camera/CameraPanel';
import WeightPanel from '../components/Weight/WeightPanel';
import XrayPanel from '../components/Xray/XrayPanel';
import PlcPage from './PlcPage';
import ModbusLogTable from '../components/Modbus/ModbusLogTable';
import { pageApi } from '../api';

const TABS = [
  { key: 'camera', label: '📷 相机条码发送器' },
  { key: 'weight', label: '⚖️ 称重模块' },
  { key: 'plc', label: '🔧 PLC测试模块' },
  { key: 'modbus', label: '📡 Modbus通信日志' },
];

export default function Dashboard({ toast }) {
  const [activeTab, setActiveTab] = useState('camera');
  const [config, setConfig] = useState(null);

  useEffect(() => {
    pageApi.getIndexData().then(data => {
      if (data && data.data) setConfig(data.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (TABS.some(t => t.key === hash)) setActiveTab(hash);
  }, []);

  const switchTab = (tab) => {
    setActiveTab(tab);
    window.history.replaceState(null, null, `#${tab}`);
  };

  return (
    <div>
      <nav className="dash-nav" style={{ marginBottom: 20 }}>
        {TABS.map(tab => (
          <button key={tab.key}
            className={`nav-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => switchTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'camera' && (
        <div className="two-col">
          <CameraPanel config={config?.camera} toast={toast} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <WeightPanel config={config?.weight} toast={toast} />
            <XrayPanel />
          </div>
        </div>
      )}

      {activeTab === 'weight' && (
        <WeightPanel config={config?.weight} toast={toast} />
      )}

      {activeTab === 'plc' && <PlcPage toast={toast} />}

      {activeTab === 'modbus' && <ModbusLogTable />}
    </div>
  );
}
