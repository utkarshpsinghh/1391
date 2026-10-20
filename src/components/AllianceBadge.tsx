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

  // If Google Sheets specifies "none", "hide", "false", or "off", remove flag image and show crest badge
  const isFlagDisabled =
    Boolean(a.flagUrl) &&
    ['none', 'hide', 'false', 'off', 'no'].includes(a.flagUrl!.toLowerCase().trim());

  // Use custom flag URL from sheets if provided; otherwise fallback to local flag asset
  const flagSrc =
    !isFlagDisabled && a.flagUrl && a.flagUrl.trim().length > 0
      ? a.flagUrl.trim()
      : `/flags/${a.id.toUpperCase()}.png`;

  const showFlagImage = !isFlagDisabled && !imgError;

  return (
    <div
      className={`alliance-flag-badge alliance-flag-${size}`}
      style={{ '--banner': a.color } as React.CSSProperties}
      title={`${a.id} Alliance`}
    >
      <div className="alliance-flag-art">
        {showFlagImage ? (
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
