from pathlib import Path
import json

from ShiftTerm import ShiftTermDB


# Use a local test DB in the repo so we don't touch system paths
def main():
    db_path = Path("test_shiftterm.db")
    if db_path.exists():
        db_path.unlink()

    db = ShiftTermDB(db_path=db_path)
    print("Initializing DB at:", db.db_path)
    db.init_db()

    # Create a sample phonebook entry
    entry_id = db.phonebook_create(
        display_name="Test BBS",
        host="bbs.example.org",
        port=23,
        protocol="telnet",
        notes="Automated test entry",
        tags=["test", "demo"],
    )
    print("Created phonebook entry id:", entry_id)

    # Show search results
    results = db.phonebook_search(query="Test")
    print("Search results:")
    print(json.dumps(results, indent=2))

    # Fetch the created entry and tags
    entry, tags = db.phonebook_get(entry_id)
    print("Fetched entry:", entry)
    print("Fetched tags:", tags)

    print("Test run complete.")


if __name__ == "__main__":
    main()