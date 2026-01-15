from backend.app import models, database
# This script basically just calls create_all causing new tables to be created.
# existing tables are untouched in sqlite with create_all
models.Base.metadata.create_all(bind=database.engine)
print("Database schema updated.")
