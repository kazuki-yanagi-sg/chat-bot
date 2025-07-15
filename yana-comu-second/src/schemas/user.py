from pydantic import BaseModel, ConfigDict
from typing import Optional

class UserBase(BaseModel):
    name: str

class UserCreate(UserBase):
    password: str
    role: bool

class UserUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    icon: Optional[str] = None
    role: bool

class LoginRequest(BaseModel):
    name: str
    password: str

class RegistrationRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str
    password: str
    role: int
