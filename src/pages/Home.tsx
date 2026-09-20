import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Sign } from '../components/Sign';
import { Button } from '../components/Button';
import { AllianceCard } from '../components/AllianceCard';
import { useKingdom } from '../context/KingdomContext';

export const Home: React.FC = () => {
  const { data } = useKingdom();
  const { settings, alliances } = data;

  const kingdomNum = settings.kingdomNumber || '1391';
  const kingdomTitle = settings.heroTitle || 'FIND YOUR\nFOREVER HOME';
  const kingdomSub = settings.heroSubtitle || `in K${kingdomNum}`;
  const heroCopy =
    settings.heroCopy ||
    'A friendly kingdom for active players,\nstrong alliances and unforgettable battles.';

  return (
    <>
      <section className="hero">
        <div className="cloud c1" />
        <div className="cloud c2" />
        <div className="castle-bg">♜</div>
        <div className="hill h1" />
        <div className="hill h2" />
        <div className="flower f1">✿</div>
        <div className="flower f2">✿</div>

        <div className="hero-sign">
          <Sign
            eyebrow={settings.kingdomName || `KINGSHOT KINGDOM ${kingdomNum}`}
            title={kingdomTitle}
            copy={kingdomSub}
          />

          <p className="hero-copy" style={{ whiteSpace: 'pre-line' }}>
            {heroCopy}
          </p>

          <div className="hero-buttons">
            <Button to="/alliances">EXPLORE ALLIANCES</Button>
            <Button to="/transfer" kind="cream">
              TRANSFER INFORMATION
            </Button>
          </div>

          <Link className="community-link" to="/community">
            <MessageCircle /> JOIN OUR COMMUNITY
          </Link>
        </div>
      </section>

      <section className="welcome wrap">
        <div className="parchment pinned">
          <span className="corner">✿</span>
          <h2>WELCOME TO KINGDOM {kingdomNum}</h2>
          <p className="lead">Looking for a new home?</p>
          <p>
            Kingdom {kingdomNum} welcomes players looking for an active,
            organised and friendly kingdom. Explore our alliances, compare event schedules,
            meet alliance representatives and find the place that fits your playstyle.
          </p>
          <div className="paper-tools">⌖ &nbsp; 🪶 &nbsp; 🛡</div>
        </div>
      </section>

      {alliances.length > 0 && (
        <section className="alliance-preview">
          <div className="section-title">
            <span>THE ALLIANCE HALL</span>
            <h2>MEET THE ALLIANCES</h2>
            <p>Every alliance has its own rhythm. Find the one that fits yours.</p>
          </div>

          <div className="alliance-grid wrap">
            {alliances.map(a => (
              <AllianceCard key={a.id} a={a} />
            ))}
          </div>

          <div className="center">
            <Button to="/alliances">SEE ALL ALLIANCES</Button>
          </div>
        </section>
      )}

      <section className="home-quest wrap">
        <div>
          <span className="kicker">YOUR NEXT CHAPTER</span>
          <h2>
            A kingdom worth
            <br />
            calling home.
          </h2>
          <p>
            Meet allies, discover battle schedules, and begin your transfer journey with
            confidence.
          </p>

          <Button to="/transfer" kind="wood">
            START YOUR QUEST
          </Button>
        </div>

        <div className="quest-shield">
          <span>♜</span>
          <b>{kingdomNum}</b>
          <i>✦</i>
        </div>
      </section>
    </>
  );
};
