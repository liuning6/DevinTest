import logging
from .database import SessionLocal
from . import models

logger = logging.getLogger(__name__)

def verify_seeded_data():
    """Verify that test data exists in the database"""
    db = SessionLocal()
    try:
        # Check users
        users = db.query(models.User).all()
        logger.info(f"Found {len(users)} users")
        
        # Check students
        students = db.query(models.Student).all()
        logger.info(f"Found {len(students)} students")
        for student in students:
            logger.info(f"Student: {student.name} (ID: {student.student_id})")
            
            # Check grades for each student
            grades = db.query(models.Grade).filter(models.Grade.student_id == student.id).all()
            logger.info(f"Found {len(grades)} grades for student {student.name}")
            for grade in grades:
                logger.info(f"Grade: {grade.subject} - {grade.score}")
                
    except Exception as e:
        logger.error(f"Error verifying seeded data: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    verify_seeded_data()
