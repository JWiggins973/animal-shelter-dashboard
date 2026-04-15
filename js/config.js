// config.js
// Author: Jermaine Wiggins
// Purpose: Configuration file for the reusable dashboard.
//          This is the ONLY file that changes between projects.
//          Everything else (app.js, index.html, style.css) is generic.
//
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO USE THIS DASHBOARD FOR A NEW PROJECT
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. Set api to the URL where your Flask server is running.
// 2. Fill in title, subtitle, author, and logo for the header branding.
// 3. Define columns -- one object per field. Set badge: true on the column
//    you want rendered as a colored pill.
// 4. Define filters -- each entry becomes a dropdown above the table.
//    Provide a field name and the list of values to show as options.
// 5. Define rescueFilters -- named MongoDB queries for the rescue dropdown.
//    Always keep the first entry as { query: {} } to show all records.
// 6. Set map.lat, map.lng, map.label, and map.name to your coordinate fields.
// 7. Define addFields -- one entry per field on the Add Record form.
//    Supported types: text, number, date, select (select requires options).
// 8. Set deleteIdField to your primary key, deleteNameField to the display
//    field, and deletePreview to the fields shown in each result card.
// 9. Update messages to match your project's terminology.
//
// ─────────────────────────────────────────────────────────────────────────────

