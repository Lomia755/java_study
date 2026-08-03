import React from 'react';
import { NavLink } from 'react-router-dom';
import Tag from '../common/Tag';
import StatusDot from '../common/StatusDot';

export default function Header({ globalRunning, flowRunning, flowLoading, sendOneLoading, onFlowStart, onFlowStop, onSendOne }) {
  const tabs = [
    { key: 'camera', label: '📷 相机条码发送器', path: '/camera' },
    { key: 'weight', label: '⚖️ 称重模块', path: '/weight' },
    { key: 'plc', label: '🔧 PLC测试模块', path: '/plc' },
    { key: 'registers', label: '📖 寄存器说明', path: '/registers' },
    { key: 'modbus', label: '📡 Modbus通信日志', path: '/modbus' },
  ];

  return (
    <header className="dash-header">
      <div className="logo-block">📦</div>
      <span className="header-title">包裹分拣模拟器</span>

      <nav className="dash-nav" id="dashNav">
        {tabs.map(tab => (
          <NavLink
            key={tab.key}
            to={tab.path}
            className="nav-tab"
            activeClassName="active"
          >
            {tab.label}
          </NavLink>
        ))}
      
      </nav>

      <div className="header-status" style={{ marginLeft: 'auto' }}>
        <div className="flow-btns">
          {flowRunning ? (
            <button className="btn btn-danger btn-sm" onClick={onFlowStop} disabled={flowLoading}>
              ⏹ 停止全流程
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onFlowStart} disabled={flowLoading}>
              ▶ 启动全流程
            </button>
          )}
          <button className="btn btn-send-one btn-sm" onClick={onSendOne} disabled={sendOneLoading}>
            📦 模拟单包
          </button>
        </div>
        <StatusDot running={globalRunning} />
        <span id="globalStatusText">{globalRunning ? '运行中' : '就绪'}</span>
      </div>
    </header>
  );
}
