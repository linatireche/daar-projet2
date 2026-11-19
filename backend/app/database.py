import os
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import DATABASE_URL

engine = None
_SessionFactory = None
Base = declarative_base()


def get_engine():
    global engine, _SessionFactory
    if engine is None:
        retries = 15
        while retries > 0:
            try:
                engine = create_engine(DATABASE_URL, pool_pre_ping=True)
                with engine.connect() as conn:
                    pass
                _SessionFactory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
                print("Connecté avec succès à PostgreSQL !")
                break
            except Exception as e:
                retries -= 1
                if retries == 0:
                    print(f"Warning: PostgreSQL connection failed ({e}). Falling back to SQLite.")
                    engine = create_engine("sqlite:///./data/library.db", connect_args={"check_same_thread": False})
                    _SessionFactory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
                else:
                    print(f"Waiting for database... ({retries} retries left)")
                    time.sleep(2)
    return engine


def get_session():
    global _SessionFactory
    if _SessionFactory is None:
        get_engine()
    return _SessionFactory()


def SessionLocal():
    return get_session()


def get_db():
    db = get_session()
    try:
        yield db
    finally:
        db.close()
