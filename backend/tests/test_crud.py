# Program:  test_crudModule.py
# Author:   Jermaine Wiggins
# Date:     2025
# Purpose:  Tests all CRUD methods in the AnimalShelter class against
#           the live MongoDB instance. Cleans up all test data after each test.

from crudModule import AnimalShelter

shelter = AnimalShelter()

# Test document used across all tests
test_animal = {
    "rec_num": 999999,
    "age_upon_outcome": "5 months",
    "animal_id": "A999999",
    "animal_type": "Cat",
    "breed": "Siamese Mix",
    "color": "Cream/Gray",
    "date_of_birth": "2024-02-15",
    "datetime": "2024-07-25 10:30:00",
    "monthyear": "2024-07-25T10:30:00",
    "name": "Luna",
    "outcome_subtype": "Foster",
    "outcome_type": "Adoption",
    "sex_upon_outcome": "Spayed Female",
    "location_lat": 30.2672,
    "location_long": -97.7431,
    "age_upon_outcome_in_weeks": 21.7,
}

# ------------------------------------------------------------
# Test create
# ------------------------------------------------------------
print("Test: create")
result = shelter.create(test_animal)
print(f"create returned: {result}")
assert result == True, "create should return True"
print("PASSED\n")

# ------------------------------------------------------------
# Test read
# ------------------------------------------------------------
print("Test: read")
results = shelter.read({"animal_id": "A999999"})
print(f"read returned {len(results)} document(s)")
assert len(results) == 1, "read should return 1 matching document"
assert results[0]["name"] == "Luna", "document name should be Luna"
print("PASSED\n")

# ------------------------------------------------------------
# Test read with no match
# ------------------------------------------------------------
print("Test: read with no match")
results = shelter.read({"animal_type": "fish"})
print(f"read returned: {results}")
assert results == [], "read with no match should return empty list"
print("PASSED\n")

# ------------------------------------------------------------
# Test count
# ------------------------------------------------------------
print("Test: count")
count = shelter.count({"animal_id": "A999999"})
print(f"count returned: {count}")
assert count == 1, "count should return 1"
print("PASSED\n")

# ------------------------------------------------------------
# Test update
# ------------------------------------------------------------
print("Test: update")
modified = shelter.update({"animal_id": "A999999"}, {"$set": {"color": "White/Orange"}})
print(f"update modified: {modified} document(s)")
assert modified == 1, "update should modify 1 document"

# Verify the change was applied
updated = shelter.read({"animal_id": "A999999"})
assert updated[0]["color"] == "White/Orange", "color should be updated to White/Orange"
print("PASSED\n")

# ------------------------------------------------------------
# Test create_many
# ------------------------------------------------------------
print("Test: create_many")
test_animals = [
    {**test_animal, "rec_num": 999991, "animal_id": "A999991", "name": "Mochi"},
    {**test_animal, "rec_num": 999992, "animal_id": "A999992", "name": "Boba"},
    {**test_animal, "rec_num": 999993, "animal_id": "A999993", "name": "Sushi"},
]
result = shelter.create_many(test_animals)
print(f"create_many returned: {result}")
assert result == True, "create_many should return True"

count = shelter.count({"animal_id": {"$in": ["A999991", "A999992", "A999993"]}})
assert count == 3, "create_many should have inserted 3 documents"
print("PASSED\n")

# ------------------------------------------------------------
# Test update_many
# ------------------------------------------------------------
print("Test: update_many")
modified = shelter.update_many(
    {"animal_id": {"$in": ["A999991", "A999992", "A999993"]}},
    {"$set": {"color": "Black/White"}},
)
print(f"update_many modified: {modified} document(s)")
assert modified == 3, "update_many should modify 3 documents"
print("PASSED\n")

# ------------------------------------------------------------
# Test delete
# ------------------------------------------------------------
print("Test: delete")
deleted = shelter.delete({"animal_id": "A999999"})
print(f"delete removed: {deleted} document(s)")
assert deleted == 1, "delete should remove 1 document"

results = shelter.read({"animal_id": "A999999"})
assert results == [], "document should no longer exist after delete"
print("PASSED\n")

# ------------------------------------------------------------
# Test delete_many
# ------------------------------------------------------------
print("Test: delete_many")
deleted = shelter.delete_many({"animal_id": {"$in": ["A999991", "A999992", "A999993"]}})
print(f"delete_many removed: {deleted} document(s)")
assert deleted == 3, "delete_many should remove 3 documents"

count = shelter.count({"animal_id": {"$in": ["A999991", "A999992", "A999993"]}})
assert count == 0, "all batch test documents should be gone"
print("PASSED\n")

# ------------------------------------------------------------
# All tests passed
# ------------------------------------------------------------
print("All tests passed!")
