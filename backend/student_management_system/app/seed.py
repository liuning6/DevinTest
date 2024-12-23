from sqlalchemy.orm import Session
from . import models, auth
from .database import SessionLocal, init_db
import logging

logger = logging.getLogger(__name__)

def seed_data():
    logger.info("Starting data seeding...")
    db = SessionLocal()
    try:
        # Create test user if it doesn't exist
        test_user = db.query(models.User).filter(models.User.username == "testuser").first()
        if not test_user:
            test_user = models.User(
                username="testuser",
                email="test@example.com",
                hashed_password=auth.get_password_hash("testpass123"),
                is_active=True
            )
            db.add(test_user)
            db.commit()
            logger.info("Created test user")

        # Create test students if they don't exist
        test_students = [
            {"name": "John Doe", "student_id": "STU001"},
            {"name": "Jane Smith", "student_id": "STU002"},
            {"name": "Bob Johnson", "student_id": "STU003"}
        ]
        
        for student_data in test_students:
            existing_student = db.query(models.Student).filter(
                models.Student.student_id == student_data["student_id"]
            ).first()
            
            if not existing_student:
                student = models.Student(**student_data)
                db.add(student)
                db.commit()
                
                # Add some test grades for each student
                test_grades = [
                    {"subject": "Math", "score": 95.5},
                    {"subject": "Science", "score": 88.0},
                    {"subject": "History", "score": 92.0}
                ]
                
                for grade_data in test_grades:
                    grade = models.Grade(**grade_data, student_id=student.id)
                    db.add(grade)
                
                db.commit()
                logger.info(f"Created test student {student_data['name']} with grades")
        
        logger.info("Data seeding completed successfully")
    
    except Exception as e:
        logger.error(f"Error during data seeding: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()
