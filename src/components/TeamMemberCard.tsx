import React from 'react';
import { TeamMember } from '../types';
import { ImageWithFallback } from './ImageWithFallback';

export const TeamMemberCard: React.FC<TeamMember> = ({
  name,
  playerId,
  role,
  crest = '♜',
  rank = 'R5',
  alliance,
  pfp
}) => {
  return (
    <article className="team-id-card compact-team-card">
      <div className="team-pfp-wrap">
        <ImageWithFallback
          src={pfp}
          alt={`${name} profile`}
          className="team-pfp"
          fallbackPlaceholder={crest}
        />
      </div>

      <div className="team-id-main compact-team-main">
        <div className="team-member-line">
          <h3>{name}</h3>
          {alliance && <span className="team-member-alliance">{alliance}</span>}
          {role && <span className="team-member-role">{role}</span>}
        </div>

        <div className="team-player-id compact-player-id">
          <span>PLAYER ID</span>
          <strong>{playerId}</strong>
        </div>
      </div>

      <div className="team-id-rank">{rank}</div>
      <div className="team-id-seal">✦</div>
    </article>
  );
};
