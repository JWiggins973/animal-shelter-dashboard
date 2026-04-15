// filters.js
// Author: Jermaine Wiggins
// Date:   2025
// Purpose: Rescue type filter and table column filter dropdowns.

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
