// Texts the owner when someone opens a private pitch page (for example /mattparker).
// The page sends a beacon on load; the owner's own devices opt out with ?me=1.
const logger = require('../utils/logger');

const PAGES = new Set(['mattparker']);
const BOT_UA = /bot|crawl|spider|slurp|headless|preview|lighthouse|facebookexternalhit|whatsapp|telegram|discord|slack/i;
const REPEAT_MS = 30 * 60 * 1000; // one text per visitor per page per 30 minutes
const DAILY_CAP = 40;

const lastSeen = new Map(); // `${page}|${ip}` -> ms
let day = '';
let sentToday = 0;

function device(ua) {
  const os = /iPhone/.test(ua) ? 'iPhone'
    : /iPad/.test(ua) ? 'iPad'
    : /Android/.test(ua) ? 'Android phone'
    : /Macintosh/.test(ua) ? 'Mac'
    : /Windows/.test(ua) ? 'Windows PC'
    : /Linux/.test(ua) ? 'Linux' : 'unknown device';
  const app = /FBAN|FBAV/.test(ua) ? 'Facebook app'
    : /Instagram/.test(ua) ? 'Instagram app'
    : /GSA\//.test(ua) ? 'Google app'
    : /Edg\//.test(ua) ? 'Edge'
    : /CriOS|Chrome\//.test(ua) ? 'Chrome'
    : /Firefox|FxiOS/.test(ua) ? 'Firefox'
    : /Safari/.test(ua) ? 'Safari' : 'browser';
  return `${os}, ${app}`;
}

async function place(ip, tz) {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 2500);
    const r = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,city,region_code,country_code,connection`, { signal: ctl.signal });
    clearTimeout(t);
    const j = await r.json();
    if (j.success && j.city) {
      const where = j.country_code === 'US' ? `${j.city}, ${j.region_code}` : `${j.city}, ${j.country_code}`;
      const isp = j.connection && j.connection.isp ? ` (${j.connection.isp})` : '';
      return where + isp;
    }
  } catch (err) {
    logger.warn(`pitch visit: location lookup failed: ${err.message}`);
  }
  return tz ? `time zone ${tz}` : 'location unknown';
}

function referrer(ref) {
  if (!ref) return 'opened directly (a texted or emailed link, or typed)';
  try {
    const host = new URL(ref).hostname.replace(/^www\./, '');
    if (host === 'criton.ai') return null;
    return `came from ${host}`;
  } catch {
    return null;
  }
}

async function handler(req, res) {
  res.status(204).end();
  try {
    const body = req.body || {};
    const page = String(body.page || '');
    const ua = String(req.get('user-agent') || '');
    if (!PAGES.has(page) || BOT_UA.test(ua)) return;

    const to = (process.env.PITCH_VISIT_PHONES || '').split(',').map((p) => p.trim()).filter(Boolean);
    const { PITCH_TWILIO_ACCOUNT_SID: acct, PITCH_TWILIO_KEY_SID: keySid, PITCH_TWILIO_KEY_SECRET: keySecret, PITCH_TWILIO_FROM: from } = process.env;
    if (!to.length || !acct || !keySid || !keySecret || !from) {
      logger.warn('pitch visit: PITCH_VISIT_PHONES or PITCH_TWILIO_* settings missing');
      return;
    }

    const ip = String(req.get('cf-connecting-ip') || req.ip || '');
    const now = Date.now();
    const key = `${page}|${ip}`;
    if (now - (lastSeen.get(key) || 0) < REPEAT_MS) return;
    lastSeen.set(key, now);
    if (lastSeen.size > 2000) lastSeen.clear();

    const today = new Date().toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' });
    if (today !== day) { day = today; sentToday = 0; }
    if (sentToday >= DAILY_CAP) return;
    sentToday += 1;

    const when = new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit' });
    const where = await place(ip, String(body.tz || '').slice(0, 60));
    const how = referrer(String(body.ref || '').slice(0, 300));
    const lines = [
      `Someone opened criton.ai/${page} at ${when} PT.`,
      `Where: ${where}`,
      `Device: ${device(ua)}`,
    ];
    if (how) lines.push(`How: ${how}`);
    lines.push(`Visit ${sentToday} today.`);

    // A send-only restricted API key, separate from Criton's own Twilio account.
    const twilio = require('twilio')(keySid, keySecret, { accountSid: acct });
    for (const phone of to) {
      await twilio.messages.create({
        body: lines.join('\n'),
        from,
        to: phone.startsWith('+') ? phone : `+1${phone}`,
      });
    }
    logger.info(`pitch visit: texted for /${page}`);
  } catch (err) {
    logger.error(`pitch visit: ${err.message}`);
  }
}

module.exports = { handler, device, referrer };
