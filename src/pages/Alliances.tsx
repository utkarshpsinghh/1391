import React, { useState } from 'react';
import { PageHero } from '../components/PageHero';
import { AllianceCard } from '../components/AllianceCard';
import { useKingdom } from '../context/KingdomContext';

export const Alliances: React.FC = () => {
  const { data, error, refresh } = useKingdom();
  const { alliances, settings } = data;
  const [filter, setFilter] = useState('ALL');

  const showing =
    filter === 'ALL'
      ? alliances
      : alliances.filter(a => a.id.toUpperCase() === filter.toUpperCase());

  return (
    <>
      <PageHero
        title={`THE ALLIANCES\nOF K${settings.kingdomNumber}`}
        subtitle="Every alliance has its own rhythm. Find the one that fits yours."
      />

      <section className="alliance-page wrap">
        <div className="tabs" aria-label="Filter alliances">
          {['ALL', ...alliances.map(a => a.id)].map(x => (
            <button
              className={filter === x ? 'active' : ''}
              onClick={() => setFilter(x)}
              key={x}
            >
              {x === 'ALL' ? '✦ ALL HALLS' : x}
            </button>
          ))}
        </div>

        <div className="alliance-grid">
          {showing.length > 0 ? (
            showing.map(a => (
              <AllianceCard key={a.id} a={a} />
            ))
          ) : error ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', margin: '20px auto', padding: '24px', background: '#f8dfaa', border: '2px solid #926136', borderRadius: '10px', maxWidth: '500px' }}>
              <p style={{ fontWeight: 'bold', color: '#8b2e1d', margin: '0 0 12px' }}>⚠️ {error}</p>
              <button className="button gold" onClick={() => refresh()}>
                RETRY CONNECTION
              </button>
            </div>
          ) : (
            <p className="time-note">No alliances found in the kingdom ledger.</p>
          )}
        </div>

        <p className="time-note">
          ⏱ All times listed are Kingshot time (UTC). Player IDs are provided in case alliance
          players change their usernames.
        </p>
      </section>
    </>
  );
};
