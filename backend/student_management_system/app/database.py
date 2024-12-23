import logging
from sqlalchemy import create_engine, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Configure database URL based on environment
import os

ENV = os.getenv("ENV", "development")
if ENV == "production":
    POSTGRES_URL = os.getenv("POSTGRES_URL", "postgresql://postgres:postgres@localhost:5432/student_management")
    DATABASE_URL = POSTGRES_URL
else:
    DATABASE_URL = "sqlite:///./student_management.db"

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create engine and session
connect_args = {"check_same_thread": False} if ENV == "development" else {}
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=True  # Enable SQL logging
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for declarative models
Base = declarative_base()

# Import models here to ensure they're registered with Base
from . import models

def init_db():
    try:
        logger.info("Starting database initialization...")
        logger.info(f"Registered models: {[cls.__name__ for cls in Base.__subclasses__()]}")
        
        # Create tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Verify tables exist
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        logging.info(f"Available tables: {tables}")
        
        # Log table details
        for table in tables:
            columns = inspector.get_columns(table)
            logging.info(f"Table {table} columns: {[col['name'] for col in columns]}")
    except Exception as e:
        logging.error(f"Error initializing database: {str(e)}")
        logging.error(f"Error details: {str(e.__class__.__name__)}: {str(e)}")
        raise

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
