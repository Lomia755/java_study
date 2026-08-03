import React from 'react';

export default function Tag({ color, children }) {
  return <span className={`tag ${color}`}>{children}</span>;
}
