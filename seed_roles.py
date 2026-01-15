from backend.app import models, database, auth

def create_role_users():
    models.Base.metadata.create_all(bind=database.engine)
    db = database.SessionLocal()
    
    roles = [
        {"username": "admin", "email": "admin@example.com", "role": models.UserRole.ADMIN},
        {"username": "owner", "email": "owner@example.com", "role": models.UserRole.OWNER},
        {"username": "demo", "email": "demo@example.com", "role": models.UserRole.STUDENT}
    ]

    for data in roles:
        existing = db.query(models.User).filter(models.User.username == data["username"]).first()
        if not existing:
            hashed = auth.get_password_hash("password")
            user = models.User(
                username=data["username"], 
                email=data["email"], 
                hashed_password=hashed,
                role=data["role"]
            )
            db.add(user)
            db.commit()
            print(f"Created {data['role']} user: {data['username']} / password")
        else:
            print(f"User {data['username']} already exists")

    db.close()

if __name__ == "__main__":
    create_role_users()
