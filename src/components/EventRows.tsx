import React from 'react';
import { Alliance } from '../types';

export const EventRows: React.FC<{ a: Alliance }> = ({ a }) => {
  const rows = [
    { icon: '🐻', name: 'Bear', times: a.events.bear },
    { icon: '🛡', name: 'Vikings', times: a.events.vikings },
    { icon: '⚔', name: 'Swordland', times: a.events.swordland },
    { icon: '⚔', name: '3Alliance', times: a.events.threeAlliance }
  ];

  return (
    <div className="events">
      {rows.map(({ icon, name, times }) => (
        <div key={name}>
          <span>{icon}</span>
          <b>{name}</b>
          <em>{times && times.length > 0 ? times.join(' / ') : 'TBD'}</em>
        </div>
      ))}
    </div>
  );
};
