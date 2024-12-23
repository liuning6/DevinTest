import logging
from datetime import timedelta
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    force=True
)
logger = logging.getLogger(__name__)
# Set logging level for SQLAlchemy
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# Import database, models, and schemas
from .database import get_db, init_db, Base, engine
from . import models, schemas, auth

# Create FastAPI app after models are imported
app = FastAPI()

# Initialize database tables
init_db()
logger.info("Database initialized during module import")

@app.on_event("startup")
async def startup_event():
    logger.info("Starting application initialization...")
    try:
        # Ensure models are imported
        from . import models
        logger.info("Models imported successfully")
        
        # Initialize database
        init_db()
        logger.info("Database initialized successfully")
        
        # Seed initial data
        from .seed import seed_data
        seed_data()
        logger.info("Initial data seeded successfully")
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")
        raise

# Initialize models
from . import models, schemas, auth

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Authentication endpoints
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# User endpoints
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if user already exists
        existing_user = db.query(models.User).filter(
            models.User.username == user.username
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Username already registered"
            )
        
        # Create new user
        db_user = models.User(
            username=user.username,
            email=user.email,
            hashed_password=auth.get_password_hash(user.password)
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        print(f"Error creating user: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error creating user: {str(e)}"
        )

# Student endpoints
@app.post("/students/", response_model=schemas.Student)
def create_student(
    student: schemas.StudentCreate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    db_student = models.Student(**student.dict())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@app.get("/students/", response_model=List[schemas.Student])
def get_students(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    students = db.query(models.Student).offset(skip).limit(limit).all()
    return students

@app.get("/students/{student_id}", response_model=schemas.Student)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

# Grade endpoints
@app.post("/students/{student_id}/grades", response_model=schemas.Grade)
def create_grade(
    student_id: int,
    grade: schemas.GradeCreate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    # Verify student exists
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    try:
        db_grade = models.Grade(**grade.dict(), student_id=student_id)
        db.add(db_grade)
        db.commit()
        db.refresh(db_grade)
        return db_grade
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating grade: {str(e)}")

@app.get("/students/{student_id}/grades", response_model=List[schemas.Grade])
def get_student_grades(
    student_id: int,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    # Verify student exists
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    grades = db.query(models.Grade).filter(models.Grade.student_id == student_id).all()
    logger.info(f"Retrieved {len(grades)} grades for student {student_id}")
    return grades

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
