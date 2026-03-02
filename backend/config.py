import os
from dotenv import load_dotenv

load_dotenv()

# API Configuration
API_KEY = os.getenv("ANTHROPIC_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME", "claude-haiku-3-5")

# Input limits
MAX_CHARACTERS = 12000
MAX_LINES = 300

# Supported languages
SUPPORTED_LANGUAGES = ["Python", "C", "C++"]