// app.js
// Author: Jermaine Wiggins
// Date:   2025
// Purpose: Entry point. Holds shared state and coordinates the other modules.
//          Swap config.js to use this dashboard with a different project.

// ── Shared State ──────────────────────────────────────────────────────────────

let allData      = [];    // Full dataset returned from the API.
let filteredData = [];    // Data after table filters are applied.
let currentPage  = 1;     // Which page of the table is showing.
let sortCol      = -1;    // Which column is sorted (-1 = none).
let sortAsc      = true;  // Sort direction.
let selectedRow  = 0;     // Which row is currently selected.

const PAGE_SIZE  = 10;    // Rows per page.

// ── Init ──────────────────────────────────────────────────────────────────────

// Builds everything from CONFIG once the page loads.
document.addEventListener("DOMContentLoaded", () => {
  applyConfig();
  buildTableHead();
  buildFilterDropdowns();
  buildRescueFilter();
  buildAddForm();
  loadStats();
  loadData({});
});

// ── Config ────────────────────────────────────────────────────────────────────

// Fills in all the empty placeholders in index.html from CONFIG.
function applyConfig() {
  document.getElementById("page-title").textContent      = CONFIG.title;
  document.getElementById("header-logo").textContent     = CONFIG.logo;
  document.getElementById("header-title").textContent    = CONFIG.title;
  document.getElementById("header-subtitle").textContent = CONFIG.subtitle;
  document.getElementById("header-author").textContent   = CONFIG.author;
  document.getElementById("chart-title").textContent     = CONFIG.chart.title;
  document.getElementById("table-title").textContent     = CONFIG.tableTitle;
  document.getElementById("map-title").textContent       = CONFIG.map.title;
  document.getElementById("add-title").textContent       = CONFIG.addTitle;
  document.getElementById("add-subtitle").textContent    = CONFIG.addSubtitle;
  document.getElementById("add-form-title").textContent  = CONFIG.addTitle;
  document.getElementById("delete-title").textContent    = CONFIG.deleteTitle;
  document.getElementById("delete-subtitle").textContent = CONFIG.deleteSubtitle;
  document.getElementById("add-toast").textContent       = CONFIG.messages.addSuccess;
  document.getElementById("add-error").textContent       = CONFIG.messages.addError;
  document.getElementById("delete-toast").textContent    = CONFIG.messages.deleteSuccess;

  // Build nav buttons from CONFIG.nav.
  const nav = document.getElementById("main-nav");
  CONFIG.nav.forEach((item, i) => {
    const btn       = document.createElement("button");
    btn.className   = "nav-btn" + (i === 0 ? " active" : "");
    btn.textContent = item.label;
    btn.onclick     = () => showView(item.view, btn);
    nav.appendChild(btn);
  });
}

// ── Data Loading ──────────────────────────────────────────────────────────────

// Fetches total, dog, and cat counts and updates the stats bar.
async function loadStats() {
  try {
    const data = await api.getStats();
    document.getElementById("stat-total").textContent = data.total.toLocaleString();
    document.getElementById("stat-dogs").textContent  = data.dogs.toLocaleString();
    document.getElementById("stat-cats").textContent  = data.cats.toLocaleString();
  } catch (e) {
    console.error("Failed to load stats:", e);
  }
}

// Fetches animals matching the query and times the request.
async function loadData(query) {
  document.getElementById("table-body").innerHTML =
    `<tr><td colspan="${CONFIG.columns.length}" class="loading">Loading...</td></tr>`;

  const start = performance.now();

  try {
    allData = await api.filterAnimals(query);
  } catch (e) {
    console.error("Failed to load data:", e);
    allData = [];
  }

  // Show query time in the stats bar.
  const elapsed = Math.round(performance.now() - start);
  document.getElementById("stat-query").textContent = `${elapsed}ms`;

  filteredData = [...allData];
  currentPage  = 1;
  selectedRow  = 0;
  renderTable();
}

// ── Utilities ─────────────────────────────────────────────────────────────────

// Switches between dashboard, add, and delete views.
function showView(name, btn) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("view-" + name).classList.add("active");
  btn.classList.add("active");

  // Leaflet needs this when its container becomes visible after being hidden.
  if (name === "dashboard" && leafletMap) {
    setTimeout(() => leafletMap.invalidateSize(), 100);
  }
}

// Shows a toast message and hides it after 3 seconds.
function showToast(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = "block";
  setTimeout(() => el.style.display = "none", 3000);
}
