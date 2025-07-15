from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from models import User
from schemas.user import UserCreate, UserUpdate, UserResponse, LoginRequest, RegistrationRequest
from db import get_async_session
from auth.auth import (
    get_current_user,
    get_current_admin_user,
    verify_password,
    create_access_token,
    get_password_hash,
)
from utils.file_handler import save_upload_file, delete_upload_file

router = APIRouter()

@router.post("/login")
async def login(data: LoginRequest, session: AsyncSession = Depends(get_async_session)):
    stmt = select(User).where(User.name == data.name)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid password")
        
    access_token = create_access_token({"sub": str(user.id)})

    return {
        "message": "ログイン成功",
        "access_token": access_token,
        "token_type": "bearer",
        "user_name": user.name,
        "user_id": user.id,
        "user_icon": user.icon,
        "user_role": user.role
    }

@router.post("/signup")
async def signup(data: UserCreate, session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(User).where(User.name == data.name))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="このユーザー名は既に使われています")

    new_user = User(
        name=data.name,
        password=get_password_hash(data.password),
        role=data.role
    )
    session.add(new_user)
    await session.commit()
    return {"message": "ユーザー登録完了"}

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    session: AsyncSession = Depends(get_async_session),
    _: User = Depends(get_current_admin_user)
):
    stmt = select(User).order_by(User.id)
    result = await session.execute(stmt)
    return result.scalars().all()

@router.put("/user/{user_id}")
async def update_user(
    user_id: int,
    data: UserUpdate,
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id and not current_user.role:
        raise HTTPException(status_code=403, detail="権限がありません")

    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")

    if data.name and data.name != user.name:
        check = await session.execute(select(User).where(User.name == data.name, User.id != user_id))
        if check.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="このユーザー名は既に使われています")
        user.name = data.name

    if data.icon:
        user.icon = data.icon

    await session.commit()
    return {"message": "ユーザー情報を更新しました"}

@router.patch("/users/{user_id}")
async def update_user_by_admin(
    user_id: int,
    name: str = Form(...),
    role: bool = Form(...),
    icon: UploadFile = File(None),
    session: AsyncSession = Depends(get_async_session),
    _: User = Depends(get_current_admin_user)
):
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")

    if name != user.name:
        dup_result = await session.execute(select(User).where(User.name == name))
        if dup_result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="このユーザー名は既に使用されています")

    user.name = name
    user.role = role

    if icon:
        if user.icon:
            delete_upload_file(user.icon)
        user.icon = await save_upload_file(icon, user_id)

    await session.commit()
    return {"message": "ユーザー情報を更新しました"}

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    session: AsyncSession = Depends(get_async_session),
    _: User = Depends(get_current_admin_user)
):
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")

    if user.icon:
        delete_upload_file(user.icon)

    await session.delete(user)
    await session.commit()
    return {"message": "ユーザーを削除しました"}
