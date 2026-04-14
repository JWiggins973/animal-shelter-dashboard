# Program:  server.py
# Author:   Jermaine Wiggins
# Date:     2025
# Purpose:  Flask server that exposes the AnimalShelter CRUD module as a
#           REST API. Serves the dashboard frontend and handles all
#           database operations through HTTP endpoints.

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from crudModule import AnimalShelter

app = Flask(__name__, static_folder="dashboard")
CORS(app)

db = AnimalShelter()


def stringify_ids(docs):
    """Convert ObjectId fields to strings so the documents can be serialized to JSON."""
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return docs


@app.route("/")
def index():
    """Serve the dashboard frontend when the user visits the root URL."""
    return send_from_directory("dashboard", "index.html")


@app.route("/<path:filename>")
def serve_static(filename):
    """Serve static files from the dashboard folder."""
    return send_from_directory("dashboard", filename)


@app.route("/api/animals", methods=["GET"])
def get_animals():
    """Return all animals from the database."""
    return jsonify(stringify_ids(db.read({})))


@app.route("/api/animals/filter", methods=["POST"])
def filter_animals():
    """Return animals matching a query passed in the request body."""
    query = request.get_json() or {}
    return jsonify(stringify_ids(db.read(query)))


@app.route("/api/animals/stats", methods=["GET"])
def get_stats():
    """Return total, dog, and cat counts for the stats bar."""
    return jsonify(
        {
            "total": db.count({}),
            "dogs": db.count({"animal_type": "Dog"}),
            "cats": db.count({"animal_type": "Cat"}),
        }
    )


@app.route("/api/animals", methods=["POST"])
def create_animal():
    """Insert a new animal record."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    db.create(data)
    return jsonify({"success": True}), 201


@app.route("/api/animals/delete", methods=["POST"])
def delete_animal():
    """Delete the first animal matching the query."""
    query = request.get_json()
    if not query:
        return jsonify({"error": "No query provided"}), 400
    deleted = db.delete(query)
    return jsonify({"deleted": deleted})


# Start the server.
if __name__ == "__main__":
    app.run(debug=True, port=5000)
