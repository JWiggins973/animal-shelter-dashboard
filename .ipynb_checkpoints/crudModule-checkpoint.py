from pymongo import MongoClient
from bson.objectid import ObjectId

class AnimalShelter(object):
    """ CRUD operations for Animal collection in MongoDB """

    def __init__(self):
        # Connection Variables
        USER = 'aacuser'
        PASS = 'SNHU1234'
        HOST = 'localhost'
        PORT = 27017
        DB = 'AAC'
        COL = 'animals'

        # Initialize Connection
        self.client = MongoClient('mongodb://%s:%s@%s:%d' % (USER, PASS, HOST, PORT))
        self.database = self.client[DB]
        self.collection = self.database[COL]

    # Complete this create method to implement the C in CRUD.
    def create(self, data):
        if data is not None:
            result = self.database.animals.insert_one(data)  # data should be dictionary
            return True
        else:
            raise Exception("Nothing to save, because data parameter is empty")
            return False

    # Create method to implement the R in CRUD.
    def read(self, query):
        if query is not None:
            results = self.collection.find(query)  # data should be dictionary
            return list(results)
        else:
            raise Exception("Nothing to read, because query parameter is empty")
            return []