import React from 'react';

export default function RawRegisters({ rawRegs }) {
  if (!rawRegs) return null;
  return (
    <div className="raw-regs">
      {Object.keys(rawRegs).map(key => (
        <div key={key} className="raw-reg-chip">
          <span className="reg-name">{key}</span>
          <span className="reg-value">{rawRegs[key]}</span>
        </div>
      ))}
    </div>
  );
}
