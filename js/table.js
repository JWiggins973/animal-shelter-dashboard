// table.js
// Author: Jermaine Wiggins
// Date:   2025
// Purpose: Table rendering, column sorting, and pagination.
//          Reads shared state (filteredData, currentPage, etc.) from app.js.

// Builds table headers from CONFIG.columns.
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

// Renders the current page into the table body.
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
      // Strip non-alpha characters from the class name to prevent injection.
      if (col.badge) {
        const badge       = document.createElement("span");
        badge.className   = `badge badge-${val.toLowerCase().replace(/[^a-z]/g, "")}`;
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

// Renders pagination controls below the table.
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
    ? `Showing ${start}-${end} of ${filteredData.length.toLocaleString()}`
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

// Returns page numbers to display, with "..." for skipped ranges.
function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total-4, total-3, total-2, total-1, total];
  return [1, "...", current-1, current, current+1, "...", total];
}

// Jumps to a page and scrolls to the top.
function goToPage(page) {
  currentPage = page;
  selectedRow = 0;
  renderTable();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Sorts by the clicked column; same column toggles direction.
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
