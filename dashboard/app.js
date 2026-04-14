// app.js
// Author: Jermaine Wiggins
// Purpose: Reads CONFIG from config.js and builds the entire dashboard.
//          Swap config.js to use this with a different project.

// ── State ─────────────────────────────────────────────────────────────────────

let allData       = [];   // full dataset returned from the API
let filteredData  = [];   // data after table filters are applied
let currentPage   = 1;    // which page of the table we're on
const PAGE_SIZE   = 10;   // rows per page
let sortCol       = -1;   // which column is sorted (-1 = none)
let sortAsc       = true; // sort direction
let leafletMap    = null; // Leaflet map instance
let leafletMarker = null; // current map marker
let pieChart      = null; // Chart.js instance
let selectedRow   = 0;    // which row is currently selected

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
  // Header.
  document.getElementById("page-title").textContent      = CONFIG.title;
  document.getElementById("header-logo").textContent     = CONFIG.logo;
  document.getElementById("header-title").textContent    = CONFIG.title;
  document.getElementById("header-subtitle").textContent = CONFIG.subtitle;
  document.getElementById("header-author").textContent   = CONFIG.author;

  // Chart and table titles.
  document.getElementById("chart-title").textContent = CONFIG.chart.title;
  document.getElementById("table-title").textContent = CONFIG.tableTitle;

  // Map title.
  document.getElementById("map-title").textContent = CONFIG.map.title;

  // Add view labels.
  document.getElementById("add-title").textContent       = CONFIG.addTitle;
  document.getElementById("add-subtitle").textContent    = CONFIG.addSubtitle;
  document.getElementById("add-form-title").textContent  = CONFIG.addTitle;

  // Delete view labels.
  document.getElementById("delete-title").textContent    = CONFIG.deleteTitle;
  document.getElementById("delete-subtitle").textContent = CONFIG.deleteSubtitle;

  // Toast messages.
  document.getElementById("add-toast").textContent    = CONFIG.messages.addSuccess;
  document.getElementById("add-error").textContent    = CONFIG.messages.addError;
  document.getElementById("delete-toast").textContent = CONFIG.messages.deleteSuccess;

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

// ── Stats Bar ─────────────────────────────────────────────────────────────────

// Fetches total, dog, and cat counts from the API and updates the stats bar.
async function loadStats() {
  try {
    const res  = await fetch(`${CONFIG.api}/api/animals/stats`);
    const data = await res.json();
    document.getElementById("stat-total").textContent = data.total.toLocaleString();
    document.getElementById("stat-dogs").textContent  = data.dogs.toLocaleString();
    document.getElementById("stat-cats").textContent  = data.cats.toLocaleString();
  } catch (e) {
    console.error("Failed to load stats:", e);
  }
}

// ── Rescue Filter ─────────────────────────────────────────────────────────────

// Populates the rescue type dropdown from CONFIG.rescueFilters.
function buildRescueFilter() {
  const select = document.getElementById("rescue-filter");
  CONFIG.rescueFilters.forEach((f, i) => {
    const opt       = document.createElement("option");
    opt.value       = i;
    opt.textContent = f.label;
    select.appendChild(opt);
  });
}

// Called when the rescue dropdown changes. Clears table filters and reloads data.
async function applyRescueFilter() {
  const idx   = parseInt(document.getElementById("rescue-filter").value);
  const query = CONFIG.rescueFilters[idx].query;
  clearTableFilters(false);
  await loadData(query);
}

// ── Data Loading ──────────────────────────────────────────────────────────────

// Fetches animals from the API using the given query and times the request.
async function loadData(query) {

  // Show a loading placeholder while the request is in flight.
  document.getElementById("table-body").innerHTML =
    `<tr><td colspan="${CONFIG.columns.length}" class="loading">Loading...</td></tr>`;

  const start = performance.now();

  try {
    const res = await fetch(`${CONFIG.api}/api/animals/filter`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(query),
    });
    allData = await res.json();
  } catch (e) {
    console.error("Failed to load data:", e);
    allData = [];
  }

  // Calculate query time for the stats bar.
  const elapsed = Math.round(performance.now() - start);
  document.getElementById("stat-query").textContent = `${elapsed}ms`;

  filteredData = [...allData];
  currentPage  = 1;
  selectedRow  = 0;
  renderTable();
}

// ── Table ─────────────────────────────────────────────────────────────────────

// Builds the table headers from CONFIG.columns. Called once on page load.
function buildTableHead() {
  const thead = document.getElementById("table-head");
  const tr    = document.createElement("tr");

  CONFIG.columns.forEach((col, i) => {
    const th       = document.createElement("th");
    th.textContent = col.label;
    // Clicking a header sorts by that column.
    th.onclick     = () => sortTable(i);
    tr.appendChild(th);
  });

  thead.appendChild(tr);
}

