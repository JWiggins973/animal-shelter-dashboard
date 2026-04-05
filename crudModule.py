# Program:  crudModule.py
# Author:   Jermaine Wiggins
# Date:     2025
# Purpose:  Provides a reusable AnimalShelter class with CRUD operations
#           (Create, Read, Update, Delete) for the AAC animals collection
#           in MongoDB. Used by the CS340 animal shelter dashboard.

from pymongo import MongoClient
from bson.objectid import ObjectId


class AnimalShelter(object):
    """CRUD operations for the Animal collection in MongoDB."""

    def __init__(self):
        # Connection variables for the MongoDB instance
        USER = "aacuser"
        PASS = "SNHU1234"
        HOST = "localhost"
        PORT = 27017
        DB = "AAC"
        COL = "animals"

        # Initialize the MongoDB client and connect to the animals collection.
        # authSource=admin tells PyMongo to authenticate against the admin database,
        # which is where the aacuser account is stored.
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

    # ------------------------------------------------------------
    # UPDATE
    # ------------------------------------------------------------
    def update(self, query, updated_data, many=False):
        """Update matching documents. Set many=True to update all matches.
        Returns the number of documents modified."""
        if query is not None and updated_data is not None:
            if many:
                results = self.collection.update_many(query, updated_data)
            else:
                results = self.collection.update_one(query, updated_data)
            return results.modified_count
        else:
            raise Exception("Please provide both a query and update data")

    # ------------------------------------------------------------
    # DELETE
    # ------------------------------------------------------------
    def delete(self, query, many=False):
        """Delete matching documents. Set many=True to delete all matches.
        Returns the number of documents deleted."""
        if query is not None:
            if many:
                results = self.collection.delete_many(query)
            else:
                results = self.collection.delete_one(query)
            return results.deleted_count
        else:
            raise Exception("Please provide a query to delete documents")
