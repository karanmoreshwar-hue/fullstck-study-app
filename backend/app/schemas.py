from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: str = "student"

class UserResponse(UserBase):
    id: int
    is_active: bool
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class ChatMessageBase(BaseModel):
    role: str
    content: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    id: int
    session_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class StudySessionBase(BaseModel):
    topic: str

class StudySessionCreate(StudySessionBase):
    pass

class StudySessionResponse(StudySessionBase):
    id: int
    created_at: datetime
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    session_id: Optional[int] = None
    topic: Optional[str] = None
    message: str

class CourseBase(BaseModel):
    title: str
    description: str
    price: int
    image_url: str

class CourseCreate(CourseBase):
    pass

class CourseResponse(CourseBase):
    id: int

    class Config:
        from_attributes = True

class ContentBase(BaseModel):
    title: str
    type: str # 'video' or 'text'
    data: str

class ContentCreate(ContentBase):
    pass

class ContentResponse(ContentBase):
    id: int
    course_id: int

    class Config:
        from_attributes = True
