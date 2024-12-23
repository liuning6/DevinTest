from pydantic import BaseModel
from typing import List, Optional

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class StudentBase(BaseModel):
    name: str
    student_id: str

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    id: int

    class Config:
        from_attributes = True

class GradeBase(BaseModel):
    subject: str
    score: float

class GradeCreate(GradeBase):
    pass

class Grade(GradeBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True
