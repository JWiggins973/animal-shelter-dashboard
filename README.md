# 🐾 Animal Shelter Dashboard

A web dashboard built with Python, MongoDB, and Dash for Grazioso Salvare. Filter and interact with animal rescue data in real time.

> CS340 Client/Server Development — SNHU | Jermaine Wiggins | 2025

---

## 🚀 Enhancements

| # | Enhancement | What I Did |
|---|-------------|------------|
| 1 | Code Cleanup | Fixed comments, removed dead code, added constants |
| 2 | Database Indexing | Added indexes on animal_type and breed — O(n) → O(log n) |
| 3 | Expanded CRUD | Added count, create_many, update_many, delete_many |
| 4 | Security | Moved hardcoded credentials to a .env file |
| 5 | Stats Bar | Added live stats and query timer to the dashboard |

---

## 🛠 Technologies

- Python 3.13 · MongoDB 7.0 · Dash · PyMongo · Pandas · Docker

---

## ⚙️ Setup

**1. Start the Docker container**
```bash
docker start cs340
```

**2. Clone the repo**
```bash
git clone https://github.com/JWiggins973/animal-shelter-dashboard.git
cd animal-shelter-dashboard
```

**3. Create virtual environment**
```bash
python3 -m venv venv
source venv/bin/activate
pip install pymongo dash dash-leaflet plotly pandas numpy python-dotenv
```

**4. Create your .env file**
```bash
MONGO_USER=your_username
MONGO_PASS=your_password
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=AAC
MONGO_COL=animals
```

---

## ▶️ How to Run

```bash
source venv/bin/activate
python artifact3.py
```

Open your browser → `http://127.0.0.1:8050`

---

## 🧪 Tests

```bash
python test_crudModule.py
```

Tests all 8 CRUD methods and cleans up after itself.

---

## 📸 Screenshots

### Full Dashboard
![Dashboard](screenshots/dashboard_full.png)

### Stats Bar + Query Timer
![Stats](screenshots/stats_bar.png)

### Filter Active
![Filter](screenshots/filter_active.png)

### Map View
![Map](screenshots/map_view.png)