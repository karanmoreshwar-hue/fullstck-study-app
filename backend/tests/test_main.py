from fastapi.testclient import TestClient
from app.main import app
from app import models, database
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from sqlalchemy.pool import StaticPool

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

models.Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[database.get_db] = override_get_db

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Study App API"}

def test_register_user():
    response = client.post(
        "/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert "id" in data

def test_login_user():
    # Register first
    client.post(
        "/auth/register",
        json={"username": "testlogin", "email": "login@example.com", "password": "password123"},
    )
    response = client.post(
        "/auth/token",
        data={"username": "testlogin", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
