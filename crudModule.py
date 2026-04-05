# Program:  crudModule.py
# Author:   Jermaine Wiggins
# Date:     2025
# Purpose:  Provides a reusable AnimalShelter class with CRUD operations
#           (Create, Read, Update, Delete) for the AAC animals collection
#           in MongoDB. Used by the CS340 animal shelter dashboard.

import os
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv

# Load environment variables from the .env file so credentials
# are never hardcoded in the source code.
load_dotenv()


class AnimalShelter(object):
    """CRUD operations for the Animal collection in MongoDB."""

    def __init__(self):
        # Load credentials from environment variables.
        # Raises a clear error if any required variable is missing.
        USER = os.environ.get("MONGO_USER")
        PASS = os.environ.get("MONGO_PASS")
        HOST = os.environ.get("MONGO_HOST", "localhost")
        PORT = int(os.environ.get("MONGO_PORT", 27017))
        DB = os.environ.get("MONGO_DB", "AAC")
        COL = os.environ.get("MONGO_COL", "animals")

        if not USER or not PASS:
            raise Exception("MONGO_USER and MONGO_PASS must be set in the .env file")

        # Connect to MongoDB and select the animals collection.
        # authSource=admin tells PyMongo where the user account is stored.
        self.client = MongoClient(
            "mongodb://%s:%s@%s:%d/?authSource=admin" % (USER, PASS, HOST, PORT)
        )
        self.database = self.client[DB]
        self.collection = self.database[COL]

        # Add indexes on filtered fields so queries run in O(log n) instead of O(n).
        # Checks existing indexes first so duplicates are never created on restart.
        existing_indexes = self.collection.index_information()

        if "animal_type_1" not in existing_indexes:
            self.collection.create_index("animal_type", name="animal_type_1")

        if "breed_1" not in existing_indexes:
            self.collection.create_index("breed", name="breed_1")

        if "animal_type_1_breed_1" not in existing_indexes:
            self.collection.create_index(
                [("animal_type", 1), ("breed", 1)], name="animal_type_1_breed_1"
            )

    # ------------------------------------------------------------
    # CREATE
    # ------------------------------------------------------------
    def create(self, data):
        """Insert one document into the collection. Returns True on success."""
        if data is not None:
            self.collection.insert_one(data)
            return True
        else:
            raise Exception("Nothing to save, because data parameter is empty")

    def create_many(self, data_list):
        """Insert multiple documents at once. Returns True on success."""
        if data_list is not None and len(data_list) > 0:
            self.collection.insert_many(data_list)
            return True
        else:
            raise Exception("Nothing to save, because data_list parameter is empty")

    # ------------------------------------------------------------
    # READ
    # ------------------------------------------------------------
    def read(self, query):
        """Query the collection and return matching documents as a list."""
        if query is not None:
            results = self.collection.find(query)
            return list(results)
        else:
            raise Exception("Nothing to read, because query parameter is empty")

    def count(self, query):
        """Return the number of documents matching the query."""
        if query is not None:
            return self.collection.count_documents(query)
        else:
            raise Exception("Nothing to count, because query parameter is empty")

    # ------------------------------------------------------------
    # UPDATE
    # ------------------------------------------------------------
    def update(self, query, updated_data):
        """Update the first document matching the query. Returns the number of documents modified."""
        if query is not None and updated_data is not None:
            results = self.collection.update_one(query, updated_data)
            return results.modified_count
        else:
            raise Exception("Please provide both a query and update data")

    def update_many(self, query, updated_data):
        """Update all documents matching the query. Returns the number of documents modified."""
        if query is not None and updated_data is not None:
            results = self.collection.update_many(query, updated_data)
            return results.modified_count
        else:
            raise Exception("Please provide both a query and update data")

    # ------------------------------------------------------------
    # DELETE
    # ------------------------------------------------------------
    def delete(self, query):
        """Delete the first document matching the query. Returns the number of documents deleted."""
        if query is not None:
            results = self.collection.delete_one(query)
            return results.deleted_count
        else:
            raise Exception("Please provide a query to delete documents")

    def delete_many(self, query):
        """Delete all documents matching the query. Returns the number of documents deleted."""
        if query is not None:
            results = self.collection.delete_many(query)
            return results.deleted_count
        else:
            raise Exception("Please provide a query to delete documents")
