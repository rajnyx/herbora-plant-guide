"""
Herbora Database Models using SQLAlchemy
Supports both SQLite (local development) and Supabase PostgreSQL
"""
import os
import uuid
from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

Base = declarative_base()

class Plant(Base):
    __tablename__ = 'plants'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    slug = Column(String(100), unique=True, nullable=False, index=True)
    common_name = Column(String(150), nullable=False)
    scientific_name = Column(String(150), nullable=False)
    ayurvedic_name = Column(String(150), nullable=True)
    regional_names = Column(JSON, default=list)
    category = Column(String(80), nullable=False, index=True)
    description = Column(Text, nullable=False)
    traditional_uses = Column(Text, nullable=True)
    plant_parts_used = Column(String(200), nullable=True)
    habitat = Column(Text, nullable=True)
    cultivation_information = Column(Text, nullable=True)
    safety_information = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    source_references = Column(JSON, default=list)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    saved_by_users = relationship("UserSavedPlant", back_populates="plant", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "slug": self.slug,
            "common_name": self.common_name,
            "scientific_name": self.scientific_name,
            "ayurvedic_name": self.ayurvedic_name,
            "regional_names": self.regional_names or [],
            "category": self.category,
            "description": self.description,
            "traditional_uses": self.traditional_uses,
            "plant_parts_used": self.plant_parts_used,
            "habitat": self.habitat,
            "cultivation_information": self.cultivation_information,
            "safety_information": self.safety_information,
            "image_url": self.image_url,
            "source_references": self.source_references or [],
            "is_published": self.is_published,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class UserSavedPlant(Base):
    __tablename__ = 'user_saved_plants'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), nullable=False, index=True)
    plant_id = Column(String(36), ForeignKey('plants.id', ondelete='CASCADE'), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    plant = relationship("Plant", back_populates="saved_by_users")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "plant_id": self.plant_id,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "plant": self.plant.to_dict() if self.plant else None
        }


class IdentificationResult(Base):
    __tablename__ = 'plant_identification_results'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), nullable=True)
    predicted_name = Column(String(150), nullable=False)
    scientific_name = Column(String(150), nullable=True)
    confidence_score = Column(Float, nullable=False)
    matched_plant_id = Column(String(36), ForeignKey('plants.id', ondelete='SET NULL'), nullable=True)
    status = Column(String(50), default='completed')
    image_url = Column(String(500), nullable=True)
    botanical_traits = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "predicted_name": self.predicted_name,
            "scientific_name": self.scientific_name,
            "confidence_score": self.confidence_score,
            "matched_plant_id": self.matched_plant_id,
            "status": self.status,
            "image_url": self.image_url,
            "botanical_traits": self.botanical_traits or [],
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class CommunityPost(Base):
    __tablename__ = 'community_posts'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    author_name = Column(String(100), nullable=False)
    plant_name = Column(String(100), nullable=False)
    note = Column(Text, nullable=False)
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "author_name": self.author_name,
            "plant_name": self.plant_name,
            "note": self.note,
            "likes_count": self.likes_count,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Feedback(Base):
    __tablename__ = 'user_feedback'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    rating = Column(Integer, nullable=False)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "rating": self.rating,
            "message": self.message,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


# Database Connection Setup
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///herbora.db')
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
