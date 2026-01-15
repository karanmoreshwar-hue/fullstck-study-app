from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import database, schemas, models, auth
from pydantic import BaseModel

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# Admin Dependency
def get_current_admin(current_user: models.User = Depends(auth.get_current_active_user)):
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.OWNER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

class ContentCreate(BaseModel):
    title: str
    type: str # video, note
    data: str

@router.post("/courses", response_model=schemas.CourseResponse)
def create_course(course: schemas.CourseCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin)):
    db_course = models.Course(**course.dict())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.post("/courses/{course_id}/content")
def add_content(course_id: int, content: ContentCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    db_content = models.Content(course_id=course_id, **content.dict())
    db.add(db_content)
    db.commit()
    return {"message": "Content added successfully"}
