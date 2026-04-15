# 🐾 Animal Shelter Dashboard

Filter and interact with animal rescue data for Grazioso Salvare. Built with Python, Flask, MongoDB, and vanilla JavaScript — featuring live stats, rescue type filtering, an interactive map, and a breed distribution chart.

> The base dashboard code was provided by Southern New Hampshire University as part of CS340 Client/Server Development. The CRUD module (`crudModule.py`) and all enhancements listed below were implemented by Jermaine Wiggins.

## 📁 Original Artifact
The original Dash-based version is on the [`main` branch](https://github.com/JWiggins973/animal-shelter-dashboard/tree/main).

## 🌐 Live Demo
[View on GitHub Pages](https://jwiggins973.github.io/animal-shelter-dashboard/) — powered by 100 real records exported as mock data from the live database, no backend required.

## ⚡ Enhancements - Client/Server Development

* Migrated from Dash to a custom Flask REST API with a vanilla JavaScript frontend
* Built a reusable dashboard engine — swap `config.js` to use it with any MongoDB collection
* Added database indexes on `animal_type` and `breed` — improving query time from O(n) to O(log n)
* Expanded CRUD module with `count`, `create_many`, `update_many`, and `delete_many` methods
* Moved hardcoded credentials to a `.env` file using `python-dotenv`
* Added a live stats bar showing total animals, dogs, cats, and query time in milliseconds
* Added sortable, searchable, paginated table with rescue type and column filters
* Split backend into `service.py` (business logic) and `server.py` (HTTP routing)
* Split frontend into focused modules — `api.js`, `table.js`, `filters.js`, `map.js`, `chart.js`, `forms.js`
* Added query sanitization in `service.py` to block MongoDB operator injection

## ▶️ How to Run

**1. Get the Docker container**

This project uses the `moonlitaltar/cs340` Docker image provided by SNHU. If you don't have it yet:
```bash
docker pull moonlitaltar/cs340
docker run -d -p 27017:27017 --name cs340 moonlitaltar/cs340
```
If you already have it:
```bash
docker start cs340
```

**2. Activate the virtual environment**
```bash
source venv/bin/activate
```

**3. Create your `.env` file** — required, never committed to GitHub
```
MONGO_USER=your_username
MONGO_PASS=your_password
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=AAC
MONGO_COL=animals
```

**4. Run the server**
```bash
python backend/server.py
```

Open your browser → `http://127.0.0.1:5000`

## ✍️ Author
Jermaine Wiggins | Southern New Hampshire University | CS340 Client/Server Development
