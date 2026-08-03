import React, { useState } from 'react';
import '../styles/workbench.css';

export default function WorkbenchPage() {
  const [layout, setLayout] = useState('split');
  const [key, setKey] = useState(0);

  const switchLayout = (newLayout) => {
    setLayout(newLayout);
  };

  const reloadFrames = () => setKey(prev => prev + 1);

  const mainUrl = process.env.REACT_APP_MAIN_URL || 'http://localhost:3000/camera';
  const spUrl = process.env.REACT_APP_SP_URL || 'http://localhost:3000/singlepoint';

  return (
    <div className={`layout-${layout}`} style={{ height: 'calc(100vh - 20px)' }}>
      <header className="wb-header">
        <div>
          <h1 style={{ fontSize: 20, margin: 0 }}>模拟器工作台</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>整合主页面与单点测试页面，便于同时联调。</p>
        </div>
        <div className="wb-toolbar">
          <button className={`wb-btn ${layout === 'split' ? 'is-active' : ''}`} onClick={() => switchLayout('split')}>左右分栏</button>
          <button className={`wb-btn ${layout === 'main' ? 'is-active' : ''}`} onClick={() => switchLayout('main')}>只看主页面</button>
          <button className={`wb-btn ${layout === 'singlepoint' ? 'is-active' : ''}`} onClick={() => switchLayout('singlepoint')}>只看单点</button>
          <button className="wb-btn" onClick={reloadFrames}>刷新两侧</button>
        </div>
      </header>

      <main className="wb-container">
        <section className="wb-panel wb-main-panel">
          <div className="wb-panel-head">
            <div><strong>主页面</strong><span>相机、称重、X 光配置</span></div>
            <a href={mainUrl} target="_blank" rel="noreferrer" className="wb-link">新窗口打开</a>
          </div>
          <iframe key={`main-${key}`} className="wb-frame" src={mainUrl} title="主页面" />
        </section>

        <section className="wb-panel wb-singlepoint-panel">
          <div className="wb-panel-head">
            <div><strong>单点测试</strong><span>电机、光电、寄存器与 Modbus 日志</span></div>
            <a href={spUrl} target="_blank" rel="noreferrer" className="wb-link">新窗口打开</a>
          </div>
          <iframe key={`sp-${key}`} className="wb-frame" src={spUrl} title="单点测试" />
        </section>
      </main>
    </div>
  );
}
