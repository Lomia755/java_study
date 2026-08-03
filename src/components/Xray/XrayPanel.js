import React from 'react';

export default function XrayPanel() {
  return (
    <div className="card">
      <div className="card-header">
        <span className="icon-circle" style={{background:'#FEF2F2'}}>🩻</span>
        <div className="title-group">
          <h2>X光 HTTP Server</h2>
          <span className="desc">本地 HTTP 服务 · 根据 SN 返回模拟图片</span>
        </div>
        <span className="tag red">HTTP Server</span>
      </div>
      <div className="card-body">
        <div className="form-grid col4">
          <div className="form-item">
            <label>监听端口</label>
            <input type="number" defaultValue="9003" />
          </div>
          <div className="form-item">
            <label>接口路径</label>
            <input type="text" defaultValue="/api/xray/image" />
          </div>
          <div className="form-item">
            <label>请求方式</label>
            <select defaultValue="GET"><option value="GET">GET</option><option value="POST">POST</option></select>
          </div>
          <div className="form-item">
            <label>SN 参数名</label>
            <input type="text" defaultValue="sn" />
          </div>
          <div className="form-item">
            <label>图片来源</label>
            <select defaultValue="POOL">
              <option value="POOL">POOL（文件夹随机）</option>
              <option value="GENERATE">GENERATE</option>
              <option value="FIXED">FIXED</option>
            </select>
          </div>
        </div>
        <div className="example-block" style={{marginTop:12}}>
          <span className="example-label">示例</span>
          <code style={{borderLeft:'3px solid var(--color-danger,#EF4444)',color:'var(--text-primary)'}}>
            <span className="tag red" style={{marginRight:4}}>GET</span>
            http://localhost:<b style={{color:'var(--color-primary,#2563EB)'}}>9003</b>/api/xray/image?sn=<b style={{color:'var(--color-primary,#2563EB)'}}>SNF503124</b>
            &nbsp;&nbsp;→ JPEG / PNG
          </code>
        </div>
      </div>
      <div className="card-actions">
        <button className="btn btn-primary" disabled>▶ 启动服务</button>
        <button className="btn btn-danger" disabled>⏹ 停止服务</button>
        <button className="btn btn-outline" style={{marginLeft:'auto'}} disabled>🧪 测试请求</button>
      </div>
    </div>
  );
}
