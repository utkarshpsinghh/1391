import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Castle,
  ScrollText,
  Clock3,
  Users,
  HelpCircle,
  Mail,
  Shield,
  Trophy,
  Bell,
  MessageCircle
} from 'lucide-react';
import { Footer } from './Footer';
import { useKingdom } from '../context/KingdomContext';

const navItems = [
  ['/', 'Home', Castle],
  ['/alliances', 'Alliances', Shield],
  ['/transfer', 'Transfer', ScrollText],
  ['/schedule', 'Schedule', Clock3],
  ['/records', 'KVK Records', Trophy],
  ['/team', 'Our Team', Users],
  ['/kingdom', 'News', Bell],
  ['/community', 'Community', MessageCircle],
  ['/faq', 'FAQ', HelpCircle]
] as const;

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const { data } = useKingdom();

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loc.pathname]);

  return (
    <>
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="castle">♜</span>
          <span>
            <b>K{data.settings.kingdomNumber}</b>
            <small>{data.settings.kingdomName}</small>
          </span>
        </Link>

        <nav>
          {navItems.map(([p, n]) => (
            <NavLink end={p === '/'} key={p} to={p}>
              {n}
            </NavLink>
          ))}
        </nav>

        <Link to="/apply" className="applytop">
          <Mail size={17} /> APPLY TO JOIN
        </Link>

        <button
          className="menubtn"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>

      {open && (
        <div className="mobilemenu">
          {navItems.map(([p, n, I]) => (
            <NavLink key={p} to={p}>
              <I size={18} /> {n}
            </NavLink>
          ))}

          <Link to="/apply" className="button gold">
            <Mail size={18} /> APPLY TO JOIN
          </Link>
        </div>
      )}

      <main key={loc.pathname} className="page-enter">
        {children}
      </main>

      <Footer />
    </>
  );
};
