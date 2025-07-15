from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import base64

from routers import user, speaker
from utils.file_handler import get_file_path
from voicevox import comment
from schemas.speaker import CommunicationRequest

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターの登録
app.include_router(user.router, tags=["users"])
app.include_router(speaker.router, tags=["speakers"])

@app.get("/icon/{image_name}")
def get_icon(image_name: str):
    image_path = get_file_path("images", image_name)
    if not image_path.exists():
        return {"error": "Image not found"}
    return FileResponse(str(image_path), media_type="image/jpeg")

@app.get("/user_icon/{image_name}")
def get_user_icon(image_name: str):
    image_path = get_file_path("uploaded_icons", image_name)
    if not image_path.exists():
        return {"error": "Image not found"}
    return FileResponse(str(image_path), media_type="image/jpeg")

@app.post("/communication")
async def get_comment(req: CommunicationRequest):
    result = await comment(req.user_input, speaker=req.speaker)
    if not result or result.get("audio") is None:
        return {"error": "音声生成失敗", "status_code": 500}
    
    audio_base64 = base64.b64encode(result["audio"]).decode("utf-8")
    return {
        "text": result["answer"],
        "audio_base64": audio_base64,
        "content_type": "audio/wav"
    }
