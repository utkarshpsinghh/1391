import React from 'react';
import { PageHero } from '../components/PageHero';
import { TeamSection } from '../components/TeamSection';
import { useKingdom } from '../context/KingdomContext';

export const Team: React.FC = () => {
  const { data } = useKingdom();
  const { team, settings } = data;

  const transferManagers = team.filter(
    m => m.category.toLowerCase().includes('transfer')
  );
  const allianceR5s = team.filter(
    m => m.category.toLowerCase().includes('r5') || m.rank?.toUpperCase() === 'R5'
  );
  const staff = team.filter(
    m =>
      !m.category.toLowerCase().includes('transfer') &&
      !m.category.toLowerCase().includes('r5') &&
      m.rank?.toUpperCase() !== 'R5'
  );

  return (
    <>
      <PageHero
        title={`THE K${settings.kingdomNumber}\nTEAM`}
        subtitle="Meet the people who help guide, manage and welcome our kingdom."
      />

      <section className="team-page wrap">
        <div className="team-intro parchment">
          <span className="corner">✦</span>
          <h2>THE PEOPLE BEHIND THE KINGDOM</h2>
          <p>
            From transfer coordination to alliance leadership, our team helps keep Kingdom{' '}
            {settings.kingdomNumber} organised, welcoming and ready for the next chapter.
          </p>
          <div className="team-intro-tools">♜ &nbsp; ⚔ &nbsp; 🛡 &nbsp; ✦</div>
        </div>

        <TeamSection
          title="TRANSFER MANAGERS"
          subtitle={`The people helping travellers find their place in K${settings.kingdomNumber}.`}
          members={transferManagers}
        />

        <TeamSection
          title="ALLIANCE R5s"
          subtitle={`The R5 leaders representing the alliances of K${settings.kingdomNumber}.`}
          members={allianceR5s}
        />

        <TeamSection
          title="STAFF"
          subtitle="The people working behind the scenes to support the kingdom."
          members={staff}
        />

        <div className="team-footer-note">
          <span>✦</span>
          <p>
            Player IDs are displayed to help travellers identify the correct Kingdom{' '}
            {settings.kingdomNumber} representative in-game.
          </p>
          <span>✦</span>
        </div>
      </section>
    </>
  );
};
