const STALE_URLS = [
  'https://script.google.com/macros/s/AKfycbzfCLWP2niYiTNmZnwKbCYGI7emOFqoy0Kf6alS8vjgjRIL-JKPdUTG4mD1fruB1g9Y/exec',
  'https://script.google.com/macros/s/AKfycbw9N-0xSorYmFgLWP4yEvZ-Y5wWkRfeYJLwtG-RiQAOzkSIzWBgYqBfkgY7sHcYSoFP/exec'
];

const ACTIVE_CMS_URL = 'https://script.google.com/macros/s/AKfycbyLldScNulx7gY_m_JtMJqbn68pOBR6nPktm_pB5yOiXHuKhICNPh4Ju-jfrFVFfScy/exec';

const envUrl = (import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '').trim();

export const GOOGLE_APPS_SCRIPT_URL =
  (envUrl && !STALE_URLS.includes(envUrl)) ? envUrl : ACTIVE_CMS_URL;

const DEFAULT_RECAPTCHA_SITE_KEY = '6LeBsfgtAAAAAARQQmq2qacMjQ1y8jM8eg0-l128';

export const RECAPTCHA_SITE_KEY =
  (import.meta.env.VITE_RECAPTCHA_SITE_KEY || DEFAULT_RECAPTCHA_SITE_KEY).trim();

