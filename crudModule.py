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

    # ------------------------------------------------------------
    # CREATE - Insert a single document into the collection
    # ------------------------------------------------------------
    def create(self, data):
        """Insert one document into the animals collection.

        Args:
            data (dict): The document to insert. Must be a non-empty dictionary.

        Returns:
            bool: True if the insert succeeded.

        Raises:
            Exception: If data is None or empty.
        """
        if data is not None:
            self.collection.insert_one(data)
            return True
        else:
            raise Exception("Nothing to save, because data parameter is empty")

    # ------------------------------------------------------------
    # READ - Query documents from the collection
    # ------------------------------------------------------------
    def read(self, query):
        """Find and return documents matching the given query.

        Args:
            query (dict): A MongoDB query dictionary. Pass {} to return all documents.

        Returns:
            list: A list of matching documents.

        Raises:
            Exception: If query is None.
        """
        if query is not None:
            results = self.collection.find(query)
            return list(results)
        else:
            raise Exception("Nothing to read, because query parameter is empty")

    # ------------------------------------------------------------
    # UPDATE - Modify one or many documents in the collection
    # ------------------------------------------------------------
    def update(self, query, updated_data, many=False):
        """Update one or more documents matching the given query.

        Args:
            query (dict):        A MongoDB query dictionary to match documents.
            updated_data (dict): The update operations to apply (e.g. {"$set": {...}}).
            many (bool):         If True, update all matching documents.
                                 If False (default), update only the first match.

        Returns:
            int: The number of documents modified.

        Raises:
            Exception: If query or updated_data is None.
        """
        if query is not None and updated_data is not None:
            if many:
                results = self.collection.update_many(query, updated_data)
            else:
                results = self.collection.update_one(query, updated_data)
            return results.modified_count
        else:
            raise Exception("Please provide both a query and update data")

    # ------------------------------------------------------------
    # DELETE - Remove one or many documents from the collection
    # ------------------------------------------------------------
    def delete(self, query, many=False):
        """Delete one or more documents matching the given query.

        Args:
            query (dict): A MongoDB query dictionary to match documents.
            many (bool):  If True, delete all matching documents.
                          If False (default), delete only the first match.

        Returns:
            int: The number of documents deleted.

        Raises:
            Exception: If query is None.
        """
        if query is not None:
            if many:
                results = self.collection.delete_many(query)
            else:
                results = self.collection.delete_one(query)
            return results.deleted_count
        else:
            raise Exception("Please provide a query to delete documents")
