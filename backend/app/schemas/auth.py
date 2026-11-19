"""Pydantic schemas for authentication endpoints."""

from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    """Credentials used to register a user."""

    username: str = Field(min_length=1, max_length=50, pattern=r"^[a-zA-Z0-9_.@+-]+$")
    password: str = Field(min_length=6, max_length=72)


class LoginRequest(BaseModel):
    """Credentials used to authenticate a user."""

    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1, max_length=72)


class UserResponse(BaseModel):
    """Public user representation."""

    username: str


class TokenResponse(BaseModel):
    """Bearer access token response."""

    access_token: str
    token_type: str = "bearer"
