# Program:  service.py
# Author:   Jermaine Wiggins
# Date:     2025
# Purpose:  Business logic layer between Flask routes and the database.
#           Routes call these functions and never access the database directly.

from crudModule import AnimalShelter

db = AnimalShelter()

# Fields allowed in filter queries. Anything outside this set is stripped before
# the query reaches MongoDB, which blocks operator injection attacks.
ALLOWED_FILTER_FIELDS = {
    "animal_type",
    "breed",
    "sex_upon_outcome",
    "age_upon_outcome_in_weeks",
    "outcome_type",
    "name",
    "animal_id",
    "$or",
}

# Fields that must be present when creating a new animal record.
REQUIRED_CREATE_FIELDS = {"name", "animal_type", "breed"}


def sanitize_query(query):
    """Return a copy of query containing only keys in ALLOWED_FILTER_FIELDS.

    Returns an empty dict if the input is not a dict.
    """
    if not isinstance(query, dict):
        return {}
    return {k: v for k, v in query.items() if k in ALLOWED_FILTER_FIELDS}


def get_all_animals():
    """Return all animals in the collection with _id fields converted to strings."""
    docs = db.read({})
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return docs


def filter_animals(query):
    """Return animals matching the sanitized query with _id fields converted to strings.

    If the original query had keys but none survived sanitization, returns an empty
    list rather than running an unfiltered query against the full collection.
    """
    clean = sanitize_query(query)
    # If the caller sent a non-empty query but all keys were stripped (e.g. operator
    # injection), return nothing instead of falling through to a full collection scan.
    if query and not clean:
        return []
    docs = db.read(clean)
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return docs


def get_stats():
    """Return total, dog, and cat counts for the stats bar."""
    return {
        "total": db.count({}),
        "dogs":  db.count({"animal_type": "Dog"}),
        "cats":  db.count({"animal_type": "Cat"}),
    }


def create_animal(data):
    """Validate required fields and insert a new animal record. Returns True on success."""
    missing = REQUIRED_CREATE_FIELDS - set(data.keys())
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(sorted(missing))}")
    db.create(data)
    return True


def delete_animal(query):
    """Delete the first animal matching the sanitized query. Returns the deleted count."""
    clean = sanitize_query(query)
    if not clean:
        raise ValueError("Query must contain at least one valid filter field")
    return db.delete(clean)
