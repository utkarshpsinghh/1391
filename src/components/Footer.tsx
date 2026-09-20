import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useKingdom } from '../context/KingdomContext';

const quickNav = [
  ['/', 'Home'],
  ['/alliances', 'Alliances'],
  ['/transfer', 'Transfer'],
  ['/schedule', 'Schedule'],
  ['/records', 'KVK Records']
] as const;

export const Footer: React.FC = () => {
  const { data } = useKingdom();

  return (
    <footer>
      <div className="footer-mark">
        ♜ <b>K{data.settings.kingdomNumber}</b>
        <span>{data.settings.kingdomName}</span>
      </div>

      <div>
        {quickNav.map(([p, n]) => (
          <Link key={p} to={p}>
            {n}
          </Link>
        ))}
      </div>

      <a
        className="discord-mini"
        href={data.settings.discordUrl}
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle /> Join Discord
      </a>

      <p>
        Alliance information and schedules may change. Please confirm current details with alliance leadership.
      </p>
    </footer>
  );
};
