import React, { useState, useCallback } from 'react';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import PlcPage from './pages/PlcPage';
import RegisterMapPage from './pages/RegisterMapPage';
import WorkbenchPage from './pages/WorkbenchPage';
import CameraPanel from './components/Camera/CameraPanel';
import WeightPanel from './components/Weight/WeightPanel';
import ModbusLogTable from './components/Modbus/ModbusLogTable';
import Toast from './components/common/Toast';
import { pageApi, configApi, flowApi } from './api';

import './styles/dashboard.css';

function CameraPage({ toast, config }) {
  return <CameraPanel config={config?.camera} toast={toast} />;
}
function WeightPage({ toast, config }) {
  return <WeightPanel config={config?.weight} toast={toast} />;
}
function ModbusPage() {
  return <ModbusLogTable />;
}
function PlcRoute({ toast }) {
  return <PlcPage toast={toast} />;
}
function RegisterMapRoute() {
  return <RegisterMapPage />;
}
function WorkbenchRoute() {
  return <WorkbenchPage />;
}

export default function App() {
  const [toastMsg, setToastMsg] = useState(null);
  const [config, setConfig] = useState(null);
  const [globalRunning, setGlobalRunning] = useState(false);
  const [flowRunning, setFlowRunning] = useState(false);
  const [flowLoading, setFlowLoading] = useState(false);
  const [sendOneLoading, setSendOneLoading] = useState(false);

  const toast = useCallback((message, type = 'success') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const handleFlowStart = useCallback(async () => {
    setFlowLoading(true);
    try {
      await flowApi.start();
      setFlowRunning(true);
      toast('全流程测试已启动');
    } catch (err) {
      toast(err.message || '启动失败', 'error');
    } finally {
      setFlowLoading(false);
    }
  }, [toast]);

  const handleFlowStop = useCallback(async () => {
    setFlowLoading(true);
    try {
      await flowApi.stop();
      setFlowRunning(false);
      toast('全流程测试已停止');
    } catch (err) {
      toast(err.message || '停止失败', 'error');
    } finally {
      setFlowLoading(false);
    }
  }, [toast]);

  const handleSendOne = useCallback(async () => {
    setSendOneLoading(true);
    try {
      await flowApi.sendOne();
      toast('已发送单个包裹');
    } catch (err) {
      toast(err.message || '发送失败', 'error');
    } finally {
      setSendOneLoading(false);
    }
  }, [toast]);

  // Load initial config
  React.useEffect(() => {
    Promise.allSettled([
      pageApi.getIndexData(),
      configApi.get('camera'),
      configApi.get('weight')
    ]).then(([pageRes, cameraRes, weightRes]) => {
      if (pageRes.status === 'fulfilled' && pageRes.value?.data) {
        const pageData = pageRes.value.data;
        if (pageData?.cameraRunning) setGlobalRunning(true);
        if (pageData?.camera || pageData?.weight) {
          setConfig(prev => prev || pageData);
        }
      }

      const newConfig = {};

      if (cameraRes.status === 'fulfilled') {
        const cameraData = cameraRes.value?.data || cameraRes.value;
        const content = cameraData?.configContent;
        const cameraConfig = typeof content === 'string' ? JSON.parse(content) : content;
        if (cameraConfig) newConfig.camera = cameraConfig;
      }

      if (weightRes.status === 'fulfilled') {
        const weightData = weightRes.value?.data || weightRes.value;
        const content = weightData?.configContent;
        const weightConfig = typeof content === 'string' ? JSON.parse(content) : content;
        if (weightConfig) newConfig.weight = weightConfig;
      }

      if (newConfig.camera || newConfig.weight) {
        setConfig(prev => ({ ...prev, ...newConfig }));
      }
    }).catch(() => {});
  }, []);

  return (
    <HashRouter>
      <MainLayout globalRunning={globalRunning} flowRunning={flowRunning} flowLoading={flowLoading}
                   sendOneLoading={sendOneLoading}
                   onFlowStart={handleFlowStart} onFlowStop={handleFlowStop} onSendOne={handleSendOne}>
        <Switch>
          <Route exact path="/" render={() => <Redirect to="/plc" />} />
          <Route path="/camera" render={() => <CameraPage toast={toast} config={config} />} />
          <Route path="/weight" render={() => <WeightPage toast={toast} config={config} />} />
          <Route path="/plc" render={() => <PlcRoute toast={toast} />} />
          <Route path="/registers" render={() => <RegisterMapRoute />} />
          <Route path="/modbus" component={ModbusPage} />
          <Route path="/workbench" component={WorkbenchRoute} />
          <Route path="/dashboard" render={() => <Redirect to="/plc" />} />
        </Switch>
      </MainLayout>
      {toastMsg && <Toast message={toastMsg.message} type={toastMsg.type} onClose={() => setToastMsg(null)} />}
    </HashRouter>
  );
}
