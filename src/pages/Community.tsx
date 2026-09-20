import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { useKingdom } from '../context/KingdomContext';

export const Community: React.FC = () => {
  const { data } = useKingdom();
  const { settings } = data;

  return (
    <>
      <PageHero
        title={`JOIN THE K${settings.kingdomNumber}\nCOMMUNITY`}
        subtitle="Meet players. Talk with alliance leaders. Plan your transfer."
      />

      <section className="community wrap">
        <div className="discord-panel">
          <MessageCircle />

          <div>
            <h2>THE KINGDOM GATE IS OPEN</h2>

            <p>
              Join the conversation for kingdom announcements, alliance contacts, transfer
              discussions, and community chat.
            </p>

            <a
              href={settings.discordUrl}
              target="_blank"
              rel="noreferrer"
              className="button gold"
            >
              JOIN DISCORD <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
};
