import os

class Settings:
    DEMO_SEED: int = int(os.getenv("DEMO_SEED", "42"))
    MODEL_DIR: str = os.getenv("MODEL_DIR", os.path.join(os.path.dirname(__file__), "..", "saved_models"))
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()

# Ensure model directory exists
os.makedirs(settings.MODEL_DIR, exist_ok=True)

