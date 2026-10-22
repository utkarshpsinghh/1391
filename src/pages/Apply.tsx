import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Button } from '../components/Button';
import { useKingdom } from '../context/KingdomContext';
import { GOOGLE_APPS_SCRIPT_URL, APPLY_API_ENDPOINT, RECAPTCHA_SITE_KEY } from '../config';

declare global {
  interface Window {
    grecaptcha?: any;
    onRecaptchaLoaded?: () => void;
  }
}

export const Apply: React.FC = () => {
  const [params] = useSearchParams();
  const startedAt = useRef(Date.now());
  const { data } = useKingdom();
  const { alliances } = data;

  const [form, setForm] = useState({
    playerName: '',
    playerId: '',
    power: '',
    currentKingdom: '',
    currentAlliance: '',
    preferredAlliance: params.get('alliance') || 'Not Sure Yet',
    tgCenterLevel: '',
    discordUsername: '',
    message: '',
    website: ''
  });

  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  // Initialize invisible Google reCAPTCHA v3
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;

    const SCRIPT_ID = 'google-recaptcha-v3-script';
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(RECAPTCHA_SITE_KEY)}`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

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
      ['power', 'power']
    ] as const;

    const missing = required.find(([key]) => !form[key].trim());

    if (missing) {
      setErr(
        `We still need your ${missing[1]} before the messenger can deliver this scroll.`
      );
      return;
    }

    let finalRecaptchaToken = '';
    if (RECAPTCHA_SITE_KEY && window.grecaptcha) {
      try {
        finalRecaptchaToken = await new Promise<string>((resolve) => {
          window.grecaptcha.ready(async () => {
            try {
              const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {
                action: 'submit_enquiry'
              });
              resolve(token || '');
            } catch (execErr) {
              console.warn('reCAPTCHA execution error:', execErr);
              resolve('');
            }
          });
        });
      } catch (err) {
        console.warn('reCAPTCHA error:', err);
      }
    }

    if (Date.now() - startedAt.current < 2000) {
      setErr('Please take a moment to review your application before sending.');
      return;
    }

    const lastSent = Number(localStorage.getItem('k1391-enquiry-sent-at'));
    if (lastSent && Date.now() - lastSent < 86400000) {
      setErr(
        'A messenger has already delivered an enquiry from this device. Please wait 24 hours before sending another.'
      );
      return;
    }

    const endpoint = GOOGLE_APPS_SCRIPT_URL;
    if (!endpoint) {
      setErr('The kingdom ledger is not connected yet.');
      return;
    }

    setErr('');
    setSending(true);

    const SECURITY_TOKEN = 'K1391_ROYAL_LEDGER_AUTH_2026';
    const payload = {
      ...form,
      fcLevel: form.tgCenterLevel,
      recaptchaToken: finalRecaptchaToken,
      securityToken: SECURITY_TOKEN,
      formStartedAt: startedAt.current,
      submittedAt: Date.now()
    };

    try {
      // 1. Submit via Vercel API proxy (Google Apps Script URL 100% hidden)
      const res = await fetch(APPLY_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => null);
      if (data && data.ok === false) {
        setErr(data.error || 'The kingdom ledger could not verify the application.');
        return;
      }
      localStorage.setItem('k1391-application', JSON.stringify(form));
      localStorage.setItem('k1391-enquiry-sent-at', String(Date.now()));
      setSent(true);
    } catch {
      // 2. Direct fallback to Google Apps Script if proxy route is unavailable
      try {
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload)
        });
        localStorage.setItem('k1391-application', JSON.stringify(form));
        localStorage.setItem('k1391-enquiry-sent-at', String(Date.now()));
        setSent(true);
      } catch {
        // 3. Fallback for strict opaque redirect browsers
        try {
          await fetch(endpoint, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
          });
          localStorage.setItem('k1391-application', JSON.stringify(form));
          localStorage.setItem('k1391-enquiry-sent-at', String(Date.now()));
          setSent(true);
        } catch {
          setErr(
            'The messenger could not reach the kingdom ledger. Please check your internet connection and try again shortly.'
          );
        }
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

          <div className="two">
            <label>
              PLAYER NAME *
              <input
                required
                value={form.playerName}
                onChange={change('playerName')}
                placeholder="Your in-game name"
              />
            </label>

            <label>
              GAME ID *
              <input
                required
                value={form.playerId}
                onChange={change('playerId')}
                placeholder="e.g. 2088-85630"
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
              CURRENT ALLIANCE
              <input
                value={form.currentAlliance}
                onChange={change('currentAlliance')}
                placeholder="e.g. None / HOT"
              />
            </label>

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
          </div>

          <div className="two">
            <label>
              TG CENTER LEVEL (OPTIONAL)
              <input
                value={form.tgCenterLevel}
                onChange={change('tgCenterLevel')}
                placeholder="e.g. TG 30 (FC 5)"
              />
            </label>

            <label>
              DISCORD USERNAME (OPTIONAL)
              <input
                value={form.discordUsername}
                onChange={change('discordUsername')}
                placeholder="e.g. player#1234"
              />
            </label>
          </div>

          <label>
            MESSAGE (OPTIONAL)
            <textarea
              value={form.message}
              onChange={change('message')}
              placeholder="Tell us a little about yourself, schedule, or questions..."
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
