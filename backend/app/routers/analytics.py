from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import database, models, auth

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

# Owner Dependency
def get_current_owner(current_user: models.User = Depends(auth.get_current_active_user)):
    if current_user.role != models.UserRole.OWNER:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_owner)):
    total_users = db.query(models.User).count()
    total_courses = db.query(models.Course).count()
    total_enrollments = db.query(models.Enrollment).count()
    total_revenue = db.query(
        func.sum(models.Course.price)
    ).join(models.Enrollment, models.Enrollment.course_id == models.Course.id).scalar() or 0

    return {
        "total_users": total_users,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "total_revenue": total_revenue
    }
