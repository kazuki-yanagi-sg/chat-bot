from fastapi import FastAPI, Query, Depends, HTTPException, File, UploadFile, status, Form
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import base64
from io import BytesIO
from fastapi.middleware.cors import CORSMiddleware
import os
from pathlib import Path
from databases.database import sessionLocal
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import select
from passlib.context import CryptContext
from passlib.hash import sha256_crypt  # パスワードハッシュに使用
from models import User, Speaker  # models.pyで定義しておく
from db import get_async_session
import shutil
from typing import List
from datetime import datetime, timedelta, timezone

from voicevox import comment

class CommunicationRequest(BaseModel):
    user_input: str
    speaker: int

class UserUpdateRequest(BaseModel):
    name: str | None = None
    icon: str | None = None

SECRET_KEY = "your-very-secret-key-that-is-long-and-random" 
ALGORITHM = "HS256"

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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

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
        # 👇 --- ここからトークン生成処理を追加 ---
        print("✅ ログイン成功、トークンを生成します")
        
        # トークンの有効期限を設定 (例: 60分)
        expire = datetime.now(timezone.utc) + timedelta(minutes=60)
        
        # トークンに含めるデータ (ペイロード)
        to_encode = {
            "sub": str(user.id), # ユーザーIDを 'sub' クレームとして含めるのが標準
            "exp": expire,
        }
        # トークンを生成
        access_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        # 👈 返却するデータに access_token を追加
    except Exception as e:
        print("🔴 例外:", e)
        raise HTTPException(status_code=401, detail="Hash error")

    print("✅ ログイン成功")
    return {"message": "ログイン成功",
            "access_token": access_token,
            "token_type": "bearer",
            "user_name": user.name,
            "user_id": user.id,
            "user_icon": user.icon,
            "user_role": user.role
            }

class SignupRequest(BaseModel):
    name: str
    password: str
    role: bool

@app.post("/signup")
async def signup(data: SignupRequest, session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(User).where(User.name == data.name))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(status_code=400, detail="このユーザー名は既に使われています")

    hashed_pw = sha256_crypt.hash(data.password)
    new_user = User(name=data.name, password=hashed_pw, role=False)

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

# --- 既存のトークン検証関数 (get_current_user) があると仮定 ---
# もし無ければ、トークンからユーザーIDをデコードし、DBからユーザー情報を取得する
# 関数を先に作成してください。

async def get_current_user(token: str = Depends(oauth2_scheme), session: AsyncSession = Depends(get_async_session)):
    # (ここにトークンをデコードしてユーザーを返すロジック)
    # ...
    # 例
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await session.get(User, user_id)
    if user is None:
        raise credentials_exception
    return user

# 👇 新しく管理者確認用の依存関係を作成
async def get_current_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.role: # roleがTrueでない場合
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Operation not permitted"
        )
    return current_user

# --- レスポンス用のPydanticモデルを定義 ---
# パスワードハッシュなど、不要な情報をフロントに送らないようにするため
class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    icon: str | None
    role: bool

# 👇 新しいエンドポイント
@app.get("/users", response_model=List[UserResponse])
async def get_all_users(
    session: AsyncSession = Depends(get_async_session),
    current_admin: User = Depends(get_current_admin_user) # 👈 管理者のみアクセス可能
):
    """
    登録されている全てのユーザー情報を取得する (管理者専用)
    """
    stmt = select(User).order_by(User.id)
    result = await session.execute(stmt)
    users = result.scalars().all()
    return users

class RegistrationRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str
    password: str
    role: int


@app.post("/users")
async def signup(data: RegistrationRequest, session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(User).where(User.name == data.name))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(status_code=400, detail="このユーザー名は既に使われています")

    hashed_pw = sha256_crypt.hash(data.password)
    new_user = User(name=data.name, password=hashed_pw, role=data.role)

    session.add(new_user)
    await session.commit()

    return {"message": "ユーザー登録完了"}

@app.patch("/users/{user_id}")
async def update_user_by_admin(
    user_id: int,
    name: str = Form(...),
    role: bool = Form(...),
    icon: UploadFile = File(None),
    session: AsyncSession = Depends(get_async_session)
):
    # 対象ユーザーの取得
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")

    # 名前が変更された場合、重複チェック
    if name != user.name:
        dup_result = await session.execute(select(User).where(User.name == name))
        if dup_result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="このユーザー名は既に使用されています")

    # 更新処理
    user.name = name
    user.role = role

    if icon:
        ext = os.path.splitext(icon.filename)[1]
        icon_filename = f"user_{user_id}{ext}"
        icon_path = f"uploaded_icons/{icon_filename}"
        with open(icon_path, "wb") as buffer:
            shutil.copyfileobj(icon.file, buffer)
        user.icon = icon_filename

    await session.commit()
    return {"message": "ユーザー情報を更新しました"}

@app.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")

    # アイコンがある場合、ファイルも削除
    if user.icon:
        icon_path = f"static/user_icon/{user.icon}"
        if os.path.exists(icon_path):
            os.remove(icon_path)

    await session.delete(user)
    await session.commit()

    return {"message": "ユーザーを削除しました"}

@app.get("/speaker_prompt/{speaker_id}")
async def get_speaker_prompt(speaker_id: int, session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Speaker).where(Speaker.id == speaker_id))
    speaker = result.scalar_one_or_none()
    if not speaker:
        return {"prompt": ""}
    return {"name": speaker.name, "prompt": speaker.prompt}

@app.put("/speaker_prompt/{speaker_id}")
async def update_speaker_prompt(speaker_id: int, session: AsyncSession = Depends(get_async_session)):
    return {"message": "プロンプトの編集が完了しました。"}