// Renders the current page of rows into the table body.
function renderTable() {
  const tbody = document.getElementById("table-body");
  const start = (currentPage - 1) * PAGE_SIZE;
  const page  = filteredData.slice(start, start + PAGE_SIZE);

  tbody.innerHTML = "";

  if (page.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${CONFIG.columns.length}" class="loading">No results found.</td></tr>`;
    renderPagination();
    document.getElementById("results-count").textContent = "0 results";
    return;
  }

  page.forEach((row, i) => {
    const tr = document.createElement("tr");
    if (i === selectedRow) tr.classList.add("selected");

    CONFIG.columns.forEach(col => {
      const td  = document.createElement("td");
      const val = row[col.field] ?? "";

      // Show a colored badge for columns marked badge: true in CONFIG.columns.
      if (col.badge) {
        const badge       = document.createElement("span");
        badge.className   = `badge badge-${val.toLowerCase()}`;
        badge.textContent = val;
        td.appendChild(badge);
      } else {
        td.textContent = val;
      }

      tr.appendChild(td);
    });

    // Clicking a row selects it and updates the map.
    tr.onclick = () => {
      document.querySelectorAll("#table-body tr").forEach(r => r.classList.remove("selected"));
      tr.classList.add("selected");
      selectedRow = i;
      updateMap(start + i);
    };

    tbody.appendChild(tr);
  });

  renderPagination();
  document.getElementById("results-count").textContent = `${filteredData.length.toLocaleString()} results`;
  updateMap(start + selectedRow);
  updateChart();
}

// ── Pagination ────────────────────────────────────────────────────────────────

// Builds the page number buttons below the table.
function renderPagination() {
  const total      = Math.ceil(filteredData.length / PAGE_SIZE);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  // Show a range summary on the left side.
  const info       = document.createElement("span");
  info.style.flex  = "1";
  const start      = ((currentPage - 1) * PAGE_SIZE) + 1;
  const end        = Math.min(currentPage * PAGE_SIZE, filteredData.length);
  info.textContent = filteredData.length > 0
    ? `Showing ${start}–${end} of ${filteredData.length.toLocaleString()}`
    : "No results";
  pagination.appendChild(info);

  if (total <= 1) return;

  // Previous button.
  const prev       = document.createElement("button");
  prev.className   = "page-btn";
  prev.textContent = "←";
  prev.disabled    = currentPage === 1;
  prev.onclick     = () => goToPage(currentPage - 1);
  pagination.appendChild(prev);

  // Page number buttons.
  getPageRange(currentPage, total).forEach(p => {
    if (p === "...") {
      const span       = document.createElement("span");
      span.textContent = "...";
      pagination.appendChild(span);
    } else {
      const btn       = document.createElement("button");
      btn.className   = "page-btn" + (p === currentPage ? " active" : "");
      btn.textContent = p;
      btn.onclick     = () => goToPage(p);
      pagination.appendChild(btn);
    }
  });

  // Next button.
  const next       = document.createElement("button");
  next.className   = "page-btn";
  next.textContent = "→";
  next.disabled    = currentPage === total;
  next.onclick     = () => goToPage(currentPage + 1);
  pagination.appendChild(next);
}

// Returns an array of page numbers to show, with "..." for skipped ranges.
function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total-4, total-3, total-2, total-1, total];
  return [1, "...", current-1, current, current+1, "...", total];
}

