// Kamra PMS client for CTA BIMYNS (public booking engine + staff APIs).
// Endpoints live on the Frappe site (default http://localhost:8080).
import { store } from './store.js';

function cfg() {
  return store.state.erpConfig || {};
}

function base() {
  // Prefer same-origin /api (Vite proxy → :8080) to avoid CORS; fall back to configured URL.
  const configured = (cfg().baseUrl || '').replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location.port === '5173') {
    return '';
  }
  return configured || 'http://localhost:8080';
}

function authHeaders() {
  const { apiKey, apiSecret } = cfg();
  const h = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (apiKey && apiSecret) {
    h.Authorization = `token ${apiKey}:${apiSecret}`;
  }
  return h;
}

async function callMethod(method, params = {}, { post = false } = {}) {
  const url = new URL(`${base()}/api/method/${method}`);
  const opts = { method: post ? 'POST' : 'GET', headers: authHeaders(), credentials: 'omit' };

  if (post) {
    opts.body = JSON.stringify(params);
  } else {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    });
  }

  store.logErpMessage(`${opts.method} ${url.pathname}${url.search}`, 'info');
  const res = await fetch(url.toString(), opts);
  const raw = await res.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Réponse non-JSON (${res.status}): ${raw.slice(0, 200)}`);
  }
  if (!res.ok || data.exc) {
    const msg = data._server_messages
      ? JSON.parse(JSON.parse(data._server_messages)[0]).message
      : data.exception || data.message || res.statusText;
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return data.message ?? data;
}

export class KamraService {
  /** Public catalog (/book entry). */
  static catalogIndex() {
    return callMethod('kamra.public_api.catalog_index');
  }

  static defaultProperty() {
    return callMethod('kamra.public_api.default_property');
  }

  static showcase(property, listing_slug) {
    return callMethod('kamra.public_api.showcase', { property, listing_slug });
  }

  /**
   * Guest booking — maps a BIMYNS room cart line to kamra.public_api.book.
   * Requires a Property + Room Type already set up in Kamra.
   */
  /** Map BIMYNS cart codes (bb/hb) or short CP/MAP → Meal Plan Link name. */
  static resolveMealPlan(property, mealPlan) {
    if (!mealPlan) return '';
    const raw = String(mealPlan).trim();
    const CODE = { bb: 'CP', BB: 'CP', hb: 'MAP', HB: 'MAP', CP: 'CP', MAP: 'MAP' };
    const code = CODE[raw] || (raw.includes('-') ? raw.split('-').pop() : raw);
    if (!code) return '';
    if (raw.startsWith(`${property}-`)) return raw;
    return `${property}-${code}`;
  }

  static async bookRoom({
    property,
    roomType,
    checkIn,
    checkOut,
    guestName,
    phone,
    email = '',
    adults = 2,
    children = 0,
    mealPlan = '',
    specialRequests = '',
  }) {
    const payload = {
      property,
      room_type: roomType,
      check_in_date: checkIn,
      check_out_date: checkOut,
      guest_name: guestName,
      phone,
      email,
      adults,
      children,
      meal_plan: KamraService.resolveMealPlan(property, mealPlan),
      special_requests: specialRequests,
      idempotency_key: `bimyns-${Date.now()}`,
    };
    store.setLastErpPayload(payload);
    if (cfg().autoSendMock) {
      await new Promise((r) => setTimeout(r, 600));
      const mock = {
        reservation: `RES-MOCK-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Confirmed',
        amount_after_tax: 0,
        mock: true,
      };
      store.logErpMessage(`[MOCK] Réservation Kamra ${mock.reservation}`, 'success', mock);
      store.setLastErpPayload(payload, mock);
      return { success: true, data: mock, isMock: true };
    }
    try {
      const data = await callMethod('kamra.public_api.book', payload, { post: true });
      store.logErpMessage(`[Kamra OK] ${data.reservation || data.name}`, 'success', data);
      store.setLastErpPayload(payload, data);
      return { success: true, data, isMock: false };
    } catch (err) {
      store.logErpMessage(`[Kamra] ${err.message}`, 'error', { error: err.message });
      return { success: false, error: err.message, payload };
    }
  }

  /** Staff quote (needs API key with Front Desk / Kamra Agent). */
  static getQuote(params) {
    return callMethod('kamra.api.get_quote', params);
  }
}
