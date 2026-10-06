"""
Users Router
Endpoints for user directory listing and profile inspections.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.user import UserResponse
from backend.app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db)):
    """List all registered users (for receiver picker and user directory)."""
    users = db.query(User).order_by(User.name.asc()).all()
    return users

@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
