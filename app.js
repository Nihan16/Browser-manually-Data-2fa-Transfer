// ============================================================
//  app.js  —  সব ফিচারের লজিক (FB / Cookie / Insta / OTP)
// ============================================================

// ══════════════════════════════════════════════════════════════
//  ⚙️  COOKIE & INSTAGRAM SUFFIX CONFIG
//  চালু : APPEND_STAR = true  |  বন্ধ : APPEND_STAR = true
// ══════════════════════════════════════════════════════════════
const APPEND_STAR = true;

function addSuffix(text) {
  return APPEND_STAR ? text + "*" : text;
}

// ══════════════════════════════════════════════════════════════
//  ⚙️  FACEBOOK SUFFIX CONFIG — Facebook এর জন্য আলাদা suffix
//  চালু : FB_SUFFIX_ENABLED = true  |  বন্ধ : true
//  FB_SUFFIX এ যা লিখবে তাই payload এর শেষে যোগ হবে
//  example: "221762724153*"  বা  "mytext*"  বা  "*"
// ══════════════════════════════════════════════════════════════
const FB_SUFFIX_ENABLED = true;
const FB_SUFFIX = "221762724153*";  // ← শুধু এটা বদলাও

function addFbSuffix(text) {
  return FB_SUFFIX_ENABLED ? text + FB_SUFFIX : text;
}

// ══════════════════════════════════════════════════════════════
//  🎨  COLOR THEMES — নতুন color add করতে এখানে object যোগ করো
//  example: { id: "t4", color: "#FF5733", label: "#FF5733" }
// ══════════════════════════════════════════════════════════════
const COLOR_THEMES = [
  { id: "t1", color: "#FCA311", label: "#FCA311" },
  { id: "t2", color: "#7F5539", label: "#7F5539" },
  { id: "t3", color: "#0B525B", label: "#0B525B" },
  { id: "t4", color: "#008000", label: "#008000" },
];

// ══════════════════════════════════════════════════════════════
//  🔘  BUTTON VISIBILITY — true = লুকাবে, true = দেখাবে
// ══════════════════════════════════════════════════════════════
const BUTTON_VISIBILITY = {
  // 📸 Instagram
  inChangeDBtn: true,  // ✏️ Change D
  inAcdBtn:    true,   // 📥 Export ACD Column
  inAbcdBtn:   true,   // 📥 Export ABCD Column
  inClearBtn:  true,   // 🧹 Clear Sheet
  inShiftBBtn: true,    // ⬆️ Shift B

  // 🍪 Cookie
  ckXlsxBtn:   true,   // 📥 Download Cookie XLSX
  ckClearBtn:  true,   // 🧹 Clear Sheet

  // 📘 Facebook
  fbExportBtn: true,   // 📥 Export XLSX
  fbClearBtn:  true,   // 🧹 Clear Sheet
};

function applyButtonVisibility() {
  Object.entries(BUTTON_VISIBILITY).forEach(([id, visible]) => {
    const el = document.getElementById(id);
    if (el) el.style.display = visible ? "" : "none";
  });
}

// ──────────────────────────────────────────────────────────────
//  SECTION 1 — ট্যাব সুইচিং (localStorage দিয়ে active tab মনে রাখে)
// ──────────────────────────────────────────────────────────────
function initTabs() {
  const btns   = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  function activateTab(tabId) {
    btns.forEach(b => b.classList.remove("active"));
    panels.forEach(p => p.classList.remove("active"));
    const targetBtn = Array.from(btns).find(b => b.dataset.tab === tabId);
    if (targetBtn) targetBtn.classList.add("active");
    const targetPanel = document.getElementById(tabId);
    if (targetPanel) targetPanel.classList.add("active");
  }

  // Restore last active tab from localStorage
  const savedTab = localStorage.getItem("botActiveTab");
  if (savedTab && document.getElementById(savedTab)) {
    activateTab(savedTab);
  }

  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      activateTab(btn.dataset.tab);
      localStorage.setItem("botActiveTab", btn.dataset.tab);
    });
  });
}

// ──────────────────────────────────────────────────────────────
//  SECTION 2a — Dark Mode Toggle
// ──────────────────────────────────────────────────────────────
function initDarkMode() {
  const btn = document.getElementById("darkToggle");
  if (!btn) return;
  const saved = localStorage.getItem("botDark") === "1";
  if (saved) { document.body.classList.add("dark"); btn.textContent = "☀️ Light"; }

  btn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    btn.textContent = isDark ? "☀️ Light" : "🌙 Dark";
    localStorage.setItem("botDark", isDark ? "1" : "0");
  });
}

// ──────────────────────────────────────────────────────────────
//  SECTION 2b — Color Theme Modes
//  প্রতিটা color dot click করলে পুরো UI এর color mode বদলায়
//  dark mode toggle এর সাথে independent কাজ করে
// ──────────────────────────────────────────────────────────────
const ALL_THEME_CLASSES = ["theme-t1", "theme-t2", "theme-t3", "theme-t4", "theme-t5"];

function applyThemeClass(themeId) {
  // Remove all theme classes
  document.body.classList.remove(...ALL_THEME_CLASSES);
  if (themeId) document.body.classList.add("theme-" + themeId);
}

function initTheme() {
  const container = document.getElementById("themeDots");
  if (!container) return;

  const saved = localStorage.getItem("botTheme") || COLOR_THEMES[0].id;

  COLOR_THEMES.forEach(theme => {
    const btn = document.createElement("button");
    btn.className = "theme-dot" + (theme.id === saved ? " active" : "");
    btn.style.background = theme.color;
    btn.title = theme.label;
    btn.addEventListener("click", () => {
      container.querySelectorAll(".theme-dot").forEach(d => d.classList.remove("active"));
      btn.classList.add("active");
      applyThemeClass(theme.id);
      localStorage.setItem("botTheme", theme.id);
    });
    container.appendChild(btn);
  });

  // Apply saved theme on load
  applyThemeClass(saved);
}

// ──────────────────────────────────────────────────────────────
//  SECTION 3 — Toast Notification
// ──────────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg = "✅ Done!") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.style.display = "none"; }, 2200);
}

// ──────────────────────────────────────────────────────────────
//  SECTION 4 — Clipboard Copy
// ──────────────────────────────────────────────────────────────
async function copyText(text, toastMsg = "📋 Copied!") {
  if (!text) { showToast("⚠️ কিছু নেই কপি করার"); return; }
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    showToast(toastMsg);
  } catch (e) {
    showToast("❌ কপি ব্যর্থ, ম্যানুয়ালি করুন");
  }
}

