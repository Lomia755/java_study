import React from 'react';

export default function PhotoGrid({ photos, onPhotoClick }) {
  if (!photos || !photos.length) return <div className="photo-grid" />;

  return (
    <div className="photo-grid">
      <div className="photo-section-label">S1 — S8 (HR6 高字节)</div>
      {photos.slice(0, 8).map((p, i) => <PhotoChip key={i} p={p} onClick={onPhotoClick} />)}
      <div className="photo-section-label">S9 — S16 (HR6 低字节)</div>
      {photos.slice(8, 16).map((p, i) => <PhotoChip key={i+8} p={p} onClick={onPhotoClick} />)}
      <div className="photo-section-label">S17 — S20 (HR7 高字节)</div>
      {photos.slice(16, 20).map((p, i) => <PhotoChip key={i+16} p={p} onClick={onPhotoClick} />)}
    </div>
  );
}

function PhotoChip({ p, onClick }) {
  if (!p) return <div className="photo-chip" />;
  const cls = `photo-chip s${p.num}${p.triggered ? ' active' : ''}`;
  return (
    <div className={cls} onClick={() => onClick(p)} title={`点击设置 S${p.num} 遮挡时长`}>
      <div className="photo-num">S{p.num}</div>
      <div className="photo-state">{p.triggered ? '遮挡' : '释放'}</div>
    </div>
  );
}
