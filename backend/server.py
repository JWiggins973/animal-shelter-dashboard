# Program:  server.py
# Author:   Jermaine Wiggins
# Date:     2025
# Purpose:  Flask server that exposes the animal shelter data as a REST API
#           and serves the dashboard frontend. Routes handle HTTP only --
#           all database access goes through service.py.

import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import service

app = Flask(__name__, static_folder="../dashboard")

# Restrict to the configured origin; defaults to localhost.
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "http://127.0.0.1:5000")
CORS(app, origins=[ALLOWED_ORIGIN])

# Debug mode only when FLASK_ENV=development.
debug = os.environ.get("FLASK_ENV") == "development"


@app.route("/")
def index():
    """Serve the dashboard frontend when the user visits the root URL."""
    return send_from_directory("../dashboard", "index.html")


@app.route("/<path:filename>")
def serve_static(filename):
    """Serve static files from the dashboard folder."""
    return send_from_directory("../dashboard", filename)


@app.route("/api/animals", methods=["GET"])
def get_animals():
    """Return all animals from the database."""
    try:
        return jsonify(service.get_all_animals())
    except Exception:
        return jsonify({"error": "Failed to retrieve animals"}), 500


@app.route("/api/animals/filter", methods=["POST"])
def filter_animals():
    """Return animals matching a query passed in the request body."""
    body = request.get_json()
    if not isinstance(body, dict):
        return jsonify({"error": "Request body must be a JSON object"}), 400
    try:
        return jsonify(service.filter_animals(body))
    except Exception:
        return jsonify({"error": "Failed to filter animals"}), 500


@app.route("/api/animals/stats", methods=["GET"])
def get_stats():
    """Return total, dog, and cat counts for the stats bar."""
    try:
        return jsonify(service.get_stats())
    except Exception:
        return jsonify({"error": "Failed to retrieve stats"}), 500


@app.route("/api/animals", methods=["POST"])
def create_animal():
    """Insert a new animal record."""
    body = request.get_json()
    if not isinstance(body, dict):
        return jsonify({"error": "Request body must be a JSON object"}), 400
    try:
        service.create_animal(body)
        return jsonify({"success": True}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "Failed to create animal"}), 500


@app.route("/api/animals/delete", methods=["POST"])
def delete_animal():
    """Delete the first animal matching the query."""
    body = request.get_json()
    if not isinstance(body, dict):
        return jsonify({"error": "Request body must be a JSON object"}), 400
    try:
        deleted = service.delete_animal(body)
        return jsonify({"deleted": deleted})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "Failed to delete animal"}), 500


# Start the server.
if __name__ == "__main__":
    app.run(debug=debug, port=5000)
