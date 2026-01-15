from backend.app import models, database, auth
import sys

def create_user():
    db = database.SessionLocal()
    username = "demo"
    email = "demo@example.com"
    password = "password"
    
    existing = db.query(models.User).filter(models.User.username == username).first()
    if existing:
        print(f"User {username} already exists")
        db.close()
        return

    try:
        hashed = auth.get_password_hash(password)
        user = models.User(username=username, email=email, hashed_password=hashed)
        db.add(user)
        db.commit()
        print(f"Created user: {username} / {password}")
    except Exception as e:
        print(f"Error creating user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_user()
