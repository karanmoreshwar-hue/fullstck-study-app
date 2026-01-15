from fastapi import FastAPI
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path="backend/.env") # Load env from backend folder if running from root
if not os.getenv("LLM_API_KEY"):
     load_dotenv() # Fallback to default search

from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, llm, courses, admin, analytics, notes
from . import models, database

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Study App API", description="Backend for the Full Stack Study Application")

# CORS Setup
origins = [
    "http://localhost:5173", # Vite default
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(llm.router)
app.include_router(courses.router)
app.include_router(admin.router)
app.include_router(analytics.router)
app.include_router(notes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Study App API"}
