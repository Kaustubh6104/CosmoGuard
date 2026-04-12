"""
DisasterShield Data Models
Defines the database schema for users and other entities.
"""
from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class User(Base):
    """User model for storing profile and location data."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    city = Column(String)
