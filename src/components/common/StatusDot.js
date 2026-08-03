import React from 'react';

export default function StatusDot({ running, error }) {
  let cls = 'status-dot';
  if (error) cls += ' error';
  else if (running) cls += ' running';
  else cls += ' stopped';
  return <span className={cls} />;
}