// Jumps to a specific page.
function goToPage(page) {
  currentPage = page;
  selectedRow = 0;
  renderTable();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Sort ──────────────────────────────────────────────────────────────────────

// Sorts filteredData by the clicked column. Clicking the same column reverses direction.
function sortTable(colIdx) {
  const ths = document.querySelectorAll("thead th");

  // Toggle direction on the same column, reset to ascending on a new one.
  if (sortCol === colIdx) {
    sortAsc = !sortAsc;
  } else {
    sortCol = colIdx;
    sortAsc = true;
  }

  // Update the sort arrow on the active header.
  ths.forEach(h => h.classList.remove("sort-asc", "sort-desc"));
  ths[colIdx].classList.add(sortAsc ? "sort-asc" : "sort-desc");

  const field = CONFIG.columns[colIdx].field;

  filteredData.sort((a, b) => {
    const aVal = a[field] ?? "";
    const bVal = b[field] ?? "";

    // Sort numbers numerically and strings alphabetically.
    const aNum = parseFloat(aVal);
    const bNum = parseFloat(bVal);
    if (!isNaN(aNum) && !isNaN(bNum)) return sortAsc ? aNum - bNum : bNum - aNum;
    return sortAsc ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });

  currentPage = 1;
  renderTable();
}

// ── Table Filters ─────────────────────────────────────────────────────────────

// Builds the filter dropdowns from CONFIG.filters. Called once on page load.
function buildFilterDropdowns() {
  const container = document.getElementById("filter-dropdowns");

  CONFIG.filters.forEach(f => {
    const select         = document.createElement("select");
    select.className     = "tbl-filter";
    select.dataset.field = f.field;
    select.onchange      = applyTableFilters;

    // Default option shows all values.
    const defaultOpt       = document.createElement("option");
    defaultOpt.value       = "";
    defaultOpt.textContent = f.label;
    select.appendChild(defaultOpt);

    // One option per value from CONFIG.
    f.options.forEach(opt => {
      const o       = document.createElement("option");
      o.value       = opt;
      o.textContent = opt;
      select.appendChild(o);
    });

    container.appendChild(select);
  });
}

// Filters allData based on the search input and dropdown selections.
function applyTableFilters() {
  const search  = document.getElementById("table-search").value.toLowerCase();
  const selects = document.querySelectorAll("#filter-dropdowns .tbl-filter");

  filteredData = allData.filter(row => {
    // Check the search term against all fields.
    const text = Object.values(row).join(" ").toLowerCase();
    if (search && !text.includes(search)) return false;

    // Check each active dropdown filter.
    for (const select of selects) {
      const val = select.value;
      if (val && String(row[select.dataset.field] ?? "").toLowerCase() !== val.toLowerCase()) return false;
    }

    return true;
  });

  currentPage = 1;
  renderTable();
}

// Resets all table filters and optionally re-renders.
function clearTableFilters(rerender = true) {
  document.getElementById("table-search").value = "";
  document.querySelectorAll("#filter-dropdowns .tbl-filter").forEach(s => s.value = "");
  if (rerender) {
    filteredData = [...allData];
    currentPage  = 1;
    renderTable();
  }
}

// ── Map ───────────────────────────────────────────────────────────────────────

// Updates the Leaflet map to show the selected animal's location.
function updateMap(rowIdx) {
  const row = filteredData[rowIdx];
  if (!row) return;

  const lat   = row[CONFIG.map.lat];
  const lng   = row[CONFIG.map.lng];
  if (!lat || !lng) return;

  const label = row[CONFIG.map.label] ?? "";
  const name  = row[CONFIG.map.name]  ?? "";

  // Create the map on first call. Skip if the container isn't visible yet.
  if (!leafletMap) {
    const container = document.getElementById("map");
    if (!container || container.offsetWidth === 0) return;
    leafletMap = L.map("map").setView(CONFIG.map.defaultCenter, CONFIG.map.defaultZoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(leafletMap);
  }

  // Remove the old marker before placing a new one.
  if (leafletMarker) leafletMap.removeLayer(leafletMarker);

  // Place a marker at the selected animal's coordinates.
  leafletMarker = L.marker([lat, lng])
    .addTo(leafletMap)
    .bindTooltip(label)
    .bindPopup(`<strong>${name}</strong><br>${label}`)
    .openPopup();

  leafletMap.setView([lat, lng], CONFIG.map.defaultZoom);
}

// ── Chart ─────────────────────────────────────────────────────────────────────

// Builds a pie chart from filteredData, grouped by CONFIG.chart.field.
// Values under 1% of the total are grouped into an Other slice.
function updateChart() {
  const field  = CONFIG.chart.field;
  const counts = {};

  // Count how many animals have each value.
  filteredData.forEach(row => {
    const val   = row[field] ?? "Unknown";
    counts[val] = (counts[val] || 0) + 1;
  });

  const total     = Object.values(counts).reduce((a, b) => a + b, 0);
  const threshold = total * 0.01;
  const labels    = [];
  const values    = [];
  let other       = 0;

  // Sort by count descending and group anything under 1% into Other.
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([label, count]) => {
      if (count >= threshold) {
        labels.push(label);
        values.push(count);
      } else {
        other += count;
      }
    });

  if (other > 0) { labels.push("Other"); values.push(other); }

  const colors = [
    "#2563eb","#60a5fa","#93c5fd","#bfdbfe","#dbeafe",
    "#1d4ed8","#3b82f6","#6366f1","#818cf8","#a5b4fc"
  ];

  // Destroy the previous chart instance before creating a new one.
  if (pieChart) pieChart.destroy();

  pieChart = new Chart(document.getElementById("pie-chart"), {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data:            values,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth:     2,
        borderColor:     "#fff"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "right",
          labels: { font: { family: "DM Sans", size: 12 }, boxWidth: 12 }
        }
      }
    }
  });
}

