from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from .database import Base
import datetime
import enum

class UserRole(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    STUDENT = "student"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String, default=UserRole.STUDENT)

    study_sessions = relationship("StudySession", back_populates="owner")
    notes = relationship("Note", back_populates="owner")

class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="study_sessions")
    messages = relationship("ChatMessage", back_populates="session")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("study_sessions.id"))
    role = Column(String) # "user" or "ai"
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("StudySession", back_populates="messages")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    price = Column(Integer) # In cents
    image_url = Column(String)

    contents = relationship("Content", back_populates="course")

class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    title = Column(String)
    type = Column(String) # "video", "note"
    data = Column(Text) # URL or text content

    course = relationship("Course", back_populates="contents")

class Enrollment(Base):
    __tablename__ = "enrollments"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id"), primary_key=True)
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="notes")

