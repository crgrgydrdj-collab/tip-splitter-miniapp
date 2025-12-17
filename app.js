import { CONFIG } from "./config.js";

const tg = window.Telegram?.WebApp;
try { tg?.ready(); tg?.expand(); } catch {}

const $ = (id) => document.getElementById(id);

let state = {
  pro: localStorage.getItem("TS_PRO") === "1",
  rates: null, // {USD:1, EUR:x, RUB:y, USDT:1}
};

// ====== Rates (без серверов: берём публичные курсы, кешируем) ======
async function loadRates() {
  // 1) кеш
  try {
    const raw = localStorage.getItem("TS_RATES_CACHE");
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached?.rates) {
        setRatesHint(`Rates: cached • ${new Date(cached.ts).toLocaleString()}`);
        return cached.rates;
      }
    }
  } catch {}

  // 2) запрос (Frankfurter)
  try {
    const r = await fetch("https://api.frankfurter.app/latest?from=USD&to=EUR,RUB", { cache: "no-store" });
    const data = await r.json();
    const rates = { USD: 1, EUR: data.rates.EUR, RUB: data.rates.RUB, USDT: 1 }; // USDT = USD 1:1
    localStorage.setItem("TS_RATES_CACHE", JSON.stringify({ rates, ts: Date.now() }));
    setRatesHint(`Rates: updated • ${new Date().toLocaleString()}`);
    return rates;
  } catch {
    setRatesHint("Rates: offline fallback");
    return { USD: 1, EUR: 1, RUB: 1, USDT: 1 };
  }
}

function setRatesHint(text) {
  const el = $("ratesHint");
  if (el) el.textContent = text;
}

// convert amount in FROM -> TO (через USD)
function convert(amount, from, to) {
  const rFrom = state.rates?.[from];
  const rTo = state.rates?.[to];
  if (!rFrom || !rTo) return NaN;
  const usd = amount / rFrom;      // FROM -> USD
  return usd * rTo;                // USD -> TO
}

function parseNum(v) {
  const s = String(v ?? "").trim().replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function fmt(n, ccy) {
  if (!Number.isFinite(n)) return "—";
  const currency = ccy === "USDT" ? "USD" : ccy;
  const maxFrac = ccy === "RUB" ? 0 : 2;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: maxFrac,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${ccy}`;
  }
}

// ====== PRO: округление ======
function applyRounding(value, mode) {
  // mode: "none" | "up_050" | "up_100"
  if (!Number.isFinite(value)) return value;
  if (mode === "none") return value;

  if (mode === "up_050") {
    return Math.ceil(value * 2) / 2; // вверх до 0.50
  }
  if (mode === "up_100") {
    return Math.ceil(value); // вверх до целого
  }
  return value;
}

function setPro(on) {
  state.pro = !!on;
  if (state.pro) localStorage.setItem("TS_PRO", "1");
  else localStorage.removeItem("TS_PRO");

  $("proBadge").textContent = state.pro ? "PRO: ON" : "PRO: OFF";
  $("proBox").style.display = state.pro ? "block" : "none";
  $("unlockBox").style.display = state.pro ? "none" : "block";

  calc();
}

function unlockPro() {
  const code = ($("promo").value || "").trim().toUpperCase();
  if (!code) return show("Enter promo code");

  const ok = CONFIG.PROMO_CODES.includes(code);
  if (!ok) return show("Wrong promo code");

  show("PRO enabled ✅");
  setPro(true);
}

function openSellerChat() {
  const text = `Hi! I want Tip Splitter PRO (${CONFIG.PRO_PRICE_TEXT}). How can I pay?`;
  const url = `https://t.me/${CONFIG.SELLER_USERNAME}?text=${encodeURIComponent(text)}`;

  if (tg?.openTelegramLink) tg.openTelegramLink(url);
  else window.location.href = url;
}

function show(msg) {
  if (tg?.showAlert) tg.showAlert(msg);
  else alert(msg);
}

// ====== Calculate ======
function calc() {
  const bill = parseNum($("bill").value);
  const tipPct = parseNum($("tip").value);
  const people = Math.max(1, Math.floor(parseNum($("people").value) || 1));
  const ccy = $("ccy").value;

  if (!Number.isFinite(bill) || bill < 0 || !Number.isFinite(tipPct) || tipPct < 0) {
    $("out").textContent = "—";
    $("list").innerHTML = "";
    return;
  }

  const tip = bill * (tipPct / 100);
  const total = bill + tip;
  let each = total / people;

  // PRO rounding
  if (state.pro) {
    const mode = $("round").value;       // none / up_050 / up_100
    each = applyRounding(each, mode);
  }

  $("out").textContent = `${fmt(each, ccy)} per person`;

  // показываем в разных валютах (Basic тоже)
  $("list").innerHTML = CONFIG.CURRENCIES.map(x => {
    const eachX = convert(each, ccy, x);
    return `
      <div class="rowItem">
        <div><b>${x}</b></div>
        <div class="val">${fmt(eachX, x)}</div>
      </div>
    `;
  }).join("");
}

// ===== init =====
(async function main() {
  // currency selector
  $("ccy").innerHTML = CONFIG.CURRENCIES.map(c => `<option value="${c}" ${c===CONFIG.DEFAULT_CCY?"selected":""}>${c}</option>`).join("");

  // events
  $("calcBtn").addEventListener("click", calc);
  ["bill","tip","people","ccy"].forEach(id => $(id).addEventListener("input", calc));

  $("unlockBtn").addEventListener("click", unlockPro);
  $("getProBtn").addEventListener("click", openSellerChat);
  $("proOffBtn").addEventListener("click", () => setPro(false));
  $("round").addEventListener("change", calc);

  // rates
  state.rates = await loadRates();

  // pro status
  setPro(state.pro);

  // first calc
  calc();
})();