// ── Add Form ──────────────────────────────────────────────────────────────────

// Builds the add animal form dynamically from CONFIG.addFields.
function buildAddForm() {
  const form = document.getElementById("add-form");

  CONFIG.addFields.forEach(f => {
    const group       = document.createElement("div");
    group.className   = "form-group";

    const label       = document.createElement("label");
    label.className   = "form-label";
    label.textContent = f.label;
    group.appendChild(label);

    let input;
    if (f.type === "select") {
      input = document.createElement("select");
      input.className = "form-input";
      f.options.forEach(opt => {
        const o       = document.createElement("option");
        o.value       = opt;
        o.textContent = opt;
        input.appendChild(o);
      });
    } else {
      input             = document.createElement("input");
      input.className   = "form-input";
      input.type        = f.type;
      input.placeholder = f.placeholder || "";
    }

    input.id = `add-${f.field}`;
    group.appendChild(input);
    form.appendChild(group);
  });
}

// Collects form values and posts a new record to the API.
async function submitAdd() {
  const doc = {};

  CONFIG.addFields.forEach(f => {
    const el  = document.getElementById(`add-${f.field}`);
    const val = el?.value.trim();
    if (val) {
      doc[f.field] = f.type === "number" ? parseFloat(val) : val;
    }
  });

  try {
    const res = await fetch(`${CONFIG.api}/api/animals`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(doc),
    });

    if (res.ok) {
      showToast("add-toast");
      clearAddForm();
      loadStats();
    } else {
      showToast("add-error");
    }
  } catch (e) {
    showToast("add-error");
  }
}

// Clears all add form inputs.
function clearAddForm() {
  CONFIG.addFields.forEach(f => {
    const el = document.getElementById(`add-${f.field}`);
    if (el) el.value = "";
  });
}

// ── Delete ────────────────────────────────────────────────────────────────────

// Searches for animals matching the input and displays result cards.
async function searchDelete() {
  const val     = document.getElementById("delete-search").value.trim();
  const results = document.getElementById("delete-results");
  results.innerHTML = "";

  if (!val) return;

  // Build an $or query from the search fields defined in CONFIG.
  const query = {
    $or: CONFIG.deleteSearch.map(field => ({ [field]: val }))
  };

  try {
    const res  = await fetch(`${CONFIG.api}/api/animals/filter`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(query),
    });
    const data = await res.json();

    if (data.length === 0) {
      results.innerHTML = `<p style="color:var(--muted);font-size:13px">No animal found matching "${val}".</p>`;
      return;
    }

    // Build a result card for each matching animal.
    data.forEach(animal => {
      const meta = CONFIG.deletePreview
        .map(f => `${f.label}: ${animal[f.field] ?? ""}`)
        .join(" · ");

      const card = document.createElement("div");
      card.className = "result-card";

      // Use DOM methods instead of innerHTML to avoid XSS.
      const nameEl = document.createElement("div");
      nameEl.className = "result-name";
      nameEl.textContent = animal[CONFIG.deleteNameField] ?? "Unknown";

      const metaEl = document.createElement("div");
      metaEl.className = "result-meta";
      metaEl.textContent = meta;

      const banner = document.createElement("div");
      banner.className = "confirm-banner";
      banner.textContent = "⚠️ This action cannot be undone. The record will be permanently deleted.";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-danger";
      deleteBtn.textContent = "Confirm Delete";
      deleteBtn.addEventListener("click", function() { confirmDelete(animal[CONFIG.deleteIdField], this); });

      const cancelBtn = document.createElement("button");
      cancelBtn.className = "btn btn-ghost";
      cancelBtn.textContent = "Cancel";
      cancelBtn.addEventListener("click", () => card.remove());

      const actionRow = document.createElement("div");
      actionRow.className = "action-row";
      actionRow.appendChild(deleteBtn);
      actionRow.appendChild(cancelBtn);

      card.appendChild(nameEl);
      card.appendChild(metaEl);
      card.appendChild(banner);
      card.appendChild(actionRow);
      results.appendChild(card);
    });
  } catch (e) {
    results.innerHTML = `<p style="color:var(--danger);font-size:13px">Error searching for animal.</p>`;
  }
}

// Sends a delete request to the API and removes the result card on success.
async function confirmDelete(animalId, btn) {
  try {
    const res = await fetch(`${CONFIG.api}/api/animals/delete`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ [CONFIG.deleteIdField]: animalId }),
    });
    const data = await res.json();

    if (data.deleted > 0) {
      btn.closest(".result-card").remove();
      showToast("delete-toast");
      loadStats();
    }
  } catch (e) {
    console.error("Delete failed:", e);
  }
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
