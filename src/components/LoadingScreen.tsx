import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="kingdom-loading-screen" role="status" aria-live="polite">
      <div className="loading-emblem">
        <div className="loading-crest">♜</div>
        <div className="loading-ring" />
        <div className="loading-sparks">✦ ✦ ✦</div>
      </div>
      <div className="loading-parchment">
        <h2>KINGDOM 1391</h2>
        <p>Fetching the Royal Scrolls from the Kingdom Ledger…</p>
        <div className="loading-bar">
          <div className="loading-progress" />
        </div>
      </div>
    </div>
  );
};
