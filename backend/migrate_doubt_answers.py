import sqlite3

from pathlib import Path


# ============================================================
# DATABASE PATH
# ============================================================

DB_PATH = (
    Path(__file__).parent
    / "silentdoubt.db"
)


# ============================================================
# MIGRATION
# ============================================================

def migrate():

    connection = sqlite3.connect(
        DB_PATH
    )

    cursor = connection.cursor()

    # --------------------------------------------------------
    # GET EXISTING COLUMNS
    # --------------------------------------------------------

    cursor.execute(
        "PRAGMA table_info(doubts)"
    )

    existing_columns = {
        row[1]
        for row in cursor.fetchall()
    }

    # --------------------------------------------------------
    # ANSWER
    # --------------------------------------------------------

    if "answer" not in existing_columns:

        cursor.execute(
            """
            ALTER TABLE doubts
            ADD COLUMN answer TEXT
            """
        )

        print(
            "Added column: answer"
        )

    else:

        print(
            "Column already exists: answer"
        )

    # --------------------------------------------------------
    # ANSWERED BY
    # --------------------------------------------------------

    if "answered_by" not in existing_columns:

        cursor.execute(
            """
            ALTER TABLE doubts
            ADD COLUMN answered_by INTEGER
            """
        )

        print(
            "Added column: answered_by"
        )

    else:

        print(
            "Column already exists: answered_by"
        )

    # --------------------------------------------------------
    # ANSWERED AT
    # --------------------------------------------------------

    if "answered_at" not in existing_columns:

        cursor.execute(
            """
            ALTER TABLE doubts
            ADD COLUMN answered_at DATETIME
            """
        )

        print(
            "Added column: answered_at"
        )

    else:

        print(
            "Column already exists: answered_at"
        )

    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------

    connection.commit()

    connection.close()

    print(
        "Doubt answer migration completed successfully."
    )


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    migrate()