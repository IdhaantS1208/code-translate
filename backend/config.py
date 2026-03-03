import os
from dotenv import load_dotenv

load_dotenv()

# API Configuration
API_KEY = os.getenv("ANTHROPIC_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME", "claude-opus-4-6")

# Input limits
MAX_CHARACTERS = 12000
MAX_LINES = 300

# Supported languages
SUPPORTED_LANGUAGES = ["Python", "C", "C++", "Ruby", "Swift"]

# Valid translation pairs
VALID_PAIRS = {
    "Python": ["C++", "Ruby", "Swift"],
    "C":      ["C++", "Python"],
    "C++":    ["C", "Python", "Swift"],
    "Ruby":   ["Python", "Swift"],
    "Swift":  ["C++", "Ruby"],
}