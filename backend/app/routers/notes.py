from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import database, schemas, models, auth
from pydantic import BaseModel, ConfigDict
import datetime

router = APIRouter(
    prefix="/notes",
    tags=["Notes"]
)

class NoteBase(BaseModel):
    title: str
    content: str

class NoteCreate(NoteBase):
    pass

class NoteResponse(NoteBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

@router.get("", response_model=List[NoteResponse])
def get_notes(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    return db.query(models.Note).filter(models.Note.user_id == current_user.id).all()

@router.post("", response_model=NoteResponse)
def create_note(note: NoteCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_note = models.Note(**note.model_dump(), user_id=current_user.id)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@router.put("/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, note: NoteCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == current_user.id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db_note.title = note.title
    db_note.content = note.content
    db.commit()
    db.refresh(db_note)
    return db_note

@router.delete("/{note_id}")
def delete_note(note_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == current_user.id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(db_note)
    db.commit()
    return {"message": "Note deleted"}
