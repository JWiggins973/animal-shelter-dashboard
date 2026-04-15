// forms.js
// Author: Jermaine Wiggins
// Date:   2025
// Purpose: Add animal form and delete animal search/confirm flow.

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

  const { ok } = await api.createAnimal(doc);
  if (ok) {
    showToast("add-toast");
    clearAddForm();
    loadStats();
  } else {
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

  let data;
  try {
    data = await api.filterAnimals(query);
  } catch (e) {
    const err = document.createElement("p");
    err.style.cssText = "color:var(--danger);font-size:13px";
    err.textContent = "Error searching for animal.";
    results.appendChild(err);
    return;
  }

  if (data.length === 0) {
    const msg = document.createElement("p");
    msg.style.cssText = "color:var(--muted);font-size:13px";
    msg.textContent = `No animal found matching "${val}".`;
    results.appendChild(msg);
    return;
  }

  // Build a result card for each matching animal using DOM nodes -- never innerHTML.
  data.forEach(animal => {
    const card = document.createElement("div");
    card.className = "result-card";

    const nameEl = document.createElement("div");
    nameEl.className = "result-name";
    nameEl.textContent = animal[CONFIG.deleteNameField] ?? "Unknown";

    const metaEl = document.createElement("div");
    metaEl.className = "result-meta";
    metaEl.textContent = CONFIG.deletePreview
      .map(f => `${f.label}: ${animal[f.field] ?? ""}`)
      .join(" · ");

    const banner = document.createElement("div");
    banner.className = "confirm-banner";
    banner.textContent = "This action cannot be undone. The record will be permanently deleted.";

    // Use dataset.id and addEventListener instead of onclick to prevent attribute injection.
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-danger";
    deleteBtn.textContent = "Confirm Delete";
    deleteBtn.dataset.id = animal[CONFIG.deleteIdField];
    deleteBtn.addEventListener("click", function() {
      confirmDelete(this.dataset.id, this);
    });

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
}

// Sends a delete request to the API and removes the result card on success.
async function confirmDelete(animalId, btn) {
  const { ok, data } = await api.deleteAnimal({ [CONFIG.deleteIdField]: animalId });
  if (ok && data.deleted > 0) {
    btn.closest(".result-card").remove();
    showToast("delete-toast");
    loadStats();
  }
}
