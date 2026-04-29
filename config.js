// ============================================================
//  config.js  —  সব URL, Sheet ID এখানে বদলাও
// ============================================================

const CONFIG = {

  // ── Google Apps Script Endpoints ────────────────────────
  GAS: {
    fb:     "https://script.google.com/macros/s/AKfycbxc4amkM20vzRkdo_zyEcxw8YjDPDC2sHoH9JK1tLwJXjPc3KsIavH4MGqzts_dv3rkjA/exec",
    cookie: "https://script.google.com/macros/s/AKfycbxJbivZ79Wn3xOkT7AKOFJdv42UEEQN9YdAf7n24752AX_j4Gyqe5JrXDtCVnVFp0p3/exec",
    insta:  "https://script.google.com/macros/s/AKfycbyhlsZ3oqZK9sb2oP6VcKJJ5pRZQL45e47ozqxsXd8dWHezHrc08GZvsCvVzts_Hdia/exec",
  },

  // ── FB View Sheet GAS Parameter ──────────────────────────
  // View Sheet button এ click করলে FB GAS এ এই parameter দিয়ে request যাবে
  // GAS link format: ?acolumn=data
  FB_VIEW_PARAM: { acolumn: "data" },

  // ── Google Spreadsheet IDs ───────────────────────────────
  SHEET_ID: {
    fb:     "1SxaSVn4TzIekLfYNcWOlDPoT14jHq6tNsKNroHXzfQ4",
    cookie: "1hNXicnwanBkE0x8WK1jjxYwL8W9sw8te7IsmwZ7dh1o",
    insta:  "15dvrwOhtmUIIuCaq5ccxYROGSjK3wN2o4ttVLw8H6e4",
  },

  // ── Derived URLs (পরিবর্তন করতে হবে না) ─────────────────
  get COOKIE_XLSX_URL() {
    return `https://docs.google.com/spreadsheets/d/${this.SHEET_ID.cookie}/export?format=xlsx`;
  },
  get INSTA_TSV_URL() {
    return `https://docs.google.com/spreadsheets/d/${this.SHEET_ID.insta}/export?format=tsv`;
  },
  csvUrl(id) {
    return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
  },
};
