import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 通用轮询 Hook — 定时调用 fetchFn，组件卸载时自动清理
 * @param {Function} fetchFn 异步获取函数
 * @param {number} intervalMs 轮询间隔（毫秒）
 * @param {boolean} enabled 是否启用轮询
 */
export function usePolling(fetchFn, intervalMs, enabled = true) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const refresh = useCallback(() => {
    return fetchFnRef.current()
      .then(d => { setData(d); setError(null); return d; })
      .catch(e => { setError(e); throw e; });
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    const timer = setInterval(refresh, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, enabled, refresh]);

  return { data, error, refresh };
}

/**
 * 相机模块状态 Hook
 */
export function useCamera() {
  const [config, setConfig] = useState(null);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({});

  const fetchStatus = useCallback(async () => {
    try {
      const { cameraApi } = await import('../api');
      const data = await cameraApi.status();
      if (data && data.running !== undefined) {
        setRunning(data.running);
        setStats(data);
      }
    } catch (e) { /* ignore poll errors */ }
  }, []);

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 2000);
    return () => clearInterval(timer);
  }, [fetchStatus]);

  const loadConfig = useCallback(async () => {
    try {
      const { cameraApi } = await import('../api');
      const data = await cameraApi.getConfig();
      setConfig(data);
      return data;
    } catch (e) { return null; }
  }, []);

  return { config, running, stats, loadConfig, fetchStatus };
}

/**
 * 称重模块状态 Hook
 */
export function useWeight() {
  const [config, setConfig] = useState(null);
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState({});

  const fetchStatus = useCallback(async () => {
    try {
      const { weightApi } = await import('../api');
      const data = await weightApi.status();
      if (data && data.running !== undefined) {
        setRunning(data.running);
        setStats(data);
      }
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 2000);
    return () => clearInterval(timer);
  }, [fetchStatus]);

  const loadConfig = useCallback(async () => {
    try {
      const { weightApi } = await import('../api');
      const data = await weightApi.getConfig();
      setConfig(data);
      return data;
    } catch (e) { return null; }
  }, []);

  return { config, running, stats, loadConfig, fetchStatus };
}

/**
 * PLC 状态 Hook（电机/光电/故障/系统）
 */
export function usePlc() {
  const [status, setStatus] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const { singlePointApi } = await import('../api');
      const data = await singlePointApi.readStatus();
      setStatus(data);
      return data;
    } catch (e) { return null; }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 1500);
    return () => clearInterval(timer);
  }, [refresh]);

  return { status, refresh };
}

/**
 * Modbus 日志 Hook
 */
export function useModbusLogs(filter = 'recent') {
  const [logs, setLogs] = useState([]);
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const { singlePointApi } = await import('../api');
      const data = await singlePointApi.getModbusLogs(filter, 100);
      const list = data.logs || [];
      setLogs(list);
      setCount(list.length);
      return list;
    } catch (e) { return []; }
  }, [filter]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 3000);
    return () => clearInterval(timer);
  }, [refresh]);

  return { logs, count, refresh };
}
