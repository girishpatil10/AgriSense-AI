from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://agriai:agriai@localhost:5432/agriai"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    SECRET_KEY: str = "change-me-in-production-use-a-long-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 10

    # LLM
    LLM_PROVIDER: str = "ollama"  # ollama, openai, etc.
    OLLAMA_MODEL: str = "llama3"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    OPENAI_API_KEY: str | None = None
    OPENWEATHERMAP_API_KEY: str | None = None


settings = Settings()
