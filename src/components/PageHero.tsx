import React from 'react';
import { Sign } from './Sign';
import { useKingdom } from '../context/KingdomContext';

interface PageHeroProps {
  title: string;
  subtitle: string;
}

export const PageHero: React.FC<PageHeroProps> = ({ title, subtitle }) => {
  const { data } = useKingdom();
  const kingdomLabel = `KINGDOM ${data.settings.kingdomNumber}`;

  return (
    <section className="inner-hero">
      <Sign
        eyebrow={kingdomLabel}
        title={title}
        copy={subtitle}
      />
    </section>
  );
};
