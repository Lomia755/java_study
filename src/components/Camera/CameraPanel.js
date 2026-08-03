import React, { useState, useEffect, useCallback } from 'react';
import { cameraApi, configApi } from '../../api';
import Tag from '../common/Tag';

function getVal(id, def) {
  const el = document.getElementById(id);
  return el && el.value.trim() ? el.value.trim() : def;
}
function getInt(id, def) {
  const el = document.getElementById(id);
  if (el && el.value.trim()) { const v = parseInt(el.value); return isNaN(v) ? def : v; }
  return def;
}

export default function CameraPanel({ config, toast }) {
  const [running, setRunning] = useState(false);
  const [connStatus, setConnStatus] = useState('就绪');
  const [stats, setStats] = useState({ totalSent: 0, totalPackages: 0 });
  const [testBtnState, setTestBtnState] = useState('idle');

  const collectConfig = useCallback(() => ({
    targetIp: getVal('cameraTargetIp', '127.0.0.1'),
    targetPort: getInt('cameraTargetPort', 9001),
    intervalMs: getInt('cameraIntervalMs', 1000),
    countMin: getInt('cameraCountMin', 1),
    countMax: getInt('cameraCountMax', 3),
    lengthMin: getInt('cameraLengthMin', 10),
    lengthMax: getInt('cameraLengthMax', 10),
    charset: getVal('cameraCharset', 'A-Z0-9'),
    prefix: getVal('cameraPrefix', 'SN'),
    delimiter: getVal('cameraDelimiter', ','),
    strategy: 'RANDOM'
  }), []);

  const updateExample = useCallback(() => {
    const prefix = getVal('cameraPrefix', 'SN');
    const delim = getVal('cameraDelimiter', ',');
    const max = Math.min(getInt('cameraCountMax', 3), 3);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const examples = [];
    for (let i = 0; i < max; i++) {
      let body = '';
      const len = Math.max(1, getInt('cameraLengthMax', 10) - prefix.length);
      for (let j = 0; j < len; j++) body += chars[Math.floor(Math.random() * chars.length)];
      examples.push(prefix + body);
    }
    const el = document.getElementById('cameraExample');
    if (el) el.textContent = examples.join(delim);
  }, []);

  useEffect(() => {
    if (!config) return;
    const setField = (id, value) => {
      const el = document.getElementById(id);
      if (el && el.value !== String(value)) {
        el.value = value;
      }
    };

    setField('cameraTargetIp', config.targetIp || '127.0.0.1');
    setField('cameraTargetPort', config.targetPort || 9001);
    setField('cameraIntervalMs', config.intervalMs || 1000);
    setField('cameraCountMin', config.countMin || 1);
    setField('cameraCountMax', config.countMax || 3);
    setField('cameraLengthMin', config.lengthMin || 10);
    setField('cameraLengthMax', config.lengthMax || 10);
    setField('cameraCharset', config.charset || 'A-Z0-9');
    setField('cameraPrefix', config.prefix || 'SN');
    setField('cameraDelimiter', config.delimiter || ',');
    updateExample();
  }, [config, updateExample]);

  // Poll status
  useEffect(() => {
    const poll = () => {
      cameraApi.status().then(data => {
        if (data && data.running !== undefined) {
          setRunning(data.running);
          setStats(data);
        }
      }).catch(() => {});
    };
    poll();
    const timer = setInterval(poll, 2000);
    return () => clearInterval(timer);
  }, []);

  const testConnection = async () => {
    const ip = getVal('cameraTargetIp', '127.0.0.1');
    const port = getInt('cameraTargetPort', 9001);
    if (!ip || !port) { toast('请先填写 IP 和端口', 'error'); return; }

    setTestBtnState('testing');
    try {
      const data = await cameraApi.test(ip, port);
      setTestBtnState(data.success ? 'success' : 'fail');
      setConnStatus(data.success ? '可达' : '不可达');
    } catch {
      setTestBtnState('fail');
      setConnStatus('测试失败');
    }
    setTimeout(() => {
      setTestBtnState('idle');
      setConnStatus('就绪');
    }, 3000);
  };

  const handleStart = async () => {
    const cfg = collectConfig();
    try {
      await configApi.save('camera', '相机配置', cfg);
      await cameraApi.updateConfig(cfg);
      const data = await cameraApi.start();
      if (data.success) {
        toast('相机 TCP 已启动 → ' + cfg.targetIp + ':' + cfg.targetPort, 'success');
        setRunning(true);
      } else {
        toast(data.message || '启动失败', 'error');
      }
    } catch (e) {
      toast('启动失败: ' + e.message, 'error');
    }
  };

  const handleStop = async () => {
    try {
      await cameraApi.stop();
      toast('相机 TCP 已停止', 'success');
      setRunning(false);
    } catch (e) {
      toast('停止失败', 'error');
    }
  };

  const handleUpdateConfig = async () => {
    const cfg = collectConfig();
    try {
      await configApi.save('camera', '相机配置', cfg);
      await cameraApi.updateConfig(cfg);
      toast('相机配置已更新', 'success');
      updateExample();
    } catch (e) {
      toast('更新失败', 'error');
    }
  };

  const testBtnText = { idle: '🔗 测试', testing: '⏳ 测试中...', success: '✅ 连通', fail: '❌ 不通' };

  return (
    <div className="card">
      <div className="card-header">
        <span className="icon-circle camera">📷</span>
        <div className="title-group">
          <h2>连接配置</h2>
          <span className="desc">TCP Client · 连接Java程序发送条码</span>
        </div>
        <Tag color="green">{running ? 'TCP ●' : 'TCP'}</Tag>
      </div>
      <div className="card-body">
        <div className="form-grid">
          <div className="tcp-row">
            <div className="form-item">
              <label>连接 IP</label>
              <input type="text" id="cameraTargetIp" defaultValue={config?.targetIp || '127.0.0.1'} />
            </div>
            <div className="form-item">
              <label>端口</label>
              <input type="number" id="cameraTargetPort" defaultValue={config?.targetPort || 9001} />
            </div>
            <button className={`btn-test-tcp ${testBtnState}`} onClick={testConnection}
              disabled={testBtnState === 'testing'}>
              {testBtnText[testBtnState]}
            </button>
            <span className={`conn-status ${running ? 'running' : ''}`}>{running ? '运行中' : connStatus}</span>
          </div>
        </div>
      </div>

      <div className="card-header"><h2>⚙️ 发送参数</h2></div>
      <div className="card-body">
        <div className="form-grid">
          <div className="form-item">
            <label>发送间隔（ms）</label>
            <div className="input-row">
              <input type="number" id="cameraIntervalMs" defaultValue={config?.intervalMs || 1000} min="10" step="100" />
              <span>ms</span>
            </div>
          </div>
          <div className="form-item">
            <label>间隔波动</label>
            <select id="cameraIntervalJitter" defaultValue="off">
              <option value="off">关闭</option><option value="on">开启（±随机）</option>
            </select>
          </div>
          <div className="form-item">
            <label>每次发几条</label>
            <div className="input-row">
              <input type="number" id="cameraCountMin" defaultValue={config?.countMin || 1} min="1" />
              <span>—</span>
              <input type="number" id="cameraCountMax" defaultValue={config?.countMax || 3} min="1" />
            </div>
          </div>
          <div className="form-item">
            <label>条码长度</label>
            <div className="input-row">
              <input type="number" id="cameraLengthMin" defaultValue={config?.lengthMin || 10} min="1" max="64" />
              <span>—</span>
              <input type="number" id="cameraLengthMax" defaultValue={config?.lengthMax || 10} min="1" max="64" />
              <span>位</span>
            </div>
          </div>
          <div className="form-item">
            <label>字符集</label>
            <select id="cameraCharset" defaultValue={config?.charset || 'A-Z0-9'}>
              <option value="A-Z0-9">A-Z 0-9</option>
              <option value="A-Za-z0-9">A-Z a-z 0-9</option>
              <option value="0-9">0-9</option>
              <option value="custom">自定义...</option>
            </select>
          </div>
          <div className="form-item">
            <label>条码前缀</label>
            <input type="text" id="cameraPrefix" defaultValue={config?.prefix || 'SN'} />
          </div>
          <div className="form-item">
            <label>分隔符</label>
            <input type="text" id="cameraDelimiter" defaultValue={config?.delimiter || ','} maxLength="3" />
          </div>
        </div>
        <div className="example-block">
          <span className="example-label">示例</span>
          <code id="cameraExample">SNF503124,PASS04312,FORERGT4</code>
        </div>
      </div>

      <div className="card-actions">
        <button className="btn btn-primary" onClick={handleStart} disabled={running}>
          {running ? '▶ 运行中' : '▶ 启动发送'}
        </button>
        <button className="btn btn-danger" onClick={handleStop} disabled={!running}>⏹ 停止</button>
        <button className="btn btn-outline" onClick={handleUpdateConfig} style={{ marginLeft: 'auto' }}>
          💾 应用配置
        </button>
      </div>

      {/* Real-time stats */}
      <div style={{ padding: '0 16px 12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
        <span className="log-counter" id="cameraLogCounter">
          已发: {stats.totalSent || 0}次 / {stats.totalPackages || 0}条
        </span>
      </div>
    </div>
  );
}
