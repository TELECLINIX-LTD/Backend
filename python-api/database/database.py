# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker
# from sqlalchemy.orm import declarative_base

# from core.configuration import DATABASE_URL


# DATABASE_URL = DATABASE_URL

# engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# db_session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = declarative_base()


# def get_db():
#     db = db_session()
#     try:
#         yield db
#     finally:
#         db.close()

import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from core.configuration import DATABASE_URL

# Configure the logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Database URL from configuration
DATABASE_URL = DATABASE_URL

# Log the database URL being used (excluding sensitive details)
logger.info("Initializing database engine with the provided DATABASE_URL...")

try:
    # Create the engine
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    logger.info("Database engine created successfully.")
except Exception as e:
    logger.error(f"Failed to create database engine: {e}")
    raise

# Set up the session maker
try:
    db_session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logger.info("Database sessionmaker initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize sessionmaker: {e}")
    raise

# Define the base class for models
Base = declarative_base()

def get_db():
    logger.info("Creating a new database session...")
    db = db_session()
    try:
        yield db
        logger.info("Database session yielded successfully.")
    finally:
        db.close()
        logger.info("Database session closed.")
