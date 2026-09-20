import React from 'react';
import { useParams } from 'react-router-dom';
import { AllianceBadge } from '../components/AllianceBadge';
import { EventRows } from '../components/EventRows';
import { Button } from '../components/Button';
import { NotFound } from './NotFound';
import { useKingdom } from '../context/KingdomContext';

export const Detail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getAlliance, data } = useKingdom();
  const a = getAlliance(id);

  if (!a) return <NotFound />;

  const status = (a.transferStatus || 'OPEN').toUpperCase();
  const statusClass = status === 'OPEN' ? 'open' : status === 'CLOSED' ? 'closed' : 'invite';

  return (
    <>
      <section
        className="alliance-hero"
        style={{ '--banner': a.color } as React.CSSProperties}
      >
        <AllianceBadge a={a} />

        <div>
          <span>THE ALLIANCE OF K{data.settings.kingdomNumber}</span>
          <h1>{a.id} ALLIANCE</h1>
          <p>{a.description}</p>
        </div>
      </section>

      <section className="detail wrap">
        <div className="parchment">
          <h2>ALLIANCE SCHEDULE</h2>
          <EventRows a={a} />
        </div>

        <div className="stone-info">
          <h2>ALLIANCE INFORMATION</h2>

          <dl>
            <dt>PLAYSTYLE</dt>
            <dd>{a.playstyle || 'Active & Friendly'}</dd>

            <dt>COMMUNICATION</dt>
            <dd>Discord</dd>

            <dt>TRANSFER STATUS</dt>
            <dd className={statusClass}>{status}</dd>

            <dt>RECOMMENDED FOR</dt>
            <dd>Players seeking an active home</dd>
          </dl>
        </div>

        <div className="contact-board">
          <h2>CONTACT THE LEADERS</h2>

          {a.contacts && a.contacts.length > 0 ? (
            a.contacts.map(c => (
              <div className="contact" key={c.playerId || c.name}>
                <span>✉</span>
                <div>
                  <b>{c.name}</b>
                  <small>Player ID: {c.playerId}</small>
                </div>
              </div>
            ))
          ) : (
            <p>Contact kingdom transfer managers for enquiry details.</p>
          )}

          <div style={{ marginTop: '16px' }}>
            <Button to={`/apply?alliance=${a.id}`}>
              ASK ABOUT JOINING {a.id}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};
