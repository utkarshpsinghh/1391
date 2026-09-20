import React from 'react';
import { Alliance } from '../types';
import { AllianceBadge } from './AllianceBadge';
import { EventRows } from './EventRows';
import { Button } from './Button';

export const AllianceCard: React.FC<{ a: Alliance }> = ({ a }) => {
  return (
    <article
      className="alliance-card"
      style={{ '--banner': a.color } as React.CSSProperties}
    >
      <div className="card-spark">✦</div>
      <AllianceBadge a={a} />

      <div className="card-main">
        <h2>
          {a.id} <small>ALLIANCE</small>
        </h2>
        <p>{a.description}</p>
        <EventRows a={a} />

        <Button to={`/alliances/${a.id}`} kind="wood">
          VIEW ALLIANCE
        </Button>
      </div>
    </article>
  );
};