// ──────────────────────────────────────────────────────────────
//  SECTION 4b — Auto Paste from Clipboard
// ──────────────────────────────────────────────────────────────
async function autoPaste(targetSelector, onSuccess, onError) {
  try {
    const text = await navigator.clipboard.readText();
    if (!text || !text.trim()) {
      showToast("⚠️ Clipboard empty");
      if (onError) onError("Clipboard empty");
      return;
    }
    const trimmed = text.trim();
    if (targetSelector) {
      const el = typeof targetSelector === "string"
        ? document.querySelector(targetSelector)
        : targetSelector;
      if (el) {
        el.value = trimmed;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
    showToast("📋 Pasted!");
    if (onSuccess) onSuccess(trimmed);
    return trimmed;
  } catch (err) {
    const msg = "⚠️ Clipboard access denied";
    showToast(msg);
    if (onError) onError(msg);
  }
}

// ──────────────────────────────────────────────────────────────
//  SECTION 5 — CSV Fetch + Parse
// ──────────────────────────────────────────────────────────────
async function fetchCsv(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return text.split(/\r?\n/).map(row => row.split(",")).filter(r => r.some(c => c.trim()));
}

function getDataRows(rows) {
  if (!rows.length) return [];
  const first = (rows[0][0] || "").trim();
  return /^\d+$/.test(first) ? rows : rows.slice(1);
}

function safeCol(row, idx) { return (row[idx] || "").trim(); }

function countDuplicates(vals) {
  const m = {};
  vals.forEach(v => { if (v) m[v] = (m[v] || 0) + 1; });
  return m;
}

// ──────────────────────────────────────────────────────────────
//  SECTION 6 — GAS HTTP Helpers
// ──────────────────────────────────────────────────────────────
async function gasGet(url, params = {}) {
  const u = new URL(url);
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  const res = await fetch(u.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function gasPost(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain; charset=utf-8" },
    body,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function gasGetJson(url, params = {}) {
  const text = await gasGet(url, params);
  return JSON.parse(text);
}

// ──────────────────────────────────────────────────────────────
//  SECTION 7 — Result Area Helpers
// ──────────────────────────────────────────────────────────────
function setResult(id, html) {
  document.getElementById(id).innerHTML = html;
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function txtHtml(text) { return esc(text); }

function busy(btnIds, on) {
  btnIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = on;
  });
}

// Send button e loading state — text বদলায় + disabled করে
function sendLoading(btnId, on) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (on) {
    btn.dataset.orig = btn.innerHTML;
    btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:.4rem"><span style="display:inline-block;width:16px;height:16px;border:2.5px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite"></span> Sending...</span>';
    btn.disabled = true;
  } else {
    if (btn.dataset.orig) btn.innerHTML = btn.dataset.orig;
    btn.disabled = false;
  }
}

// ──────────────────────────────────────────────────────────────
//  SECTION 8 — Popup Helpers
// ──────────────────────────────────────────────────────────────

// Input popup — user কে value দিতে হবে (empty হলে OK কাজ করে না)
function showPopup(msg, placeholder, onOk) {
  document.getElementById("popupMsg").textContent = msg;
  const inp = document.getElementById("popupInput");
  inp.value = "";
  inp.placeholder = placeholder;
  inp.style.display = "";
  const inp2 = document.getElementById("popupInput2");
  if (inp2) { inp2.value = ""; inp2.style.display = "none"; }
  document.getElementById("popupOverlay").style.display = "flex";
  inp.focus();

  document.getElementById("popupOk").onclick = () => {
    const val = inp.value.trim();
    if (!val) { showToast("⚠️ কিছু লিখো"); return; }
    document.getElementById("popupOverlay").style.display = "none";
    onOk(val);
  };
  document.getElementById("popupCancel").onclick = () => {
    document.getElementById("popupOverlay").style.display = "none";
  };
  inp.onkeydown = (e) => {
    if (e.key === "Enter") document.getElementById("popupOk").click();
    if (e.key === "Escape") document.getElementById("popupCancel").click();
  };
}

// Delete popup — textarea input + | (pipe) button + OK + Cancel
function showDeletePopup(msg, onOk) {
  const overlay  = document.getElementById("popupOverlay");
  const box      = overlay.querySelector(".popup-box");
  const msgEl    = document.getElementById("popupMsg");
  const inp      = document.getElementById("popupInput");
  const inp2     = document.getElementById("popupInput2");
  const btnsDiv  = overlay.querySelector(".popup-btns");
  const okBtn    = document.getElementById("popupOk");
  const cancelBtn = document.getElementById("popupCancel");

  msgEl.textContent = msg;
  inp.style.display  = "none";
  if (inp2) inp2.style.display = "none";

  // Create textarea
  const ta = document.createElement("textarea");
  ta.className   = "field popup-input";
  ta.placeholder = "username1\nusername2\n...\n অথবা pipe দিয়ে: user1|user2|user3";
  ta.rows        = 5;
  ta.style.cssText = "width:100%;border-radius:14px;resize:vertical;font-family:monospace;font-size:.85rem;";
  box.insertBefore(ta, btnsDiv);

  // Create | button
  const pipeBtn = document.createElement("button");
  pipeBtn.textContent = "| Pipe";
  pipeBtn.className   = "btn btn-outline";
  pipeBtn.style.cssText = "font-family:monospace;font-weight:800;font-size:.9rem;";
  btnsDiv.insertBefore(pipeBtn, okBtn);

  overlay.style.display = "flex";
  ta.focus();

  function cleanup() {
    overlay.style.display = "none";
    ta.remove();
    pipeBtn.remove();
    inp.style.display = "";
    okBtn.onclick    = null;
    cancelBtn.onclick = null;
    pipeBtn.onclick  = null;
    ta.onkeydown     = null;
  }

  pipeBtn.onclick = () => {
    ta.value += "|";
    ta.focus();
  };

  okBtn.onclick = () => {
    const raw = ta.value.trim();
    if (!raw) { showToast("⚠️ কিছু লিখো"); return; }
    cleanup();
    onOk(raw);
  };

  cancelBtn.onclick = () => { cleanup(); };

  ta.onkeydown = (e) => {
    if (e.key === "Escape") cancelBtn.onclick();
  };
}

// Dual-input popup — দুটো input box (Change D এর জন্য)
function showPopupDual(msg, placeholder1, placeholder2, onOk) {
  document.getElementById("popupMsg").textContent = msg;
  const inp  = document.getElementById("popupInput");
  const inp2 = document.getElementById("popupInput2");
  inp.value  = "";
  inp2.value = "";
  inp.placeholder  = placeholder1;
  inp2.placeholder = placeholder2;
  inp.style.display  = "";
  inp2.style.display = "";
  document.getElementById("popupOverlay").style.display = "flex";
  inp.focus();

  document.getElementById("popupOk").onclick = () => {
    const val1 = inp.value.trim();
    const val2 = inp2.value.trim();
    if (!val1) { showToast("⚠️ Username দাও"); return; }
    if (!val2) { showToast("⚠️ New value দাও"); return; }
    document.getElementById("popupOverlay").style.display = "none";
    inp2.style.display = "none";
    onOk(val1, val2);
  };
  document.getElementById("popupCancel").onclick = () => {
    document.getElementById("popupOverlay").style.display = "none";
    inp2.style.display = "none";
  };
  inp2.onkeydown = (e) => {
    if (e.key === "Enter") document.getElementById("popupOk").click();
    if (e.key === "Escape") document.getElementById("popupCancel").click();
  };
  inp.onkeydown = (e) => {
    if (e.key === "Enter") { inp2.focus(); }
    if (e.key === "Escape") document.getElementById("popupCancel").click();
  };
}

// Confirm popup — input ছাড়া শুধু OK/Cancel (delete confirm এর জন্য)
function showConfirmPopup(msg, onOk) {
  document.getElementById("popupMsg").textContent = msg;
  const inp = document.getElementById("popupInput");
  inp.value = "";
  inp.style.display = "none";
  const inp2 = document.getElementById("popupInput2");
  if (inp2) { inp2.value = ""; inp2.style.display = "none"; }
  document.getElementById("popupOverlay").style.display = "flex";

  document.getElementById("popupOk").onclick = () => {
    document.getElementById("popupOverlay").style.display = "none";
    inp.style.display = "";
    onOk();
  };
  document.getElementById("popupCancel").onclick = () => {
    document.getElementById("popupOverlay").style.display = "none";
    inp.style.display = "";
  };
  inp.onkeydown = null;
  document.addEventListener("keydown", function escHandler(e) {
    if (e.key === "Escape") {
      document.getElementById("popupCancel").click();
      document.removeEventListener("keydown", escHandler);
    }
    if (e.key === "Enter") {
      document.getElementById("popupOk").click();
      document.removeEventListener("keydown", escHandler);
    }
  });
}

// ──────────────────────────────────────────────────────────────
//  SECTION 9 — Response HTML Builders
// ──────────────────────────────────────────────────────────────

// FB send response — OTP as large copyable button + D column change pass button
function buildFbSendHtml(text) {
  window._fbSendTexts = window._fbSendTexts || {};
  return text.split("\n").map(line => {
    const otpM = line.match(/^(🔢 OTP[:\s]*)(\d{6})(.*)$/);
    if (otpM) {
      return esc(otpM[1]) +
        `<button class="btn-inline btn-otp-copy" onclick="copyText('${otpM[2]}','🔢 OTP Copied!')">${otpM[2]}</button>` +
        esc(otpM[3]);
    }
    // D column line — add change password button next to secret
    const dM = line.match(/^(🔑\s*D\s*:\s*)(.+)$/);
    if (dM) {
      const secret = dM[2].trim();
      const key = "fbsec_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      window._fbSendTexts[key] = secret;
      return esc(dM[1]) + esc(secret) +
        ` <button class="btn-inline btn-chg-pass" onclick="fbChangePass(window._fbSendTexts['${key}'])">🔑 Change Pass</button>`;
    }
    return esc(line);
  }).join("\n");
}

// FB D column password change via GAS
async function fbChangePass(secret) {
  showPopup("🔑 নতুন Password দাও", "New password...", async (newPass) => {
    setResult("fbResult", "⏳ Updating password...");
    try {
      const url = `https://script.google.com/macros/s/AKfycbxc4amkM20vzRkdo_zyEcxw8YjDPDC2sHoH9JK1tLwJXjPc3KsIavH4MGqzts_dv3rkjA/exec?updateval=${encodeURIComponent(secret)}&newpass=${encodeURIComponent(newPass)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setResult("fbResult", txtHtml(text || "✅ Password updated"));
    } catch(e) { setResult("fbResult", txtHtml(`❌ Error: ${e.message}`)); }
  });
}

// Cookie send response
function buildCkSendHtml(text) {
  return text.split("\n").map(line => {
    const uidLineM = line.match(/^(🆔 A \(UID\)\s*:\s*)(\d{13,16})(.*)$/);
    const dupM     = line.match(/^(.*?➜\s*)(\d{13,16})(.*)$/);
    if (uidLineM) {
      const u = uidLineM[2];
      return esc(uidLineM[1]) +
        `<button class="btn-inline btn-uid-copy" onclick="copyText('${u}','📋 UID Copied!')">${u}</button>` +
        esc(uidLineM[3]) +
        ` <button class="btn-inline btn-chg-pass" onclick="changePassword('${u}')">🔑 Change Password</button>`;
    }
    if (dupM) {
      const u = dupM[2];
      return esc(dupM[1]) +
        `<button class="btn-inline btn-uid-copy" onclick="copyText('${u}','📋 UID Copied!')">${u}</button>` +
        esc(dupM[3]);
    }
    return esc(line);
  }).join("\n");
}

// Instagram send response — OTP as large button
function buildInSendHtml(text) {
  window._inSendPassData  = window._inSendPassData  || {};
  window._inSendBValData  = window._inSendBValData  || {};
  let capturedUser = null;

  const lines = text.split("\n");

  // First pass: find the username (🆔 A line)
  for (const line of lines) {
    const userM = line.match(/^🆔 A\s*:\s*(\S+)/);
    if (userM) { capturedUser = userM[1]; break; }
  }

  return lines.map(line => {
    const otpM  = line.match(/^(🔢 OTP\s*:\s*)(\d{6})(.*)$/);
    const userM = line.match(/^(🆔 A\s*:\s*)(\S+)(.*)$/);
    const emailM = line.match(/^(📧 B\s*:\s*)(.+)$/);
    const passM = line.match(/^(🔐 C\s*:\s*)(.+)$/);
    if (otpM) {
      return esc(otpM[1]) +
        `<button class="btn-inline btn-otp-copy" onclick="copyText('${otpM[2]}','🔢 OTP Copied!')">${otpM[2]}</button>` +
        esc(otpM[3]);
    }
    if (userM) {
      const u = userM[2];
      const chgBtn = `<button class="btn-inline btn-chg-user" onclick="changeUsername('${esc(u)}')">✏️ Change Username</button>`;
      return `<div style="text-align:right;margin:0">${chgBtn}</div>` +
        esc(userM[1]) + esc(u) + esc(userM[3]);
    }
    if (emailM) {
      const currentVal = emailM[2].trim();
      const key = "inbval_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      window._inSendBValData[key] = { user: capturedUser, currentVal };
      const valBtn = `<button class="btn-inline btn-chg-user" onclick="inChangeBValue(window._inSendBValData['${key}'])">📧 Value Change</button>`;
      return `<span style="display:flex;justify-content:space-between;align-items:center">${esc(emailM[1]) + esc(currentVal)}<span>${valBtn}</span></span>`;
    }
    if (passM) {
      const key = "inpass_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      window._inSendPassData[key] = { user: capturedUser };
      return esc(passM[1]) + esc(passM[2]) +
        ` <button class="btn-inline btn-chg-pass" onclick="inChangePass(window._inSendPassData['${key}'])">🔐 Pass Change</button>`;
    }
    return esc(line);
  }).join("\n");
}

// ──────────────────────────────────────────────────────────────
//  SECTION 9b — FB View Sheet HTML Builder
//
//  Actual GAS response format:
//    📝 A Column Data List:
//    61572258427365          ← plain UID lines (no quotes)
//    ...
//    ⚠️ A Column Duplicate:
//    Row[16,17] ➜ 61573227250453 - 2 বার
//    ⚠️ D Column Duplicate:
//    Row[16,17] ➜ AZZZ EVL4 ... - 2 বার
//    📊 C Column Summary:
//    ➜ naira00k14 - 16 বার
// ──────────────────────────────────────────────────────────────
function makeCopyBtn(value, cls = "btn-uid-copy") {
  window._copyTexts = window._copyTexts || {};
  const key = "copy_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  window._copyTexts[key] = value;
  return `<button class="btn-inline ${cls}" onclick="copyText(window._copyTexts['${key}'],'📋 Copied!')">${esc(value)}</button>`;
}

// Delete button for A Column Duplicate values — click করলে row delete confirm popup আসে
function makeADupDeleteBtn(value) {
  window._delTexts = window._delTexts || {};
  const key = "del_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  window._delTexts[key] = value;
  return `<button class="btn-inline btn-dup-copy" onclick="fbADupDelete(window._delTexts['${key}'])">${esc(value)}</button>`;
}

// A Column Duplicate line — value as delete button
function buildADupLine(line) {
  const m = line.match(/^(Row\[[\d,\s]+\]\s*➜\s*)(.+?)(\s*-\s*.+)$/);
  if (m) {
    return esc(m[1]) + makeADupDeleteBtn(m[2].trim()) + esc(m[3]);
  }
  return esc(line);
}

// D Column Duplicate line — value as copy button (unchanged)
function buildDupLine(line) {
  // "Row[16,17] ➜ VALUE - 2 বার"
  const m = line.match(/^(Row\[[\d,\s]+\]\s*➜\s*)(.+?)(\s*-\s*.+)$/);
  if (m) {
    return esc(m[1]) + makeCopyBtn(m[2].trim(), "btn-dup-copy") + esc(m[3]);
  }
  return esc(line);
}

// FB A Duplicate delete — confirm popup then GAS delete request
function fbADupDelete(uid) {
  showConfirmPopup(`🗑️ এই UID এর সব row delete করবে?\n\n${uid}`, async () => {
    busy(FB_BTNS, true);
    setResult("fbResult", "⏳ Deleting...");
    try {
      const res = await gasGet(CONFIG.GAS.fb, { deletevalues: uid });
      setResult("fbResult", txtHtml(res || "✅ Deleted"));
    } catch(e) { setResult("fbResult", txtHtml(`❌ Error: ${e.message}`)); }
    busy(FB_BTNS, false);
  });
}

function buildFbViewHtml(text) {
  const lines = text.split(/\r?\n/);
  window._copyTexts = {};

  // ── Detect section headers (flexible — works with any emoji prefix) ──
  function isHeader(t, keyword) {
    return t.replace(/^[\s\u{1F000}-\u{1FFFF}\u26A0\uFE0F⚠️📝📊\s]+/u, "").toLowerCase()
              .startsWith(keyword.toLowerCase()) ||
           t.toLowerCase().includes(keyword.toLowerCase());
  }

  let section = "";
  const sectionData = {
    aData:    { header: "", lines: [] },
    aDup:     { header: "", lines: [] },
    dDup:     { header: "", lines: [] },
    cSummary: { header: "", lines: [] },
  };

  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;

    // Section header detection — order matters (check Duplicate before Data)
    if (isHeader(t, "A Column Duplicate") && !/^Row\[/i.test(t)) {
      section = "aDup"; sectionData.aDup.header = t; continue;
    }
    if (isHeader(t, "D Column Duplicate") && !/^Row\[/i.test(t)) {
      section = "dDup"; sectionData.dDup.header = t; continue;
    }
    if (isHeader(t, "C Column Summary")) {
      section = "cSummary"; sectionData.cSummary.header = t; continue;
    }
    if (isHeader(t, "A Column Data")) {
      section = "aData"; sectionData.aData.header = t; continue;
    }

    if (section) sectionData[section].lines.push(line);
  }

  // ── Extract plain-text UIDs (numeric lines) ───────────────
  const uids = sectionData.aData.lines
    .map(l => l.trim())
    .filter(l => /^\d{10,}$/.test(l));
  window._fbUids = uids;

  // ── Build HTML — user display order: cSummary → aDup → dDup → aData ──
  let html = "";

  // C Column Summary — plain text first
  if (sectionData.cSummary.header) {
    html += esc(sectionData.cSummary.header) + "\n";
    sectionData.cSummary.lines.forEach(l => { if (l.trim()) html += esc(l) + "\n"; });
    html += "\n";
  }

  // A Column Duplicate — delete button (click করলে confirm popup → GAS delete)
  if (sectionData.aDup.header) {
    html += esc(sectionData.aDup.header) + "\n";
    sectionData.aDup.lines.forEach(l => {
      const t = l.trim();
      if (t) html += buildADupLine(t) + "\n";
    });
    html += "\n";
  }

  // D Column Duplicate — shown only when GAS returns it
  if (sectionData.dDup.header) {
    html += esc(sectionData.dDup.header) + "\n";
    sectionData.dDup.lines.forEach(l => {
      const t = l.trim();
      if (t) html += buildDupLine(t) + "\n";
    });
    html += "\n";
  }

  // A Column Data List — each UID as copyable button last
  if (sectionData.aData.header) {
    html += esc(sectionData.aData.header) + "\n";
    uids.forEach(uid => { html += makeCopyBtn(uid) + "\n"; });
    html += "\n";
  }

  if (!html.trim()) {
    const fallbackUids = lines.map(l => l.trim()).filter(l => /^\d{10,}$/.test(l));
    window._fbUids = fallbackUids;
    if (fallbackUids.length) {
      return fallbackUids.map(uid => makeCopyBtn(uid)).join("\n");
    }
    return esc(text || "⚠️ কোনো data পাওয়া যায়নি");
  }

  return html.trim();
}

// Instagram View sheet builder (GAS text response)
function buildInViewHtml(text) {
  const lines = text.split(/\r?\n/);
  window._copyTexts = {};
  let section = "";
  const sectionData = {
    aData: { header: "", lines: [] },
    cSummary: { header: "", lines: [] },
    duplicate: { header: "", lines: [] },
  };

  function normalizeHeader(t) {
    return t.replace(/:$/, "").trim().toLowerCase();
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^[A-Za-z_\u0980-\u09FF][^:\n]*:$/.test(trimmed)) {
      const header = normalizeHeader(trimmed);
      if (header === "a_column_data") {
        section = "aData";
        sectionData.aData.header = trimmed;
      } else if (header === "c_summary") {
        section = "cSummary";
        sectionData.cSummary.header = trimmed;
      } else if (header.includes("dublicate") || header.includes("duplicate")) {
        section = "duplicate";
        sectionData.duplicate.header = trimmed;
      } else {
        section = "";
      }
      continue;
    }

    if (section) sectionData[section].lines.push(line);
  }

  let html = "";

  if (sectionData.cSummary.header) {
    html += esc(sectionData.cSummary.header) + "\n";
    sectionData.cSummary.lines.forEach(l => {
      const t = l.trim();
      if (t) html += esc(t) + "\n";
    });
    html += "\n";
  }

  if (sectionData.duplicate.header) {
    html += esc(sectionData.duplicate.header) + "\n";
    sectionData.duplicate.lines.forEach(l => {
      const t = l.trim();
      if (!t) return;
      const dm = t.match(/^(\[.+?\]\s*)(.+?)(\s*➜\s*.+)$/);
      html += dm
        ? esc(dm[1]) + makeCopyBtn(dm[2].trim(), "btn-dup-copy") + esc(dm[3]) + "\n"
        : esc(t) + "\n";
    });
    html += "\n";
  }

  if (sectionData.aData.header) {
    html += esc(sectionData.aData.header) + "\n";
    sectionData.aData.lines.forEach(l => {
      const t = l.trim();
      if (t) html += makeCopyBtn(t) + "\n";
    });
    html += "\n";
  }

  if (!html.trim()) {
    const fallback = lines.map(l => l.trim()).filter(Boolean);
    if (fallback.length) {
      return fallback.map(l => esc(l)).join("\n");
    }
    return "⚠️ কোনো data পাওয়া যায়নি";
  }

  return html.trim();
}

// ──────────────────────────────────────────────────────────────
//  SECTION 10 — 2FA / TOTP Generator
// ──────────────────────────────────────────────────────────────
function cleanSecret(raw) { return raw.replace(/\s+/g, "").toUpperCase(); }

function generateOTP(secret) {
  const clean = cleanSecret(secret);
  if (clean.length < 16) throw new Error("Secret too short");
  return otplib.authenticator.generate(clean);
}

// SMS text থেকে 6-digit OTP code extract করে (spaces সহ যেকোনো format)
// Example: "<#> 127 096 is your Instagram code. Don't share it. SIYRxKrru1t"
// Returns: "127096" অথবা null
function extractSmsOtp(text) {
  // digits-only groups মিলিয়ে সব numeric sequences বের করো (spaces ignore করে)
  // প্রথমে পুরো text থেকে শুধু digits নিই, তারপর 6-digit chunk খুঁজি
  const digitsOnly = text.replace(/\D/g, "");
  // যদি exactly 6 digit পাই
  if (/^\d{6}$/.test(digitsOnly)) return digitsOnly;

  // spaces-separated groups মিলিয়ে 6-digit code খুঁজি
  // e.g. "127 096" → "127096"
  const spaceGroups = text.match(/\d[\d\s]*\d/g) || [];
  for (const group of spaceGroups) {
    const joined = group.replace(/\s+/g, "");
    if (/^\d{6}$/.test(joined)) return joined;
  }

  // fallback — text এ সরাসরি 6-digit sequence আছে কিনা
  const direct = text.match(/\b\d{6}\b/);
  if (direct) return direct[0];

  return null;
}

function initOTPBox(inputId, codeId, boxId, refreshBtnId) {
  const input      = document.getElementById(inputId);
  const codeEl     = document.getElementById(codeId);
  const box        = document.getElementById(boxId);
  const refreshBtn = refreshBtnId ? document.getElementById(refreshBtnId) : null;

  // SMS-extract mode track করি
  let smsExtractMode = false;

  function update() {
    const raw     = input.value || "";
    const trimmed = raw.trim();

    if (!trimmed) {
      codeEl.textContent = "------";
      smsExtractMode = false;
      return;
    }

    // TOTP secret এ কখনো space থাকে না।
    // যদি space থাকে অথবা non-base32 character (i,j,l,o,q,u,v,w,x,y,z,<,#,>,.,!) থাকে
    // তাহলে এটা SMS message — আগে extract try করো
    const hasSpace      = /\s/.test(trimmed);
    const hasNonBase32  = /[^A-Z2-7]/i.test(trimmed.replace(/\s/g, ""));

    if (hasSpace || (hasNonBase32 && trimmed.length > 6)) {
      const extracted = extractSmsOtp(raw);
      if (extracted) {
        codeEl.textContent = extracted;
        smsExtractMode = true;
        return;
      }
    }

    smsExtractMode = false;

    // Pure 6-digit paste
    if (/^\d{6}$/.test(trimmed)) {
      codeEl.textContent = trimmed;
      smsExtractMode = true;
      return;
    }

    // TOTP secret — generate live OTP
    const s = cleanSecret(raw);
    if (s.length >= 16) {
      try { codeEl.textContent = generateOTP(s); }
      catch { codeEl.textContent = "------"; }
    } else {
      codeEl.textContent = "------";
    }
  }

  input.addEventListener("input", update);

  if (box) {
    box.addEventListener("click", async () => {
      const code = codeEl.textContent;
      if (code && code !== "------") {
        await copyText(code, "🔐 OTP Copied!");
        input.value = "";
        codeEl.textContent = "------";
        smsExtractMode = false;
      }
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => { update(); });
  }

  update();
  // SMS extract mode এ interval দরকার নেই (code static), TOTP mode এ দরকার
  setInterval(() => { if (!smsExtractMode) update(); }, 1000);
}

// ──────────────────────────────────────────────────────────────
//  SECTION 11 — XLSX Helpers
// ──────────────────────────────────────────────────────────────
function todayLabel() {
  const d = new Date();
  return `${d.getDate()}`;
}

function xlsxDownload(wb, filename) {
  XLSX.writeFile(wb, filename);
}

// ──────────────────────────────────────────────────────────────
//  SECTION 12 — FACEBOOK MODULE
// ──────────────────────────────────────────────────────────────
const FB_BTNS = ["fbViewBtn","fbDelBtn","fbExportBtn","fbClearBtn","fbSendBtn"];

async function fbViewSheet() {
  busy(FB_BTNS, true);
  setResult("fbResult", "⏳ Loading Facebook sheet...");
  try {
    // GAS endpoint e acolumn=data parameter দিয়ে request করা হচ্ছে
    // parameter name প্রয়োজনে config.js এ গিয়ে বদলাও
    const text = await gasGet(CONFIG.GAS.fb, CONFIG.FB_VIEW_PARAM);

    const html = buildFbViewHtml(text);
    setResult("fbResult", html);

    const uids = window._fbUids || [];
    document.getElementById("fbCopyAllBtn").style.display = "inline-flex";
    document.getElementById("fbCopyAllBtn").textContent   = `📋 Copy All UIDs (${uids.length})`;
  } catch(e) {
    document.getElementById("fbCopyAllBtn").style.display = "none";
    setResult("fbResult", txtHtml(`❌ Error: ${e.message}`));
  }
  busy(FB_BTNS, false);
}

async function fbDeleteRow() {
  const uid = prompt("Delete UID(s) — comma বা newline দিয়ে আলাদা করো:");
  if (!uid) return;
  busy(FB_BTNS, true);
  setResult("fbResult", "⏳ Deleting...");
  try {
    const parts = uid.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
    const res   = await gasGet(CONFIG.GAS.fb, { deletevalues: parts.join(",") });
    setResult("fbResult", txtHtml(res || "✅ Deleted"));
  } catch(e) { setResult("fbResult", txtHtml(`❌ Error: ${e.message}`)); }
  busy(FB_BTNS, false);
}

async function fbExportXlsx() {
  busy(FB_BTNS, true);
  setResult("fbResult", "⏳ Fetching FB data for XLSX export...");
  try {
    const json     = await gasGetJson(CONFIG.GAS.fb, { acd: "column" });
    const fileName = json.fileName || `Num 2fa D${todayLabel()}P.xlsx`;
    const A = json.A || [], B = json.B || [], C = json.C || [];
    const wsData = [];
    for (let i = 0; i < A.length; i++) wsData.push([A[i]||"", B[i]||"", C[i]||""]);
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    xlsxDownload(wb, fileName);
    setResult("fbResult", txtHtml(`✅ Downloaded: ${fileName}`));
    showToast("📥 FB XLSX downloaded");
  } catch(e) { setResult("fbResult", txtHtml(`❌ Error: ${e.message}`)); }
  busy(FB_BTNS, false);
}

async function fbClearSheet() {
  if (!confirm("⚠️ Clear entire FB sheet? This cannot be undone.")) return;
  busy(FB_BTNS, true);
  setResult("fbResult", "⏳ Clearing...");
  try {
    const res = await gasGet(CONFIG.GAS.fb, { clearallsheet: "" });
    setResult("fbResult", txtHtml(res || "✅ FB sheet cleared"));
  } catch(e) { setResult("fbResult", txtHtml(`❌ Error: ${e.message}`)); }
  busy(FB_BTNS, false);
}

async function fbSendData() {
  const payload = document.getElementById("fbPayload").value.trim();
  if (!payload) { alert("Data enter করো"); return; }
  busy(FB_BTNS, true);
  sendLoading("fbSendBtn", true);
  setResult("fbResult", "⏳ Sending to Facebook...");
  try {
    const res = await gasGet(CONFIG.GAS.fb, { transfer: addFbSuffix(payload) });
    setResult("fbResult", buildFbSendHtml(res || "✅ Sent"));
    document.getElementById("fbPayload").value = "";
  } catch(e) { setResult("fbResult", txtHtml(`❌ Error: ${e.message}`)); }
  busy(FB_BTNS, false);
  sendLoading("fbSendBtn", false);
}

// ──────────────────────────────────────────────────────────────
//  SECTION 13 — COOKIE MODULE
// ──────────────────────────────────────────────────────────────
const CK_BTNS = ["ckViewBtn","ckDelBtn","ckXlsxBtn","ckClearBtn","ckSendBtn"];

async function ckViewSheet() {
  busy(CK_BTNS, true);
  setResult("ckResult", "⏳ Loading Cookie sheet...");
  try {
    const rows  = await fetchCsv(CONFIG.csvUrl(CONFIG.SHEET_ID.cookie));
    const data  = getDataRows(rows);
    const aVals = data.map(r => safeCol(r, 0)).filter(Boolean);
    const bVals = data.map(r => safeCol(r, 1)).filter(Boolean);
    const dups  = Object.entries(countDuplicates(aVals)).filter(([,c])=>c>1).sort((a,b)=>b[1]-a[1]);

    let out = `🍪 Cookie Sheet — Total UIDs: ${aVals.length}\n`;
    out    += `────────────────────────────────\n`;
    if (bVals.length) {
      const bc = countDuplicates(bVals);
      out += `\n📊 B Column Summary:\n`;
      Object.entries(bc).sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(([v,c]) => out += `  ➜ ${v} — ${c} times\n`);
    }
    if (dups.length) {
      out += `\n⚠️ Duplicate UIDs:\n`;
      dups.forEach(([u,c]) => out += `  ➜ ${u} — ${c}x\n`);
    }
    out += `\n📋 All UIDs:\n`;
    aVals.forEach(u => out += `  ${u}\n`);

    window._ckUids = aVals;
    // Make duplicate UIDs copyable
    const dupSet = new Set(dups.map(([u]) => u));
    const htmlLines = out.trim().split("\n").map(line => {
      const m = line.match(/^(.*?➜\s*)(.+?)(\s+—\s+\d+x\s*)$/);
      if (m && dupSet.has(m[2].trim())) {
        return esc(m[1]) + makeCopyBtn(m[2].trim()) + esc(m[3]);
      }
      return esc(line);
    });
    setResult("ckResult", htmlLines.join("\n"));
    document.getElementById("ckCopyAllBtn").style.display = "inline-flex";
    document.getElementById("ckCopyAllBtn").textContent   = `📋 Copy All UIDs (${aVals.length})`;
  } catch(e) { setResult("ckResult", txtHtml(`❌ Error: ${e.message}`)); }
  busy(CK_BTNS, false);
}

async function ckDeleteRow() {
  const uid = prompt("Delete UID(s) — pipe | বা comma বা newline দিয়ে আলাদা করো:");
  if (!uid) return;
  busy(CK_BTNS, true);
  setResult("ckResult", "⏳ Deleting...");
  try {
    const parts = uid.split(/[\n,|]+/).map(u=>u.trim()).filter(Boolean);
    const res   = await gasGet(CONFIG.GAS.cookie, { cookierowd: parts.join("|") });
    setResult("ckResult", txtHtml(res || "✅ Deleted"));
  } catch(e) { setResult("ckResult", txtHtml(`❌ Error: ${e.message}`)); }
  busy(CK_BTNS, false);
}

async function ckDownloadXlsx() {
  busy(CK_BTNS, true);
  const url  = CONFIG.COOKIE_XLSX_URL;
  const safe = url.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  setResult("ckResult",
    `📥 Cookie XLSX Download Link:\n\n` +
    `<button class="btn-inline btn-link-copy" onclick="copyText('${safe}','🔗 Link Copied!')">${esc(url)}</button>\n\n` +
    `⬆️ উপরের link টি copy করে browser এ paste করলে file download হবে`
  );
  showToast("🔗 Download link ready — copy করো!");
  busy(CK_BTNS, false);
}

async function ckClearSheet() {
  if (!confirm("⚠️ Clear entire Cookie sheet?")) return;
  busy(CK_BTNS, true);
  setResult("ckResult", "⏳ Clearing...");
  try {
    const res = await gasGet(CONFIG.GAS.cookie, { clearsheet: "" });
    setResult("ckResult", txtHtml(res || "✅ Cookie sheet cleared"));
  } catch(e) { setResult("ckResult", txtHtml(`❌ Error: ${e.message}`)); }
  busy(CK_BTNS, false);
}

async function ckSendData() {
  const payload = document.getElementById("ckPayload").value.trim();
  if (!payload) { alert("Cookie data enter করো"); return; }
  busy(CK_BTNS, true);
  sendLoading("ckSendBtn", true);
  setResult("ckResult", "⏳ Sending cookie data...");
  try {
    const res = await gasPost(CONFIG.GAS.cookie, addSuffix(payload));
    setResult("ckResult", buildCkSendHtml(res || "✅ Sent"));
    document.getElementById("ckPayload").value = "";
  } catch(e) { setResult("ckResult", txtHtml(`❌ Error: ${e.message}`)); }
  busy(CK_BTNS, false);
  sendLoading("ckSendBtn", false);
}

async function changePassword(uid) {
  showPopup(`🔑 UID: ${uid}\nনতুন পাসওয়ার্ড দাও`, "New password...", async (newPass) => {
    busy(CK_BTNS, true);
    setResult("ckResult", "⏳ Updating password...");
    try {
      const res = await gasGet(CONFIG.GAS.cookie, { update: `${uid}|${newPass}` });
      setResult("ckResult", txtHtml(res || "✅ Password updated"));
    } catch(e) { setResult("ckResult", txtHtml(`❌ Error: ${e.message}`)); }
    busy(CK_BTNS, false);
  });
}

// ──────────────────────────────────────────────────────────────
//  SECTION 14 — INSTAGRAM MODULE
// ──────────────────────────────────────────────────────────────
const IN_BTNS = ["inViewBtn","inDelBtn","inChangeDBtn","inAcdBtn","inAbcdBtn","inClearBtn","inSendBtn","inShiftBBtn"];

async function inViewSheet() {
  busy(IN_BTNS, true);
  setResult("inResult", "⏳ Loading Instagram sheet...");
  try {
    const text = await gasGet(CONFIG.GAS.insta, { sheetinsta: "ac" });
    const html = buildInViewHtml(text);
    setResult("inResult", html);

    const lines = text.split(/\r?\n/);
    let inA = false;
    const users = [];
    for (const line of lines) {
      const t = line.trim();
      if (t === "A_Column_Data:") { inA = true; continue; }
      if (inA) {
        if (!t || /^[A-Za-z_][^:\n]*:$/.test(t)) { inA = false; continue; }
        if (!t.includes("➜") && !t.includes(":")) users.push(t);
      }
    }
    window._inUsers = users;
    document.getElementById("inCopyAllBtn").style.display = "inline-flex";
    document.getElementById("inCopyAllBtn").textContent   = `📋 Copy All (${users.length})`;
  } catch(e) { setResult("inResult", txtHtml(`❌ Error: ${e.message}`)); }
  busy(IN_BTNS, false);
}

async function inDeleteRow() {
  showDeletePopup("🗑️ Delete করার username(s) দাও\n(new line অথবা | pipe দিয়ে আলাদা করো)", async (raw) => {
    const parts = raw.split(/[\n|,]+/).map(u => u.trim()).filter(Boolean);
    if (!parts.length) { showToast("⚠️ কিছু নেই"); return; }
    busy(IN_BTNS, true);
    setResult("inResult", "⏳ Deleting...");
    try {
      const res = await gasGet(CONFIG.GAS.insta, { rowdelete: parts.join(",") });
      setResult("inResult", txtHtml(res || "✅ Deleted"));
    } catch(e) { setResult("inResult", txtHtml(`❌ Error: ${e.message}`)); }
    busy(IN_BTNS, false);
  });
}

async function inExportXlsx(style) {
  busy(IN_BTNS, true);
  setResult("inResult", `⏳ Fetching data for ${style} export...`);
  try {
    const param = style === "ACD" ? { acd: "" } : { abcd: "" };
    const json  = await gasGetJson(CONFIG.GAS.insta, param);
    const filename = json.filename || `Insta 2fa-${todayLabel()}D.xlsx`;
    const data     = json.data || [];

    const wsData = data.map(row =>
      style === "ACD"
        ? [row.A_Column||"", row.B_Column||"", row.C_Column||""]
        : [row.A||"", row.B||"", row.C||"", row.D||""]
    );

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    xlsxDownload(wb, filename);
    setResult("inResult", txtHtml(`✅ Downloaded: ${filename} [${style}]`));
    showToast(`📥 Insta ${style} XLSX downloaded`);
  } catch(e) { setResult("inResult", txtHtml(`❌ Error: ${e.message}`)); }
  busy(IN_BTNS, false);
}

async function inClearSheet() {
  if (!confirm("⚠️ Clear entire Instagram sheet?")) return;
  busy(IN_BTNS, true);
  setResult("inResult", "⏳ Clearing...");
  try {
    const res = await gasGet(CONFIG.GAS.insta, { clearsheet: "" });
    setResult("inResult", txtHtml(res || "✅ Instagram sheet cleared"));
  } catch(e) { setResult("inResult", txtHtml(`❌ Error: ${e.message}`)); }
  busy(IN_BTNS, false);
}

async function inSendData() {
  const payload = document.getElementById("inPayload").value.trim();
  if (!payload) { alert("Data enter করো"); return; }
  busy(IN_BTNS, true);
  sendLoading("inSendBtn", true);
  setResult("inResult", "⏳ Sending to Instagram...");
  try {
    const res = await gasGet(CONFIG.GAS.insta, { send: addSuffix(payload) });
    setResult("inResult", buildInSendHtml(res || "✅ Sent"));
    document.getElementById("inPayload").value = "";
  } catch(e) { setResult("inResult", txtHtml(`❌ Error: ${e.message}`)); }
  busy(IN_BTNS, false);
  sendLoading("inSendBtn", false);
}

async function changeUsername(oldUser) {
  showPopup(`✏️ Username: ${oldUser}\nনতুন username দাও`, "New username...", async (newUser) => {
    busy(IN_BTNS, true);
    setResult("inResult", "⏳ Changing username...");
    try {
      const res = await gasGet(CONFIG.GAS.insta, { valchange: `${oldUser}|${newUser}` });
      setResult("inResult", txtHtml(res || "✅ Username changed"));
    } catch(e) { setResult("inResult", txtHtml(`❌ Error: ${e.message}`)); }
    busy(IN_BTNS, false);
  });
}

async function inChangeDColumn() {
  showPopupDual(
    "✏️ D Column Change\nA column এর username ও নতুন D value দাও",
    "A column username...",
    "New D value...",
    async (username, newVal) => {
      busy(IN_BTNS, true);
      setResult("inResult", "⏳ Updating D column...");
      try {
        const param = `${username}|${newVal}`;
        const res = await gasGet(CONFIG.GAS.insta, { achanged: param });
        setResult("inResult", txtHtml(res || "✅ D column updated"));
      } catch(e) { setResult("inResult", txtHtml(`❌ Error: ${e.message}`)); }
      busy(IN_BTNS, false);
    }
  );
}

async function inChangePass(data) {
  const user = data && data.user ? data.user : null;
  if (!user) { showToast("⚠️ Username পাওয়া যায়নি"); return; }
  showPopup(`🔐 নতুন Password দাও\n(User: ${user})`, "New password...", async (newPass) => {
    busy(IN_BTNS, true);
    setResult("inResult", "⏳ Updating password...");
    try {
      const param = `${user}|${newPass}`;
      const res = await gasGet(CONFIG.GAS.insta, { cchanged: param });
      setResult("inResult", txtHtml(res || "✅ Password updated"));
    } catch(e) { setResult("inResult", txtHtml(`❌ Error: ${e.message}`)); }
    busy(IN_BTNS, false);
  });
}

async function inChangeBValue(data) {
  const user = data && data.user ? data.user : null;
  if (!user) { showToast("⚠️ Username পাওয়া যায়নি"); return; }
  showPopup(`📧 নতুন B Value দাও\n(User: ${user})`, "New value...", async (newVal) => {
    busy(IN_BTNS, true);
    setResult("inResult", "⏳ Updating B value...");
    try {
      const param = `${user}|${newVal}`;
      const res = await gasGet(CONFIG.GAS.insta, { bchanged: param });
      setResult("inResult", txtHtml(res || "✅ B value updated"));
    } catch(e) { setResult("inResult", txtHtml(`❌ Error: ${e.message}`)); }
    busy(IN_BTNS, false);
  });
}

async function inShiftB() {
  busy(IN_BTNS, true);
  setResult("inResult", "⏳ Shift B request পাঠানো হচ্ছে...");
  try {
    const res = await gasGet(CONFIG.GAS.insta, { shiftbcolumn: "" });
    setResult("inResult", txtHtml(res || "✅ Shift B done"));
  } catch(e) { setResult("inResult", txtHtml(`❌ Error: ${e.message}`)); }
  busy(IN_BTNS, false);
}

// ──────────────────────────────────────────────────────────────
//  SECTION 15 — INIT (page load)
// ──────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

  initTabs();
  initDarkMode();
  initTheme();
  applyButtonVisibility();

  // OTP generators
  initOTPBox("fbSecret", "fbOtpCode", "fbOtpBox", "fbOtpRefresh");
  initOTPBox("inSecret", "inOtpCode", "inOtpBox", "inOtpRefresh");

  // ── FB buttons
  document.getElementById("fbViewBtn").addEventListener("click",   fbViewSheet);
  document.getElementById("fbDelBtn").addEventListener("click",    fbDeleteRow);
  document.getElementById("fbExportBtn").addEventListener("click", fbExportXlsx);
  document.getElementById("fbClearBtn").addEventListener("click",  fbClearSheet);
  document.getElementById("fbSendBtn").addEventListener("click",   fbSendData);
  document.getElementById("fbCopyAllBtn").addEventListener("click",
    () => copyText((window._fbUids || []).join("\n"), "📋 All UIDs copied!"));

  // ── Cookie buttons
  document.getElementById("ckViewBtn").addEventListener("click",   ckViewSheet);
  document.getElementById("ckDelBtn").addEventListener("click",    ckDeleteRow);
  document.getElementById("ckXlsxBtn").addEventListener("click",  ckDownloadXlsx);
  document.getElementById("ckClearBtn").addEventListener("click",  ckClearSheet);
  document.getElementById("ckSendBtn").addEventListener("click",   ckSendData);
  document.getElementById("ckCopyAllBtn").addEventListener("click",
    () => copyText((window._ckUids || []).join("\n"), "📋 All UIDs copied!"));

  // ── Instagram buttons
  document.getElementById("inViewBtn").addEventListener("click",    inViewSheet);
  document.getElementById("inDelBtn").addEventListener("click",     inDeleteRow);
  document.getElementById("inChangeDBtn").addEventListener("click", inChangeDColumn);
  document.getElementById("inAcdBtn").addEventListener("click",     () => inExportXlsx("ACD"));
  document.getElementById("inAbcdBtn").addEventListener("click",    () => inExportXlsx("ABCD"));
  document.getElementById("inClearBtn").addEventListener("click",   inClearSheet);
  document.getElementById("inSendBtn").addEventListener("click",    inSendData);
  document.getElementById("inShiftBBtn").addEventListener("click",  inShiftB);
  document.getElementById("inCopyAllBtn").addEventListener("click",
    () => copyText((window._inUsers || []).join("\n"), "📋 All usernames copied!"));
});
