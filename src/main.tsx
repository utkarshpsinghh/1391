import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { KingdomProvider, useKingdom } from './context/KingdomContext';
import { LoadingScreen } from './components/LoadingScreen';
import { Layout } from './components/Layout';

import { Home } from './pages/Home';
import { Alliances } from './pages/Alliances';
import { Leaderboard } from './pages/Leaderboard';
import { Detail } from './pages/Detail';
import { Transfer } from './pages/Transfer';
import { Schedule } from './pages/Schedule';
import { Records } from './pages/Records';
import { Team } from './pages/Team';
import { Apply } from './pages/Apply';
import { Kingdom } from './pages/Kingdom';
import { Community } from './pages/Community';
import { FAQ } from './pages/FAQ';
import { NotFound } from './pages/NotFound';

import './style.css';
import './news.css';

const App: React.FC = () => {
  const { loading } = useKingdom();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/alliances" element={<Alliances />} />
          <Route path="/alliances/:id" element={<Detail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/records" element={<Records />} />
          <Route path="/team" element={<Team />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/kingdom" element={<Kingdom />} />
          <Route path="/community" element={<Community />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')!).render(
  <KingdomProvider>
    <App />
  </KingdomProvider>
);
