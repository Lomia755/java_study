import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || 'http://localhost:8099',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
});

api.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.message || err.message || '网络错误';
    console.error('[API]', msg);
    return Promise.reject(new Error(msg));
  }
);

// ── 相机 API ──
export const cameraApi = {
  start: () => api.post('/api/camera/start'),
  stop: () => api.post('/api/camera/stop'),
  status: () => api.get('/api/camera/status'),
  getConfig: () => api.get('/api/camera/config'),
  updateConfig: (config) => api.post('/api/camera/config', config),
  test: (ip, port) => api.post('/api/camera/test', { ip, port })
};

// ── 称重 API ──
export const weightApi = {
  start: () => api.post('/api/weight/start'),
  stop: () => api.post('/api/weight/stop'),
  status: () => api.get('/api/weight/status'),
  getConfig: () => api.get('/api/weight/config'),
  updateConfig: (config) => api.post('/api/weight/config', config),
  test: (ip, port) => api.post('/api/weight/test', { ip, port })
};

// ── 单点测试 API ──
export const singlePointApi = {
  readStatus: () => api.get('/api/singlepoint/read-status'),
  motorRun: (motorNum, running, autoOffMs = 0) =>
    api.post('/api/singlepoint/motor/run', { motorNum, running, autoOffMs }),
  motorFault: (motorNum, fault) =>
    api.post('/api/singlepoint/motor/fault', { motorNum, fault }),
  setPhoto: (photoNum, triggered, autoOffMs = 0) =>
    api.post('/api/singlepoint/photo', { photoNum, triggered, autoOffMs }),
  setFault: (faultType, active) =>
    api.post('/api/singlepoint/fault/other', { faultType, active }),
  setSystem: (field, value) =>
    api.post('/api/singlepoint/system', { field, value }),
  resetAll: () => api.post('/api/singlepoint/reset-all', {}),
  getRegisterMap: () => api.get('/api/singlepoint/register-map'),
  getModbusLogs: (filter = 'recent', limit = 100) =>
    api.get(`/api/singlepoint/modbus-logs/${filter}?limit=${limit}`)
};

// ── 配置 API ──
export const configApi = {
  save: (configKey, configName, configContent) =>
    api.post('/api/config', { configKey, configName, configContent }),
  get: (configKey) => api.get(`/api/config/${configKey}`),
};

// ── 全流程测试 API ──
export const flowApi = {
  start: () => api.post('/api/flow/start'),
  stop: () => api.post('/api/flow/stop'),
  sendOne: () => api.post('/api/flow/send-one'),
};

// ── 页面数据 API ──
export const pageApi = {
  getIndexData: () => api.get('/')
};

export default api;
