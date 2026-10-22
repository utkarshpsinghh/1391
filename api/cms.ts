export default async function handler(req: any, res: any) {
  const SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycbwTEELh5cZjPW2Eqe6CIFoLOweNKwvI0d0Oma_2BtffswrLzbgHCfR6Fzm776nuhF5n/exec';

  try {
    const separator = SCRIPT_URL.includes('?') ? '&' : '?';
    const target = `${SCRIPT_URL}${separator}t=${Date.now()}`;
    const response = await fetch(target, { redirect: 'follow' });
    const data = await response.json();

    // Cache on Vercel Edge Network for 60 seconds to optimize speed
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=180');
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}
