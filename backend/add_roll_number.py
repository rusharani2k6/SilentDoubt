from sqlalchemy import inspect, text
from app.database import engine

inspector = inspect(engine)

columns = [
    column["name"]
    for column in inspector.get_columns("users")
]

if "roll_number" in columns:
    print("roll_number column already exists.")
else:
    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE users "
                "ADD COLUMN roll_number VARCHAR(50)"
            )
        )

    print("roll_number column added successfully.")