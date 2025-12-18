const tg = window.Telegram?.WebApp;
try { tg?.ready(); } catch {}

const $ = id => document.getElementById(id);

// ===== ТЕКСТЫ =====
const TEXT = {
  en: {
    title: "💸 Tip Splitter",
    bill: "Bill amount",
    people: "People",
    tip: "Tip (%)",
    calc: "Calculate",
    result: (v) => `Each person pays: ${v}`
  },
  ru: {
    title: "💸 Калькулятор чаевых",
    bill: "Сумма счёта",
    people: "Количество людей",
    tip: "Чаевые (%)",
    calc: "Посчитать",
    result: (v) => `С каждого: ${v}`
  }
};

// ===== ЯЗЫК =====
let lang = localStorage.getItem("lang") || "en";

function applyLang() {
  const t = TEXT[lang];
  $("title").innerText = t.title;
  $("billLabel").innerText = t.bill;
  $("peopleLabel").innerText = t.people;
  $("tipLabel").innerText = t.tip;
  $("calcBtn").innerText = t.calc;
}

$("lang").value = lang;
$("lang").onchange = () => {
  lang = $("lang").value;
  localStorage.setItem("lang", lang);
  applyLang();
  calc();
};

// ===== ЛОГИКА =====
function calc() {
  const bill = Number($("bill").value);
  const people = Math.max(1, Number($("people").value));
  const tip = Number($("tip").value);

  const total = bill + bill * tip / 100;
  const each = (total / people).toFixed(2);

  $("result").innerText = TEXT[lang].result(each);
}

// INIT
applyLang();
calc();
