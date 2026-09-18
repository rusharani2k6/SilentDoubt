import os


class Settings:
    PROJECT_NAME: str = "SilentDoubt"

    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "change-this-in-production"
    )

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./silentdoubt.db"
    )

    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173"
        ).split(",")
        if origin.strip()
    ]


settings = Settings()