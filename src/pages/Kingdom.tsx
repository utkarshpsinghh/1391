import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { useKingdom } from '../context/KingdomContext';

export const Kingdom: React.FC = () => {
  const { data } = useKingdom();
  const { news, settings, kvkRecords } = data;

  const prepWins = kvkRecords.filter(r => r.prep.toUpperCase() === 'WIN').length;
  const prepLosses = kvkRecords.filter(r => r.prep.toUpperCase() === 'LOSS').length;
  const battleWins = kvkRecords.filter(r => r.battle.toUpperCase() === 'WIN').length;
  const battleLosses = kvkRecords.filter(r => r.battle.toUpperCase() === 'LOSS').length;

  return (
    <>
      <PageHero
        title={`KINGDOM ${settings.kingdomNumber}\nNEWS`}
        subtitle="Dispatches, milestones and notices from across the kingdom."
      />

      <section className="news wrap">
        <div className="news-banner parchment">
          <span className="news-seal">♜</span>

          <div>
            <small>KINGDOM BULLETIN</small>
            <h2>WELCOME TO THE NEWS BOARD</h2>
            <p>
              Keep up with alliance activity, event schedules, KVK history and community
              announcements in one place.
            </p>
          </div>

          <span className="news-seal">♜</span>
        </div>

        <div className="news-grid">
          {news.length > 0 ? (
            news.map((item, i) => {
              // If it's the KVK card, inject the actual dynamic records
              const copy =
                item.title.includes('KVK')
                  ? `Kingdom ${settings.kingdomNumber} stands at ${prepWins}–${prepLosses} in Preparation Phase and ${battleWins}–${battleLosses} in Battle Phase across recorded campaigns.`
                  : item.copy;

              return (
                <article className={`news-card news-${i % 4}`} key={`${item.title}-${i}`}>
                  <div className="news-card-top">
                    <span>{item.icon}</span>
                    <small>ROYAL DISPATCH</small>
                  </div>

                  <h2>{item.title}</h2>
                  <p>{copy}</p>

                  <Link className="news-link" to={item.to}>
                    {item.cta}
                    <ArrowRight size={17} />
                  </Link>
                </article>
              );
            })
          ) : (
            <p className="news-note" style={{ gridColumn: '1/-1' }}>
              No dispatches on the news board yet.
            </p>
          )}
        </div>

        <p className="news-note">
          New kingdom announcements can be added directly via the kingdom Google Sheet.
        </p>
      </section>
    </>
  );
};
