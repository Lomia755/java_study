import React from 'react';

const NODES = [
  { key: 'snReceivedS6',  label: 'S6 接收', desc: '入X光段前' },
  { key: 'snSentS9',     label: 'S9 发送', desc: '分拣段下传' },
  { key: 'snReceivedS11',label: 'S11 接收', desc: '汇流段接收' },
];

function SnNode({ label, desc, data }) {
  const hasSn = data?.snCode;
  const cls = `sn-node${hasSn ? ' has-sn' : ''}`;

  return (
    <div className={cls}>
      <div className="sn-node-head">
        <span className="sn-node-label">{label}</span>
        <span className="sn-node-desc">{desc}</span>
      </div>
      <div className="sn-node-code">{hasSn || '--'}</div>
      <div className="sn-node-meta">
        {data?.status && <span className={`sn-status-tag ${data.status === 'ok' ? 'ok' : 'warn'}`}>{data.status}</span>}
        {data?.note && <span className="sn-note">{data.note}</span>}
        {data?.time && <span className="sn-time">{data.time}</span>}
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="sn-arrow">
      <div className="sn-arrow-line" />
      <div className="sn-arrow-head" />
    </div>
  );
}

export default function SnFlowTracker({ snStatus }) {
  if (!snStatus) return null;

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-header">
        <h2>📦 SN码追踪</h2>
        <span className="card-desc">S6 → S9 → S11 流水传递</span>
      </div>
      <div className="card-body">
        <div className="sn-flow">
          {NODES.map((node, i) => (
            <React.Fragment key={node.key}>
              {i > 0 && <Arrow />}
              <SnNode label={node.label} desc={node.desc} data={snStatus[node.key]} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
