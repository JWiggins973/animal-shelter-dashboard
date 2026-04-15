// api.js
// Author: Jermaine Wiggins
// Date:   2025
// Purpose: All fetch calls live here. No other file is allowed to call fetch
//          or construct API URLs.

const api = {

  // Fetch total, dog, and cat counts.
  async getStats() {
    const res = await fetch(`${CONFIG.api}/api/animals/stats`);
    if (!res.ok) throw new Error("Failed to load stats");
    return res.json();
  },

  // Fetch animals matching the given query. Pass {} to get all records.
  async filterAnimals(query = {}) {
    const res = await fetch(`${CONFIG.api}/api/animals/filter`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(query),
    });
    if (!res.ok) throw new Error("Failed to load animals");
    return res.json();
  },

  // Insert a new animal record. Returns { ok, data } -- never throws.
  async createAnimal(doc) {
    const res  = await fetch(`${CONFIG.api}/api/animals`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(doc),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  },

  // Delete the first animal matching the query. Returns { ok, data } -- never throws.
  async deleteAnimal(query) {
    const res  = await fetch(`${CONFIG.api}/api/animals/delete`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(query),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  },

};
