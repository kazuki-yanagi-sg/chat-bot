from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import Speaker
from schemas.speaker import SpeakerPromptUpdate
from db import get_async_session

router = APIRouter()

@router.get("/speaker_prompt/{speaker_id}")
async def get_speaker_prompt(speaker_id: int, session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Speaker).where(Speaker.id == speaker_id))
    speaker = result.scalar_one_or_none()
    if not speaker:
        return {"prompt": ""}
    return {"name": speaker.name, "prompt": speaker.prompt}

@router.patch("/speaker_prompt/{speaker_id}")
async def update_speaker_prompt(data: SpeakerPromptUpdate, session: AsyncSession = Depends(get_async_session)):
    speaker = await session.get(Speaker, data.id)
    if not speaker:
        speaker = Speaker(id=data.id, name=data.name, prompt=data.prompt)
        session.add(speaker)
    else:
        speaker.name = data.name
        speaker.prompt = data.prompt
    
    await session.commit()
    return {"message": "プロンプトの編集が完了しました。"}
