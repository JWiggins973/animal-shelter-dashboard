# 🐾 Animal Shelter Dashboard

Filter and interact with animal rescue data for Grazioso Salvare. Built with Python, MongoDB, and Dash — featuring live stats, rescue type filtering, an interactive map, and breed distribution chart.

> The base dashboard code was provided by Southern New Hampshire University as part of CS340 Client/Server Development. The CRUD module (`crudModule.py`) and all enhancements listed above were implemented by Jermaine Wiggins.

## 📁 Original Artifact
The original version is on the `main` branch.

## ⚡ Enhancements - Client/Server Development

* 🧹 Cleaned up comments, removed dead code, and added named constants throughout
* 🗄️ Added database indexes on `animal_type` and `breed` — improving query time from O(n) to O(log n)
* 🔧 Expanded CRUD module with `count`, `create_many`, `update_many`, and `delete_many` methods
* 🔒 Moved hardcoded credentials to a `.env` file using `python-dotenv`
* 📊 Added a live stats bar showing total animals, dogs, cats, and query time in milliseconds

## 📸 Preview
Coming Soon

## ▶️ How to Run

**1. Get the Docker container**
This project uses the `moonlitaltar/cs340` Docker image provided by SNHU. If you don't have it yet pull and run it:
```bash
docker pull moonlitaltar/cs340
docker run -d -p 27017:27017 --name cs340 moonlitaltar/cs340
```
If you already have it just start it:
```bash
docker start cs340
```

**2. Activate the virtual environment**
```bash
source venv/bin/activate
```

**3. Create your .env file** — this is required and never committed to GitHub
```
MONGO_USER=your_username
MONGO_PASS=your_password
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=AAC
MONGO_COL=animals
```

**4. Run the dashboard**
```bash
python artifact3.py
```

Open your browser → `http://127.0.0.1:8050`

## ✍️ Author
Jermaine Wiggins | Southern New Hampshire University | CS340 Client/Server Development