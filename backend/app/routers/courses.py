from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import database, schemas, models, auth
from pydantic import BaseModel

router = APIRouter(
    prefix="/courses",
    tags=["Courses"]
)

@router.get("", response_model=List[schemas.CourseResponse])
def get_courses(db: Session = Depends(database.get_db)):
    # Seed mock courses if empty
    if db.query(models.Course).count() == 0:
        seed_courses = [
            models.Course(title="Advanced React Patterns", description="Master Request", price=4999, image_url="https://via.placeholder.com/300/0f172a/eca338?text=React"),
            models.Course(title="FastAPI Masterclass", description="Build high-performance APIs", price=3999, image_url="https://via.placeholder.com/300/0f172a/eca338?text=FastAPI"),
            models.Course(title="AI Engineering 101", description="Integrate LLMs into apps", price=5999, image_url="https://via.placeholder.com/300/0f172a/eca338?text=AI"),
        ]
        db.add_all(seed_courses)
        db.commit()
        
        # Seed Content
        for course in seed_courses:
            db.refresh(course)
            contents = [
                models.Content(course_id=course.id, title="Welcome to the Course", type="text", data=f"Welcome to {course.title}! Here is your overview."),
                models.Content(course_id=course.id, title="Chapter 1: Getting Started", type="video", data="https://www.youtube.com/watch?v=dQw4w9WgXcQ"), # Placeholder
                models.Content(course_id=course.id, title="Study Notes", type="text", data="1. Key Concept A\n2. Key Concept B\n3. Summary"),
            ]
            db.add_all(contents)
        db.commit()
    return db.query(models.Course).all()

@router.post("/{course_id}/buy")
def buy_course(course_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check already enrolled
    existing = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == current_user.id,
        models.Enrollment.course_id == course_id
    ).first()
    
    if existing:
        return {"message": "Already enrolled"}

    # Mock Payment Logic Checks would go here
    
    enrollment = models.Enrollment(user_id=current_user.id, course_id=course_id)
    db.add(enrollment)
    db.commit()
    
    return {"message": "Course purchased successfully", "course_title": course.title}

@router.get("/my", response_model=List[schemas.CourseResponse])
def get_my_courses(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.user_id == current_user.id).all()
    course_ids = [e.course_id for e in enrollments]
    return db.query(models.Course).filter(models.Course.id.in_(course_ids)).all()

@router.get("/{course_id}/content", response_model=List[schemas.ContentResponse])
def get_course_content(course_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    # Verify enrollment
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == current_user.id,
        models.Enrollment.course_id == course_id
    ).first()
    
    # Allow Owner/Admin to view without enrollment
    if not enrollment and current_user.role not in [models.UserRole.ADMIN, models.UserRole.OWNER]:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")
    
    return db.query(models.Content).filter(models.Content.course_id == course_id).all()
