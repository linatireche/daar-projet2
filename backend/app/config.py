import os

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+psycopg2://daar_user:daar_password@db:5432/daar_library"
)
DATA_DIR = os.getenv("DATA_DIR", "./data")
TARGET_BOOK_COUNT = int(os.getenv("TARGET_BOOK_COUNT", "1665"))
MIN_WORD_COUNT = int(os.getenv("MIN_WORD_COUNT", "10000"))
