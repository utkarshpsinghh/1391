import React, { useState, useMemo } from 'react';
import { Trophy, RefreshCw, Crown, Shield, Swords, Flame, Sparkles, Star } from 'lucide-react';
import { useKingdom } from '../context/KingdomContext';
import { PageHero } from '../components/PageHero';
import { AllianceBadge } from '../components/AllianceBadge';
import { LeaderboardEntry } from '../types';

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Synced recently';
  const now = Date.now();
  const date = new Date(dateString).getTime();
  if (isNaN(date)) return 'Synced recently';

  const diffSeconds = Math.max(0, Math.floor((now - date) / 1000));
  if (diffSeconds < 60) return 'Synced just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `Synced ${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Synced ${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `Synced ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

// In-game avatar placeholder colors & styles based on ranking
function getRankBadgeClass(rank: number): string {
  if (rank === 1) return 'rank-badge-1';
  if (rank === 2) return 'rank-badge-2';
  if (rank === 3) return 'rank-badge-3';
  return 'rank-badge-default';
}

function getRankCardClass(rank: number): string {
  if (rank === 1) return 'leaderboard-row row-rank-1';
  if (rank === 2) return 'leaderboard-row row-rank-2';
  if (rank === 3) return 'leaderboard-row row-rank-3';
  return 'leaderboard-row row-rank-default';
}

export const Leaderboard: React.FC = () => {
  const { data, loading, refresh, getAlliance } = useKingdom();
  const [selectedCategory, setSelectedCategory] = useState<string>('Personal Power');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const rawEntries = data.leaderboard || [];

  // Group categories into Alliance vs Private
  const allianceCategories = ['Alliance Power', 'Alliance Kills'];
  const privateCategories = [
    'Personal Power',
    'Town Center Level',
    'Kill Count',
    'Hero Power',
    'Hero\'s Total Power',
    'Total Pet Power',
    'Island Prosperity',
    'Mystic Trial',
    'Rebel Conquest Stage',
    'Master Total Power'
  ];

  // Top 10 entries for selected category
  const top10 = useMemo(() => {
    return rawEntries
      .filter(e => e.category.toLowerCase() === selectedCategory.toLowerCase())
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 10);
  }, [rawEntries, selectedCategory]);

  const isAllianceCategory = allianceCategories.includes(selectedCategory);
  const metricHeader = top10[0]?.scoreLabel || (isAllianceCategory ? 'Power' : 'Power');

  return (
    <>
      <PageHero
        title="KINGDOM 1391&#10;LEADERBOARD"
        subtitle="The realm's greatest governors and legendary alliances."
      />

      <section className="leaderboard-section wrap">
        {/* Sync status & Refresh button */}
        <div className="sync-bar">
          <div className="sync-status">
            <span className="sync-dot"></span>
            <span className="sync-text">{formatRelativeTime(data.lastSyncedAt)}</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="sync-btn"
            title="Refresh latest scores from Google Sheet"
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin-icon' : ''} />
            <span>{isRefreshing ? 'SYNCING...' : 'SYNC NOW'}</span>
          </button>
        </div>

        {/* Category Tabs: In-game style */}
        <div className="category-board">
          <div className="category-group">
            <div className="category-group-title">
              <Shield size={16} />
              <span>ALLIANCE RANKINGS</span>
            </div>
            <div className="category-buttons">
              {allianceCategories.map(cat => (
                <button
                  key={cat}
                  className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'Alliance Power' && <Flame size={15} />}
                  {cat === 'Alliance Kills' && <Swords size={15} />}
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="category-group">
            <div className="category-group-title">
              <Crown size={16} />
              <span>GOVERNOR RANKINGS</span>
            </div>
            <div className="category-buttons">
              {privateCategories.map(cat => (
                <button
                  key={cat}
                  className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'Personal Power' && <Trophy size={15} />}
                  {cat === 'Kill Count' && <Swords size={15} />}
                  {cat === 'Town Center Level' && <Star size={15} />}
                  {cat.includes('Hero') && <Crown size={15} />}
                  {cat.includes('Pet') && <Sparkles size={15} />}
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Top 10 In-Game Leaderboard Table */}
        <div className="in-game-leaderboard-card">
          <div className="leaderboard-table-header">
            <span className="col-rank">RANKING</span>
            <span className="col-gov">{isAllianceCategory ? 'ALLIANCE' : 'GOVERNOR'}</span>
            <span className="col-power">{metricHeader.toUpperCase()}</span>
          </div>

          <div className="leaderboard-rows-list">
            {top10.length > 0 ? (
              top10.map(entry => {
                const allianceObj = getAlliance(entry.alliance);
                return (
                  <article key={`${entry.category}-${entry.rank}-${entry.playerName}`} className={getRankCardClass(entry.rank)}>
                    {/* Rank Badge */}
                    <div className="rank-col">
                      <div className={`rank-badge ${getRankBadgeClass(entry.rank)}`}>
                        {entry.rank === 1 && <Crown size={11} className="crown-mini" />}
                        <span>{entry.rank}</span>
                      </div>
                    </div>

                    {/* Governor Avatar & Name */}
                    <div className="gov-col">
                      <div className="gov-avatar-box">
                        {entry.avatarUrl ? (
                          <img src={entry.avatarUrl} alt={entry.playerName} className="gov-avatar-img" />
                        ) : allianceObj ? (
                          <AllianceBadge a={allianceObj} size="sm" showTag={false} />
                        ) : (
                          <div className="gov-avatar-placeholder">
                            <span>{entry.playerName.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                        <div className="avatar-royal-frame"></div>
                      </div>

                      <div className="gov-info">
                        <div className="gov-name-line">
                          {entry.alliance && (
                            <span
                              className="gov-tag"
                              style={{ '--tag-color': allianceObj?.color || '#8b5128' } as React.CSSProperties}
                            >
                              [{entry.alliance.toUpperCase()}]
                            </span>
                          )}
                          <strong className="gov-name">{entry.playerName}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Score / Power */}
                    <div className="power-col">
                      <span className="power-value">{entry.scoreValue}</span>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="empty-leaderboard">
                <Trophy size={48} />
                <p>No entries found for {selectedCategory} yet.</p>
                <small>Entries added in Google Sheets under the <b>Leaderboard</b> tab will appear here.</small>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="leaderboard-footer-note">
          <p>
            ⏱ All stats are synchronized from Kingdom 1391 records. Rankings display the Top 10 leaders of each category.
          </p>
        </div>
      </section>
    </>
  );
};
