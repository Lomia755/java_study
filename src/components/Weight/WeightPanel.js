import React, { useState, useEffect, useCallback } from 'react';
import { weightApi, configApi } from '../../api';
import Tag from '../common/Tag';

function getVal(id, def) { const el = document.getElementById(id); return el && el.value.trim() ? el.value.trim() : def; }
function getInt(id, def) { const el = document.getElementById(id); if (el && el.value.trim()) { const v = parseInt(el.value); return isNaN(v) ? def : v; } return def; }

export default function WeightPanel({ config, toast }) {
  const [running, setRunning] = useState(false);
  const [connStatus, setConnStatus] = useState('就绪');
  const [stats, setStats] = useState({ totalSent: 0, totalPackages: 0 });
  const [testBtnState, setTestBtnState] = useState('idle');

  const collectConfig = useCallback(() => ({
    targetIp: getVal('weightTargetIp', '127.0.0.1'),
    targetPort: getInt('weightTargetPort', 9002),
    weighDurationMs: getInt('weightWeighDurationMs', 2000),
    intervalMs: getInt('weightIntervalMs', 500),
    minWeight: parseFloat(getVal('weightMinWeight', '0.01')) || 0.01,
    maxWeight: parseFloat(getVal('weightMaxWeight', '50.0')) || 50.0,
    unit: getVal('weightUnit', 'kg'),
    decimals: getInt('weightDecimals', 2),
    floatRange: getInt('weightFloatRangeNum', 5),
    format: getVal('weightFormat', '{weight}{unit}')
  }), []);

  const updateExample = useCallback(() => {
    const min = parseFloat(getVal('weightMinWeight', '0.01')) || 0.01;
    const max = parseFloat(getVal('weightMaxWeight', '50.0')) || 50.0;
    const unit = getVal('weightUnit', 'kg');
    const decimals = getInt('weightDecimals', 2);
    const examples = [];
    for (let i = 0; i < 3; i++) examples.push((min + Math.random() * (max - min)).toFixed(decimals) + unit);
    const el = document.getElementById('weightExample'); if (el) el.textContent = examples.join('   ');
  }, []);

  useEffect(() => {
    if (!config) return;
    const setField = (id, value) => {
      const el = document.getElementById(id);
      if (el && el.value !== String(value)) {
        el.value = value;
      }
    };

    setField('weightTargetIp', config.targetIp || '127.0.0.1');
    setField('weightTargetPort', config.targetPort || 9002);
    setField('weightWeighDurationMs', config.weighDurationMs || 2000);
    setField('weightIntervalMs', config.intervalMs || 500);
    setField('weightMinWeight', config.minWeight ?? 0.01);
    setField('weightMaxWeight', config.maxWeight ?? 50.0);
    setField('weightUnit', config.unit || 'kg');
    setField('weightDecimals', config.decimals ?? 2);
    setField('weightFloatRangeNum', config.floatRange || 5);
    setField('weightFormat', config.format || '{weight}{unit}');
    updateExample();
  }, [config, updateExample]);

  useEffect(() => {
    const poll = () => { weightApi.status().then(data => { if (data && data.running !== undefined) { setRunning(data.running); setStats(data); } }).catch(() => {}); };
    poll(); const timer = setInterval(poll, 2000);
    return () => clearInterval(timer);
  }, []);

  const testConnection = async () => {
    const ip = getVal('weightTargetIp', '127.0.0.1');
    const port = parseInt(document.getElementById('weightTargetPort')?.value) || 9002;
    if (!ip || !port) { toast('请先填写 IP 和端口', 'error'); return; }
    setTestBtnState('testing');
    try { const data = await weightApi.test(ip, port); setTestBtnState(data.success ? 'success' : 'fail'); setConnStatus(data.success ? '可达' : '不可达'); } catch { setTestBtnState('fail'); setConnStatus('测试失败'); }
    setTimeout(() => { setTestBtnState('idle'); setConnStatus('就绪'); }, 3000);
  };

  const handleStart = async () => {
    const cfg = collectConfig();
    try {
      await configApi.save('weight', '称重配置', cfg);
      await weightApi.updateConfig(cfg);
      const data = await weightApi.start();
      if (data.success) { toast('称重 TCP 已启动', 'success'); setRunning(true); } else { toast(data.message || '启动失败', 'error'); }
    } catch (e) { toast('启动失败: ' + e.message, 'error'); }
  };

  const handleStop = async () => {
    try { await weightApi.stop(); toast('称重 TCP 已停止', 'success'); setRunning(false); } catch { toast('停止失败', 'error'); }
  };

  const handleUpdateConfig = async () => {
    const cfg = collectConfig();
    try { await configApi.save('weight', '称重配置', cfg); await weightApi.updateConfig(cfg); toast('配置已更新', 'success'); updateExample(); } catch { toast('更新失败', 'error'); }
  };

  const testBtnText = { idle: '🔗 测试', testing: '⏳ 测试中...', success: '✅ 连通', fail: '❌ 不通' };

  return (
    <div className="card">
      <div className="card-header">
        <span className="icon-circle weight">⚖️</span>
        <div className="title-group">
          <h2>连接配置</h2>
          <span className="desc">TCP Client · 仅发送纯重量值</span>
        </div>
        <Tag color="blue">{running ? 'TCP ●' : 'TCP'}</Tag>
      </div>
      <div className="card-body">
        <div className="form-grid">
          <div className="tcp-row">
            <div className="form-item">
              <label>连接 IP</label>
              <input type="text" id="weightTargetIp" defaultValue={config?.targetIp || '127.0.0.1'} />
            </div>
            <div className="form-item">
              <label>端口</label>
              <input type="number" id="weightTargetPort" defaultValue={config?.targetPort || 9002} />
            </div>
            <button className={`btn-test-tcp ${testBtnState}`} onClick={testConnection} disabled={testBtnState === 'testing'}>
              {testBtnText[testBtnState]}
            </button>
            <span className={`conn-status ${running ? 'running' : ''}`}>{running ? '运行中' : connStatus}</span>
          </div>
        </div>
      </div>
      <div className="card-header"><h2>⚙️ 称重参数</h2></div>
      <div className="card-body">
        <div className="form-grid">
          <div className="form-item">
            <label>称重时间（ms）</label>
            <div className="input-row"><input type="number" id="weightWeighDurationMs" defaultValue={config?.weighDurationMs || 2000} min="100" step="100" /><span>ms</span></div>
          </div>
          <div className="form-item">
            <label>发送间隔（ms）</label>
            <div className="input-row"><input type="number" id="weightIntervalMs" defaultValue={config?.intervalMs || 500} min="10" step="100" /><span>ms</span></div>
          </div>
          <div className="form-item">
            <label>重量范围</label>
            <div className="input-row"><input type="number" id="weightMinWeight" defaultValue={config?.minWeight || 0.01} min="0" step="0.01" /><span>—</span><input type="number" id="weightMaxWeight" defaultValue={config?.maxWeight || 50.0} min="0" step="0.01" /></div>
          </div>
          <div className="form-item">
            <label>单位</label>
            <select id="weightUnit" defaultValue={config?.unit || 'kg'}><option value="kg">kg</option><option value="g">g</option><option value="lb">lb</option></select>
          </div>
          <div className="form-item">
            <label>小数位</label>
            <select id="weightDecimals" defaultValue={config?.decimals ?? 2}>
              {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="form-item">
            <label>浮动范围</label>
            <div className="input-row"><input type="range" id="weightFloatRangeSlider" defaultValue={config?.floatRange || 5} min="0" max="50" /><input type="number" id="weightFloatRangeNum" defaultValue={config?.floatRange || 5} min="0" max="50" style={{width:48}} /><span>%</span></div>
          </div>
          <div className="form-item">
            <label>数据格式</label>
            <input type="text" id="weightFormat" defaultValue={config?.format || '{weight}{unit}'} />
          </div>
        </div>
        <div className="example-block"><span className="example-label">示例</span><code id="weightExample">23.45kg   1.08kg   49.99kg</code></div>
      </div>
      <div className="card-actions">
        <button className="btn btn-primary" onClick={handleStart} disabled={running}>{running ? '▶ 运行中' : '▶ 启动发送'}</button>
        <button className="btn btn-danger" onClick={handleStop} disabled={!running}>⏹ 停止</button>
        <button className="btn btn-outline" onClick={handleUpdateConfig} style={{marginLeft:'auto'}}>💾 应用配置</button>
      </div>
      <div style={{padding:'0 16px 12px',fontSize:'11px',color:'var(--text-secondary)'}}>
        <span className="log-counter">已发: {stats.totalSent || 0}次 / {stats.totalPackages || 0}条</span>
      </div>
    </div>
  );
}
