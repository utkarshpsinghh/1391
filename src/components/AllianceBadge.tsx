import React from 'react';
import { Alliance } from '../types';

export const AllianceBadge: React.FC<{ a: Alliance }> = ({ a }) => {
  return (
    <div
      className="badge"
      style={{ '--banner': a.color } as React.CSSProperties}
    >
      <span>{a.crest}</span>
      <b>{a.id}</b>
    </div>
  );
};
