import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/Button';
import { useKingdom } from '../context/KingdomContext';

export const Apply: React.FC = () => {
  const [params] = useSearchParams();
  const startedAt = useRef(Date.now());
  const { data } = useKingdom();
  const { alliances } = data;

  const [form, setForm] = useState({
    playerName: '',
    playerId: '',
    power: '',
    tgCenterLevel: '',
    archersLevel: '',
    infantryLevel: '',
    cavalryLevel: '',
    currentKingdom: '',
    currentAlliance: '',
    preferredAlliance: params.get('alliance') || 'Not Sure Yet',
    preferredEventTime: '',
    playstyle: 'Casual',
    discordUsername: '',
    message: '',
    website: ''
  });

  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const change =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const required = [
      ['playerName', 'player name'],
      ['playerId', 'Game ID'],
      ['currentKingdom', 'current kingdom'],
      ['currentAlliance', 'current alliance'],
      ['power', 'power'],
      ['tgCenterLevel', 'TG Center level'],
      ['archersLevel', 'Archers level'],
      ['infantryLevel', 'Infantry level'],
      ['cavalryLevel', 'Cavalry level']
    ] as const;

    const missing = required.find(([key]) => !form[key].trim());

    if (missing) {
      setErr(
        `We still need your ${missing[1]} before the messenger can deliver this scroll.`
      );
      return;
    }

    const lastSent = Number(localStorage.getItem('k1391-enquiry-sent-at'));
    if (lastSent && Date.now() - lastSent < 86400000) {
      setErr(
        'A messenger has already delivered an enquiry from this device. Please wait 24 hours before sending another.'
      );
      return;
    }

    const endpoint = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
    if (!endpoint) {
      setErr('The kingdom ledger is not connected yet.');
      return;
    }

    setErr('');
    setSending(true);

    try {
      // POST with text/plain prevents CORS preflight and allows Apps Script to respond
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          ...form,
          formStartedAt: startedAt.current
        })
      });

      localStorage.setItem('k1391-application', JSON.stringify(form));
      localStorage.setItem('k1391-enquiry-sent-at', String(Date.now()));
      setSent(true);
    } catch {
      // Fallback for browsers that enforce strict opaque redirects
      try {
        await fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify({
            ...form,
            formStartedAt: startedAt.current
          })
        });
        localStorage.setItem('k1391-application', JSON.stringify(form));
        localStorage.setItem('k1391-enquiry-sent-at', String(Date.now()));
        setSent(true);
      } catch {
        setErr(
          'The messenger could not reach the kingdom ledger. Please check your internet connection and try again shortly.'
        );
      }
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <section className="success wrap">
        <div className="bird">🕊</div>

        <div className="parchment">
          <span>✦ ✦ ✦</span>
          <h1>MESSAGE DELIVERED!</h1>
          <p>
            Your enquiry has been received. An alliance representative will contact you with
            the next steps.
          </p>

          <Button to="/community">MEET THE COMMUNITY</Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHero
        title="BEGIN YOUR\nJOURNEY"
        subtitle="Tell the alliance leaders a little about yourself."
      />

      <section className="apply wrap">
        <form className="scroll-form" onSubmit={submit}>
          <div className="scroll-cap">✦</div>

          <h2>TRANSFER ENQUIRY</h2>

          <p className="form-intro">
            Fields marked * are required for the kingdom ledger.
          </p>

          {err && <div className="form-error">📝 {err}</div>}

          <label>
            PLAYER NAME *
            <input
              required
              value={form.playerName}
              onChange={change('playerName')}
              placeholder="Your in-game name"
            />
          </label>

          <div className="two">
            <label>
              GAME ID *
              <input
                required
                value={form.playerId}
                onChange={change('playerId')}
                placeholder="e.g. 2088-85630"
              />
            </label>

            <label>
              POWER *
              <input
                required
                value={form.power}
                onChange={change('power')}
                placeholder="Your current power"
              />
            </label>
          </div>

          <div className="two">
            <label>
              CURRENT KINGDOM *
              <input
                required
                value={form.currentKingdom}
                onChange={change('currentKingdom')}
                placeholder="e.g. K1200"
              />
            </label>

            <label>
              CURRENT ALLIANCE *
              <input
                required
                value={form.currentAlliance}
                onChange={change('currentAlliance')}
                placeholder="Your current alliance"
              />
            </label>
          </div>

          <div className="two">
            <label>
              TG CENTER LEVEL *
              <input
                required
                value={form.tgCenterLevel}
                onChange={change('tgCenterLevel')}
                placeholder="e.g. 30"
              />
            </label>

            <label>
              ARCHERS LEVEL *
              <input
                required
                value={form.archersLevel}
                onChange={change('archersLevel')}
                placeholder="e.g. T10"
              />
            </label>
          </div>

          <div className="two">
            <label>
              INFANTRY LEVEL *
              <input
                required
                value={form.infantryLevel}
                onChange={change('infantryLevel')}
                placeholder="e.g. T10"
              />
            </label>

            <label>
              CAVALRY LEVEL *
              <input
                required
                value={form.cavalryLevel}
                onChange={change('cavalryLevel')}
                placeholder="e.g. T10"
              />
            </label>
          </div>

          <label>
            PREFERRED ALLIANCE
            <select
              value={form.preferredAlliance}
              onChange={change('preferredAlliance')}
            >
              {['Not Sure Yet', ...alliances.map(a => a.id)].map(x => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>

          <div className="two">
            <label>
              PREFERRED EVENT TIME
              <input
                value={form.preferredEventTime}
                onChange={change('preferredEventTime')}
                placeholder="e.g. 16:00 UTC"
              />
            </label>

            <label>
              PLAYSTYLE
              <select value={form.playstyle} onChange={change('playstyle')}>
                <option>Casual</option>
                <option>Active</option>
                <option>Competitive</option>
                <option>War-focused</option>
                <option>Social</option>
              </select>
            </label>
          </div>

          <label>
            DISCORD USERNAME
            <input
              value={form.discordUsername}
              onChange={change('discordUsername')}
              placeholder="Optional"
            />
          </label>

          <label>
            MESSAGE
            <textarea
              value={form.message}
              onChange={change('message')}
              placeholder="Tell us a little about yourself..."
            />
          </label>

          <label className="honeypot" aria-hidden="true">
            LEAVE THIS EMPTY
            <input
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={change('website')}
            />
          </label>

          <button disabled={sending} className="button gold submit">
            <Send />
            {sending ? 'DELIVERING…' : 'SEND APPLICATION'}
          </button>
        </form>
      </section>
    </>
  );
};
