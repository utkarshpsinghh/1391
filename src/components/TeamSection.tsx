import React from 'react';
import { TeamMember } from '../types';
import { TeamMemberCard } from './TeamMemberCard';
import { useKingdom } from '../context/KingdomContext';

interface TeamSectionProps {
  title: string;
  subtitle: string;
  members: TeamMember[];
}

export const TeamSection: React.FC<TeamSectionProps> = ({
  title,
  subtitle,
  members
}) => {
  const { data } = useKingdom();

  if (!members || members.length === 0) return null;

  return (
    <section className="team-section">
      <div className="team-section-heading">
        <span>✦</span>
        <div>
          <small>KINGDOM {data.settings.kingdomNumber}</small>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <span>✦</span>
      </div>

      <div className="team-grid">
        {members.map((member, index) => (
          <TeamMemberCard
            key={`${member.playerId || member.name}-${index}`}
            {...member}
          />
        ))}
      </div>
    </section>
  );
};
