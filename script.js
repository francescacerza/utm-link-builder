"use strict";

const FIELDS = ["source", "medium", "campaign", "term", "content"];
const REQUIRED = ["source", "medium", "campaign"];
const HISTORY_KEY = "utm-link-builder-history";
const HISTORY_MAX = 10;

function cleanValue(value) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

/**
 * Build a URL with UTM parameters.
 * Keeps existing query parameters and the #fragment, overwrites existing utm_* values.
 * Returns { url } on success or { error } on invalid input.
 */
function buildUtmUrl(rawUrl, values, options = {}) {
  const { clean = true } = options;

  let input = (rawUrl || "").trim();
  if (!input) return { error: "Enter a website URL." };
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(input)) input = "https://" + input;

  let url;
  try {
    url = new URL(input);
  } catch (e) {
    return { error: "This URL is not valid." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { error: "Only http and https URLs are supported." };
  }
  if (!url.hostname.includes(".")) {
    return { error: "This URL is not valid (missing domain)." };
  }

  for (const field of REQUIRED) {
    if (!values[field] || !values[field].trim()) {
      return { error: "utm_" + field + " is required." };
    }
  }

  for (const field of FIELDS) {
    const raw = (values[field] || "").trim();
    if (raw) {
      url.searchParams.set("utm_" + field, clean ? cleanValue(raw) : raw);
    } else {
      url.searchParams.delete("utm_" + field);
    }
  }

  return { url: url.toString() };
}

/* ---------- Browser UI ---------- */

function readHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function writeHistory(list) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch (e) {
    /* storage unavailable: history is a convenience only */
  }
}

function initUI() {
  const form = document.getElementById("utm-form");
  const errorEl = document.getElementById("error");
  const resultEl = document.getElementById("result");
  const outputEl = document.getElementById("output");
  const copyBtn = document.getElementById("copy");
  const copiedEl = document.getElementById("copied");
  const cleanEl = document.getElementById("normalize");
  const historySection = document.getElementById("history-section");
  const historyEl = document.getElementById("history");
  const clearHistoryBtn = document.getElementById("clear-history");

  async function copyText(text, onDone) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    onDone();
  }

  function flashCopied() {
    copiedEl.hidden = false;
    setTimeout(function () { copiedEl.hidden = true; }, 1500);
  }

  function renderHistory() {
    const list = readHistory();
    historyEl.innerHTML = "";
    historySection.hidden = list.length === 0;
    list.forEach(function (link) {
      const li = document.createElement("li");
      const code = document.createElement("code");
      code.textContent = link;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Copy";
      btn.addEventListener("click", function () {
        copyText(link, function () { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = "Copy"; }, 1200); });
      });
      li.append(code, btn);
      historyEl.appendChild(li);
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const values = {};
    FIELDS.forEach(function (f) { values[f] = form.elements[f].value; });

    const result = buildUtmUrl(form.elements.url.value, values, { clean: cleanEl.checked });

    if (result.error) {
      errorEl.textContent = result.error;
      errorEl.hidden = false;
      resultEl.hidden = true;
      return;
    }

    errorEl.hidden = true;
    outputEl.value = result.url;
    resultEl.hidden = false;

    const history = readHistory().filter(function (l) { return l !== result.url; });
    history.unshift(result.url);
    writeHistory(history.slice(0, HISTORY_MAX));
    renderHistory();
  });

  form.addEventListener("reset", function () {
    errorEl.hidden = true;
    resultEl.hidden = true;
  });

  copyBtn.addEventListener("click", function () {
    copyText(outputEl.value, flashCopied);
  });

  clearHistoryBtn.addEventListener("click", function () {
    writeHistory([]);
    renderHistory();
  });

  renderHistory();
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initUI);
}

if (typeof module !== "undefined") {
  module.exports = { buildUtmUrl, cleanValue };
}
