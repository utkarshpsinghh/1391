import React, { useState } from 'react';
import { Alliance } from '../types';

interface AllianceBadgeProps {
  a: Alliance;
  size?: 'sm' | 'md' | 'lg';
  showTag?: boolean;
}

export const AllianceBadge: React.FC<AllianceBadgeProps> = ({
  a,
  size = 'md',
  showTag = true
}) => {
  const [imgError, setImgError] = useState(false);
  const flagSrc = `/flags/${a.id.toUpperCase()}.png`;

  return (
    <div
      className={`alliance-flag-badge alliance-flag-${size}`}
      style={{ '--banner': a.color } as React.CSSProperties}
      title={`${a.id} Alliance`}
    >
      <div className="alliance-flag-art">
        {!imgError ? (
          <img
            src={flagSrc}
            alt={`${a.id} Banner`}
            className="alliance-flag-img"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="badge-fallback">
            <span>{a.crest || '✦'}</span>
          </div>
        )}
      </div>
      {showTag && <b className="alliance-flag-tag">{a.id}</b>}
    </div>
  );
};
