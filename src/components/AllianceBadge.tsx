import React, { useState } from 'react';
import { Alliance } from '../types';

interface AllianceBadgeProps {
  a: Alliance;
  size?: 'sm' | 'md' | 'lg';
  showTag?: boolean;
}

const ALLIANCE_BANNER_MAP: Record<string, string> = {
  HOT: '/flags/HOT.png',
  VIK: '/flags/VIK.png',
  NAT: '/flags/RPG.png',
  RPG: '/flags/RPG.png',
  GRF: '/flags/RPG.png',
  MAD: '/flags/MAD.png',
  SDB: '/flags/SDB.png'
};

function resolveBannerSrc(a: Alliance): string {
  // 1. Explicit Flag URL or flag name from Google Sheets
  const custom = (a.flagUrl || '').trim();
  if (custom) {
    if (custom.startsWith('http://') || custom.startsWith('https://') || custom.startsWith('/')) {
      return custom;
    }
    const upper = custom.toUpperCase();
    if (ALLIANCE_BANNER_MAP[upper]) {
      return ALLIANCE_BANNER_MAP[upper];
    }
    return `/flags/${upper}.png`;
  }

  // 2. Direct ID lookup in map
  const idUpper = (a.id || '').toUpperCase().trim();
  if (ALLIANCE_BANNER_MAP[idUpper]) {
    return ALLIANCE_BANNER_MAP[idUpper];
  }

  // 3. Name or description keyword matching so banner sticks to alliance irrespective of name changes
  const combined = `${a.id || ''} ${a.name || ''} ${a.description || ''}`.toUpperCase();
  if (
    combined.includes('RPG') ||
    combined.includes('NAT') ||
    combined.includes('NASTY') ||
    combined.includes('TROOPS') ||
    combined.includes('BALANCED')
  ) {
    return '/flags/RPG.png';
  }
  if (combined.includes('HOT') || combined.includes('ONEFORALL') || combined.includes('WARM WELCOME')) {
    return '/flags/HOT.png';
  }
  if (combined.includes('VIK') || combined.includes('VALHALLA') || combined.includes('ORGANISED')) {
    return '/flags/VIK.png';
  }
  if (combined.includes('MAD') || combined.includes('CHAOS') || combined.includes('CHAOTIC') || combined.includes('WAR-FOCUSED')) {
    return '/flags/MAD.png';
  }
  if (combined.includes('SDB') || combined.includes('DOWNBAD') || combined.includes('SQUAD') || combined.includes('SETTLE IN')) {
    return '/flags/SDB.png';
  }

  return `/flags/${idUpper}.png`;
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

  // Use custom flag URL, mapped banner, or fallback
  const flagSrc = !isFlagDisabled ? resolveBannerSrc(a) : '';
  const showFlagImage = !isFlagDisabled && !imgError && Boolean(flagSrc);

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
