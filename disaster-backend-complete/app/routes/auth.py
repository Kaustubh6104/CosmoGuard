from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models import User
import hashlib

router = APIRouter()

class UserCreate(BaseModel):
    username: str
    password: str
    lat: float
    lng: float
    city: str

class UserLogin(BaseModel):
    username: str
    password: str

def hash_password(password: str) -> str:
    # simple hash for prototyping, production should use bcrypt/argon2
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = hash_password(user.password)
    new_user = User(
        username=user.username,
        password_hash=hashed_password,
        lat=user.lat,
        lng=user.lng,
        city=user.city
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully", "user_id": new_user.id}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    if db_user.password_hash != hash_password(user.password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
        
    return {
        "user_id": db_user.id,
        "username": db_user.username,
        "lat": db_user.lat,
        "lng": db_user.lng,
        "city": db_user.city
    }
