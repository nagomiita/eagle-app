from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database Configuration
    db_path: Path = Field(
        default=Path("./data/eagle.db"),
        description="Path to the SQLite database file"
    )

    # Application Configuration
    app_name: str = Field(
        default="Eagle App Backend",
        description="Application name"
    )
    debug: bool = Field(
        default=False,
        description="Debug mode"
    )

    # API Configuration
    api_v1_prefix: str = Field(
        default="/api/v1",
        description="API v1 prefix"
    )

    # Image Configuration
    image_dir: Path = Field(
        default=Path("./images"),
        description="Directory where images are stored"
    )

    # Localization Configuration
    language: str = Field(
        default="ja",
        description="Default language for translations (e.g., 'ja', 'en')"
    )


# Create a global settings instance
settings = Settings()

# Export constants for backward compatibility
DB_PATH = settings.db_path
IMAGE_DIR = settings.image_dir
LANGUAGE = settings.language
