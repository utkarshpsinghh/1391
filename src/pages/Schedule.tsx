import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHero } from '../components/PageHero';
import { AllianceBadge } from '../components/AllianceBadge';
import { useKingdom } from '../context/KingdomContext';

export const Schedule: React.FC = () => {
  const { data } = useKingdom();
  const { alliances } = data;
  const [local, setLocal] = useState(false);

  const conv = (s: string) => {
    if (!local) return s;

    const parts = s.split(':');
    if (parts.length < 2) return s;
    const [h, m] = parts.map(Number);
    if (isNaN(h) || isNaN(m)) return s;

    const d = new Date(Date.UTC(2026, 0, 1, h, m));

    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d);
  };

  const groups = [
    ['🐻', 'BEAR', 'bear'],
    ['🛡', 'VIKINGS', 'vikings'],
    ['⚔', 'SWORDLAND', 'swordland'],
    ['⚔', '3ALLIANCE', 'threeAlliance']
  ] as const;

  return (
    <>
      <PageHero
        title="KINGDOM EVENT\nSCHEDULE"
        subtitle="Find the event times that fit your day."
      />

      <section className="schedule wrap">
        <div className="time-switch">
          <span>Display time</span>

          <button
            className={!local ? 'chosen' : ''}
            onClick={() => setLocal(false)}
          >
            UTC
          </button>

          <button
            className={local ? 'chosen' : ''}
            onClick={() => setLocal(true)}
          >
            MY LOCAL TIME
          </button>
        </div>

        <div className="schedule-grid">
          {groups.map(([icon, n, key]) => (
            <div className="event-board" key={key}>
              <h2>
                <span>{icon}</span>
                {n}
              </h2>

              {alliances.length > 0 ? (
                alliances.map(a => (
                  <Link to={`/alliances/${a.id}`} key={a.id}>
                    <AllianceBadge a={a} size="sm" showTag={false} />
                    <b>{a.id}</b>
                    <em>
                      {a.events && a.events[key] && a.events[key].length > 0
                        ? a.events[key].map(conv).join(' / ')
                        : 'TBD'}
                    </em>
                  </Link>
                ))
              ) : (
                <div style={{ padding: '14px', textAlign: 'center', color: '#f4d79c', fontStyle: 'italic' }}>
                  No schedule entries in ledger yet.
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="time-note">
          ⏱{' '}
          {local
            ? 'Times converted to your browser timezone.'
            : 'All times are Kingshot Time (UTC).'}
        </p>
      </section>
    </>
  );
};
