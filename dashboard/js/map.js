// map.js
// Author: Jermaine Wiggins
// Date:   2025
// Purpose: Leaflet map. Updates the marker when a table row is selected.

let leafletMap    = null; // Leaflet map instance.
let leafletMarker = null; // Current map marker.

// Moves the map marker to the selected row's coordinates.
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

  // Build the popup using DOM nodes -- never inject data values into HTML strings.
  const popup   = document.createElement("div");
  const nameEl  = document.createElement("strong");
  nameEl.textContent = name;
  const breedEl = document.createElement("p");
  breedEl.textContent = label;
  popup.appendChild(nameEl);
  popup.appendChild(breedEl);

  // Place a marker at the selected animal's coordinates.
  leafletMarker = L.marker([lat, lng])
    .addTo(leafletMap)
    .bindTooltip(label)
    .bindPopup(popup)
    .openPopup();

  leafletMap.setView([lat, lng], CONFIG.map.defaultZoom);
}
