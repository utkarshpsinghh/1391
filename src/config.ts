const STALE_URLS = [
  'https://script.google.com/macros/s/AKfycbzfCLWP2niYiTNmZnwKbCYGI7emOFqoy0Kf6alS8vjgjRIL-JKPdUTG4mD1fruB1g9Y/exec',
  'https://script.google.com/macros/s/AKfycbw9N-0xSorYmFgLWP4yEvZ-Y5wWkRfeYJLwtG-RiQAOzkSIzWBgYqBfkgY7sHcYSoFP/exec',
  'https://script.google.com/macros/s/AKfycbyLldScNulx7gY_m_JtMJqbn68pOBR6nPktm_pB5yOiXHuKhICNPh4Ju-jfrFVFfScy/exec'
];

const ACTIVE_CMS_URL = 'https://script.google.com/macros/s/AKfycbwTEELh5cZjPW2Eqe6CIFoLOweNKwvI0d0Oma_2BtffswrLzbgHCfR6Fzm776nuhF5n/exec';

const envUrl = (import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '').trim();

export const GOOGLE_APPS_SCRIPT_URL =
  (envUrl && !STALE_URLS.includes(envUrl)) ? envUrl : ACTIVE_CMS_URL;

// Vercel Serverless proxy routes (URL completely hidden from browser network tab)
export const CMS_API_ENDPOINT = '/api/cms';
export const APPLY_API_ENDPOINT = '/api/apply';

const DEFAULT_RECAPTCHA_SITE_KEY = '6LeBsfgtAAAAACCwrgTjKXZu-jSPc2RiYu22uCqV';

export const RECAPTCHA_SITE_KEY =
  (import.meta.env.VITE_RECAPTCHA_SITE_KEY || DEFAULT_RECAPTCHA_SITE_KEY).trim();
