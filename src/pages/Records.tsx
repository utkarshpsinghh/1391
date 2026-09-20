import React from 'react';
import { Trophy, Shield } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { useKingdom } from '../context/KingdomContext';

export const Records: React.FC = () => {
  const { data } = useKingdom();
  const { kvkRecords, settings } = data;

  // Calculate live tallies dynamically from kvkRecords
  const prepWins = kvkRecords.filter(r => r.prep.toUpperCase() === 'WIN').length;
  const prepLosses = kvkRecords.filter(r => r.prep.toUpperCase() === 'LOSS').length;

  const battleWins = kvkRecords.filter(r => r.battle.toUpperCase() === 'WIN').length;
  const battleLosses = kvkRecords.filter(r => r.battle.toUpperCase() === 'LOSS').length;

  return (
    <>
      <PageHero
        title="THE KVK\nRECORD HALL"
        subtitle={`The campaigns that have shaped Kingdom ${settings.kingdomNumber}.`}
      />

      <section className="records wrap">
        <div className="record-overview">
          <div>
            <Trophy />
            <span>PREPARATION PHASE</span>
            <strong>
              {prepWins}–{prepLosses}
            </strong>
            <small>{prepLosses === 0 ? 'UNDEFEATED' : 'DOMINANT'}</small>
          </div>

          <div>
            <Shield />
            <span>BATTLE PHASE</span>
            <strong>
              {battleWins}–{battleLosses}
            </strong>
            <small>HARD-FOUGHT</small>
          </div>
        </div>

        <div className="record-board">
          <div className="record-title">
            <span>♜</span>

            <div>
              <small>KINGDOM {settings.kingdomNumber}</small>
              <h2>KVK CAMPAIGN LEDGER</h2>
            </div>

            <span>♜</span>
          </div>

          <div className="record-head">
            <span>CAMPAIGN</span>
            <span>OPPONENT</span>
            <span>PREPARATION</span>
            <span>BATTLE</span>
          </div>

          {kvkRecords.length > 0 ? (
            kvkRecords.map(r => (
              <div
                className="record-row"
                key={`kvk-${r.kvk}-${r.opponent}`}
              >
                <b>KVK {r.kvk}</b>
                <span className="opponent">KINGDOM {r.opponent}</span>
                <span className={`result ${r.prep.toLowerCase()}`}>
                  {r.prep}
                </span>
                <span className={`result ${r.battle.toLowerCase()}`}>
                  {r.battle}
                </span>
              </div>
            ))
          ) : (
            <p className="record-note">No campaign records in ledger yet.</p>
          )}

          <p className="record-note">
            Records shown reflect the Kingdom {settings.kingdomNumber} live campaign history.
          </p>
        </div>
      </section>
    </>
  );
};
