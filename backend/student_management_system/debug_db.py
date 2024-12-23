from app.database import engine, Base, init_db
from app.models import User, Student, Grade
from app.auth import get_password_hash
from sqlalchemy import inspect
from sqlalchemy.orm import Session
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_data():
    # Initialize database
    init_db()
    logger.info("Database initialized")

    # Create session
    session = Session(engine)
    try:
        # Create test user if not exists
        test_user = session.query(User).filter(User.username == "testuser").first()
        if not test_user:
            test_user = User(
                username="testuser",
                email="test@example.com",
                hashed_password=get_password_hash("testpass123"),
                is_active=True
            )
            session.add(test_user)
            session.commit()
            logger.info("Test user created successfully")

        # Create test students with grades
        test_students = [
            {"name": "John Doe", "student_id": "STU001"},
            {"name": "Jane Smith", "student_id": "STU002"},
            {"name": "Bob Johnson", "student_id": "STU003"}
        ]

        for student_data in test_students:
            existing_student = session.query(Student).filter(
                Student.student_id == student_data["student_id"]
            ).first()

            if not existing_student:
                student = Student(**student_data)
                session.add(student)
                session.commit()
                logger.info(f"Created student: {student_data['name']}")

                # Add grades for the student
                test_grades = [
                    {"subject": "Math", "score": 95.5},
                    {"subject": "Science", "score": 88.0},
                    {"subject": "History", "score": 92.0}
                ]

                for grade_data in test_grades:
                    grade = Grade(student_id=student.id, **grade_data)
                    session.add(grade)

                session.commit()
                logger.info(f"Added grades for student: {student_data['name']}")

        logger.info("Data seeding completed successfully")

    except Exception as e:
        logger.error(f"Error during data seeding: {str(e)}")
        session.rollback()
        raise
    finally:
        session.close()
        logger.info("Database connection closed")

if __name__ == "__main__":
    seed_data()
