import os
import shutil
from pathlib import Path
from fastapi import UploadFile

UPLOAD_DIR = "uploaded_icons"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def save_upload_file(file: UploadFile, user_id: int) -> str:
    filename = f"user_{user_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return filename

def delete_upload_file(filename: str) -> None:
    if filename:
        file_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(file_path):
            os.remove(file_path)

def get_file_path(directory: str, filename: str) -> Path:
    base_dir = Path(os.getcwd())
    return base_dir / directory / filename
