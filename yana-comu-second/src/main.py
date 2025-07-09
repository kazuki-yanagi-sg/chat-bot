from fastapi import FastAPI, Query, Depends, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import base64
from io import BytesIO
from fastapi.middleware.cors import CORSMiddleware
import os
from pathlib import Path
from databases.database import sessionLocal
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import select
from passlib.hash import sha256_crypt  # パスワードハッシュに使用
from models.model import User, get_async_session  # models.pyで定義しておく
import shutil

from voicevox import comment

class CommunicationRequest(BaseModel):
    user_input: str
    speaker: int

class UserUpdateRequest(BaseModel):
    name: str | None = None
    icon: str | None = None

UPLOAD_DIR = "uploaded_icons"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ReactのURL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/icon/{image_name}")
def get_icon(image_name: str):
    base_dir = Path(os.getcwd())
    image_path = base_dir / "images" / image_name

    if not image_path.exists():
        return {"error" : "Image not found"}
    return FileResponse(str(image_path), media_type="image/jpeg")

@app.get("/user_icon/{image_name}")
def get_icon(image_name: str):
    base_dir = Path(os.getcwd())
    image_path = base_dir / "uploaded_icons" / image_name

    print(image_path)

    if not image_path.exists():
        return {"error" : "Image not found"}
    return FileResponse(str(image_path), media_type="image/jpeg")

@app.post("/communication")
def get_comment(req: CommunicationRequest):
    result = comment(req.user_input, speaker=req.speaker)
    if not result or result.get("audio") is None:
        return JSONResponse(content={"error": "音声生成失敗"}, status_code=500)
    # Base64 にエンコードして返す
    audio_base64 = base64.b64encode(result["audio"]).decode("utf-8")
    return {
        "text": result["answer"],
        "audio_base64": audio_base64,
        "content_type": "audio/wav"
    }

class LoginRequest(BaseModel):
    name: str
    password: str

@app.post("/login")
async def login(data: LoginRequest, session: AsyncSession = Depends(get_async_session)):
    print("🟡 リクエスト受信:", data.name, data.password)

    stmt = select(User).where(User.name == data.name)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        print("🔴 ユーザーが存在しません")
        raise HTTPException(status_code=401, detail="User not found")

    print("🟢 DBから取得したハッシュ:", user.password)

    try:
        if not sha256_crypt.verify(data.password, user.password.strip()):
            print("🔴 パスワード不一致")
            raise HTTPException(status_code=401, detail="Invalid password")
    except Exception as e:
        print("🔴 例外:", e)
        raise HTTPException(status_code=401, detail="Hash error")

    print("✅ ログイン成功")
    return {"message": "ログイン成功", "user_name": user.name, "user_id": user.id, "user_icon": user.icon}

class SignupRequest(BaseModel):
    name: str
    password: str

@app.post("/signup")
async def signup(data: SignupRequest, session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(User).where(User.name == data.name))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(status_code=400, detail="このユーザー名は既に使われています")

    hashed_pw = sha256_crypt.hash(data.password)
    new_user = User(name=data.name, password=hashed_pw)

    session.add(new_user)
    await session.commit()

    return {"message": "ユーザー登録完了"}

@app.put("/user/{user_id}")
async def upload_name(user_id: int, data: UserUpdateRequest, session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    # 名前の更新があればチェック・反映
    if data.name:
        # ユーザー名が他に使われていないかチェック
        check = await session.execute(select(User).where(User.name == data.name, User.id != user_id))
        if check.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="このユーザー名は既に使われています")
        user.name = data.name

    # アイコン名の更新
    if data.icon:
        user.icon = data.icon

    await session.commit()
    return {"message": "ユーザー情報を更新しました"}   

@app.post("/upload_icon/{user_id}")
async def upload_icon(user_id: int, file: UploadFile = File(...), session: AsyncSession = Depends(get_async_session)):
    # ファイル保存
    filename = f"user_{user_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # DBのユーザーに画像ファイル名を登録
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    user.icon = filename
    await session.commit()

    return {"message": "アイコン画像をアップロードしました", "filename": filename}
