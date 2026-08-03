import React, { useState, useCallback } from 'react';
import SystemBar from '../components/Plc/SystemBar';
import MotorGrid from '../components/Plc/MotorGrid';
import MotorDialog from '../components/Plc/MotorDialog';
import PhotoGrid from '../components/Plc/PhotoGrid';
import PhotoDialog from '../components/Plc/PhotoDialog';
import FaultPanel from '../components/Plc/FaultPanel';
import RawRegisters from '../components/Plc/RawRegisters';
import SnFlowTracker from '../components/Plc/SnFlowTracker';
import { usePlc } from '../hooks';
import { singlePointApi } from '../api';

export default function PlcPage({ toast }) {
  const { status, refresh } = usePlc();
  const [motorDialog, setMotorDialog] = useState(null);
  const [photoDialog, setPhotoDialog] = useState(null);

  const handleToggleSystem = useCallback(async (field) => {
    if (!status?.system) return;
    try {
      const res = await singlePointApi.setSystem(field, !status.system[field]);
      toast(res.message, res.success ? 'success' : 'error');
      if (res.success) refresh();
    } catch { toast('请求失败', 'error'); }
  }, [status, toast, refresh]);

  const handleResetAll = useCallback(async () => {
    if (!window.confirm('确定要复位所有状态吗？\n\n这将停止所有电机、清除所有光电信号和故障，恢复系统就绪状态。')) return;
    try {
      const res = await singlePointApi.resetAll();
      toast(res.message, res.success ? 'success' : 'error');
      if (res.success) refresh();
    } catch { toast('请求失败', 'error'); }
  }, [toast, refresh]);

  return (
    <div>
      <SystemBar
        system={status?.system}
        onToggleSystem={handleToggleSystem}
        onResetAll={handleResetAll}
        onRefresh={refresh}
      />

      <SnFlowTracker snStatus={status?.snStatus} />

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <h2>🔧 电机运行状态 (HR5)</h2>
            <span className="card-desc">点击卡片切换启停</span>
          </div>
          <div className="card-body">
            <MotorGrid motors={status?.motors} onMotorClick={setMotorDialog} />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h2>💡 光电传感器 (HR6-HR7)</h2>
            <span className="card-desc">点击设置遮挡时长</span>
          </div>
          <div className="card-body">
            <PhotoGrid photos={status?.photos} onPhotoClick={setPhotoDialog} />
          </div>
        </div>
      </div>

      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-header">
            <h2>🔴 故障位 (HR7 低字节)</h2>
            <span className="card-desc">非电机独立故障</span>
          </div>
          <div className="card-body">
            <FaultPanel faults={status?.faults} motors={status?.motors} toast={toast} onUpdated={refresh} />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h2>📋 寄存器原始值</h2>
            <span className="card-desc">实时 Hex 快照</span>
          </div>
          <div className="card-body">
            <RawRegisters rawRegs={status?.rawRegisters} />
          </div>
        </div>
      </div>

      <MotorDialog
        motor={motorDialog}
        onClose={() => setMotorDialog(null)}
        toast={toast}
        onUpdated={refresh}
      />
      <PhotoDialog
        photo={photoDialog}
        onClose={() => setPhotoDialog(null)}
        toast={toast}
        onUpdated={refresh}
      />
    </div>
  );
}