const CONFIG = {

  // ── API ────────────────────────────────────────────────────────────────────
  // URL of the Flask server.
  api: "http://127.0.0.1:5000",

  // ── Branding ───────────────────────────────────────────────────────────────
  // Header text. logo can be any emoji or single character.
  title:    "Grazioso Salvare",
  subtitle: "Animal Rescue Dashboard",
  author:   "Jermaine Wiggins",
  logo:     "🐾",

  // ── Navigation ─────────────────────────────────────────────────────────────
  // Nav buttons. view must match a .view div id in index.html.
  nav: [
    { label: "Dashboard",     view: "dashboard" },
    { label: "Add Animal",    view: "add" },
    { label: "Delete Animal", view: "delete" },
  ],

  // ── Labels ─────────────────────────────────────────────────────────────────
  // Headings shown on each view.
  tableTitle:     "Animal Records",
  addTitle:       "Add Animal",
  addSubtitle:    "Enter the details below to add a new animal to the database.",
  deleteTitle:    "Delete Animal",
  deleteSubtitle: "Search by name or animal ID to find and remove a record.",

  // ── Table Columns ──────────────────────────────────────────────────────────
  // One entry per column. field must match your MongoDB document field names.
  // Set badge: true on one column to render its values as colored pills.
  columns: [
    { label: "Name",       field: "name" },
    { label: "Type",       field: "animal_type",               badge: true },
    { label: "Breed",      field: "breed" },
    { label: "Color",      field: "color" },
    { label: "Sex",        field: "sex_upon_outcome" },
    { label: "Age (wks)",  field: "age_upon_outcome_in_weeks" },
    { label: "Outcome",    field: "outcome_type" },
    { label: "DOB",        field: "date_of_birth" },
  ],

  // ── Table Filters ──────────────────────────────────────────────────────────
  // Dropdowns above the table. field must match a MongoDB field name.
  filters: [
    {
      label:   "All Types",
      field:   "animal_type",
      options: ["Dog", "Cat"],
    },
    {
      label:   "All Outcomes",
      field:   "outcome_type",
      options: ["Adoption", "Transfer", "Return to Owner", "Foster"],
    },
    {
      label:   "All Sexes",
      field:   "sex_upon_outcome",
      options: ["Intact Male", "Intact Female", "Neutered Male", "Spayed Female"],
    },
  ],

  // ── Rescue Filters ─────────────────────────────────────────────────────────
  // Named MongoDB queries for the rescue dropdown. Keep the first entry as {}.
  rescueFilters: [
    {
      label: "All Animals",
      query: {},
    },
    {
      label: "Tracking",
      query: {
        animal_type: "Dog",
        breed: { $in: ["Doberman Pinscher", "German Shepherd", "Golden Retriever", "Bloodhound", "Rottweiler"] },
        sex_upon_outcome: "Intact Male",
        age_upon_outcome_in_weeks: { $gte: 20, $lte: 300 },
      },
    },
    {
      label: "Water Rescue",
      query: {
        animal_type: "Dog",
        breed: { $in: ["Labrador Retriever Mix", "Chesa Bay Retr Mix", "Newfoundland", "Portuguese Water Dog"] },
        sex_upon_outcome: "Intact Female",
        age_upon_outcome_in_weeks: { $gte: 26, $lte: 156 },
      },
    },
    {
      label: "Mountain Rescue",
      query: {
        animal_type: "Dog",
        breed: { $in: ["German Shepherd", "Alaskan Malamute", "Old English Sheepdog", "Rottweiler"] },
        sex_upon_outcome: "Intact Male",
        age_upon_outcome_in_weeks: { $gte: 26, $lte: 156 },
      },
    },
  ],

  // ── Map ────────────────────────────────────────────────────────────────────
  // lat and lng must match your MongoDB coordinate field names.
  map: {
    lat:           "location_lat",
    lng:           "location_long",
    label:         "breed",
    name:          "name",
    title:         "Animal Location",
    defaultCenter: [30.75, -97.48],
    defaultZoom:   10,
  },

  // ── Chart ──────────────────────────────────────────────────────────────────
  // field is the MongoDB field to group by for the pie chart.
  chart: {
    field: "breed",
    title: "Breed Distribution",
  },

  // ── Add Form ───────────────────────────────────────────────────────────────
  // Form fields. type: text | number | date | select (select requires options).
  addFields: [
    { label: "Animal ID",        field: "animal_id",                 type: "text",   placeholder: "e.g. A123456" },
    { label: "Name",             field: "name",                      type: "text",   placeholder: "e.g. Luna" },
    { label: "Animal Type",      field: "animal_type",               type: "select", options: ["Dog", "Cat", "Other"] },
    { label: "Breed",            field: "breed",                     type: "text",   placeholder: "e.g. Siamese Mix" },
    { label: "Color",            field: "color",                     type: "text",   placeholder: "e.g. Cream/Gray" },
    { label: "Date of Birth",    field: "date_of_birth",             type: "date" },
    { label: "Sex",              field: "sex_upon_outcome",          type: "select", options: ["Intact Male", "Intact Female", "Neutered Male", "Spayed Female"] },
    { label: "Outcome Type",     field: "outcome_type",              type: "select", options: ["Adoption", "Transfer", "Return to Owner", "Foster"] },
    { label: "Latitude",         field: "location_lat",              type: "number", placeholder: "e.g. 30.2672" },
    { label: "Longitude",        field: "location_long",             type: "number", placeholder: "e.g. -97.7431" },
    { label: "Age Upon Outcome", field: "age_upon_outcome",          type: "text",   placeholder: "e.g. 5 months" },
    { label: "Age in Weeks",     field: "age_upon_outcome_in_weeks", type: "number", placeholder: "e.g. 21.7" },
  ],

  // ── Delete ─────────────────────────────────────────────────────────────────
  // deleteIdField: primary key sent to the API. deleteNameField: result card
  // title. deleteSearch: searchable fields. deletePreview: card detail fields.
  deleteSearch:    ["name", "animal_id"],
  deleteIdField:   "animal_id",
  deleteNameField: "name",
  deletePreview: [
    { label: "Type",  field: "animal_type" },
    { label: "Breed", field: "breed" },
    { label: "Sex",   field: "sex_upon_outcome" },
    { label: "ID",    field: "animal_id" },
  ],

  // ── Messages ───────────────────────────────────────────────────────────────
  // Toast messages shown after actions.
  messages: {
    addSuccess:    "Animal added successfully.",
    addError:      "Failed to add animal. Please try again.",
    deleteSuccess: "Animal record deleted successfully.",
  },

  // ── Mock Data ──────────────────────────────────────────────────────────────
  // Set to MOCK_DATA for the GitHub Pages demo. Set to null to use the live API.
  mockData: MOCK_DATA,

};
