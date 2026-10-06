"""
Authentication Pydantic Schemas
"""
from pydantic import BaseModel, Field

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str
    password: str = Field(..., min_length=6, max_length=100)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class TokenData(BaseModel):
    user_id: int | None = None
    email: str | None = None
