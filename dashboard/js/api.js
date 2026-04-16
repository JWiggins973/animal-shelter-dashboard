// api.js
// Author: Jermaine Wiggins
// Date:   2025
// Purpose: All fetch calls live here. No other file is allowed to call fetch
//          or construct API URLs. When CONFIG.mockData is set, all methods
//          operate on the local array instead of hitting the network.

const api = {

  // Returns total, dog, and cat counts.
  async getStats() {
    const res = await fetch(`${CONFIG.api}/api/animals/stats`);
    if (!res.ok) throw new Error("Failed to load stats");
    return res.json();
  },

  // Returns animals matching the query. Pass {} to get all records.
  async filterAnimals(query = {}) {
    if (CONFIG.mockData) return CONFIG.mockData.filter(row => matchesQuery(row, query));
    const res = await fetch(`${CONFIG.api}/api/animals/filter`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(query),
    });
    if (!res.ok) throw new Error("Failed to load animals");
    return res.json();
  },

  // Inserts a new animal record. Returns { ok, data }, never throws.
  async createAnimal(doc) {
    if (CONFIG.mockData) {
      CONFIG.mockData.push(doc);
      return { ok: true, data: { success: true } };
    }
    const res  = await fetch(`${CONFIG.api}/api/animals`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(doc),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  },

  // Deletes the first animal matching the query. Returns { ok, data }, never throws.
  async deleteAnimal(query) {
    if (CONFIG.mockData) {
      const idx = CONFIG.mockData.findIndex(row => matchesQuery(row, query));
      if (idx !== -1) CONFIG.mockData.splice(idx, 1);
      return { ok: true, data: { deleted: idx !== -1 ? 1 : 0 } };
    }
    const res  = await fetch(`${CONFIG.api}/api/animals/delete`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(query),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  },

};
