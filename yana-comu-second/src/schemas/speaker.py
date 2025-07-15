from pydantic import BaseModel

class CommunicationRequest(BaseModel):
    user_input: str
    speaker: int

class SpeakerPromptUpdate(BaseModel):
    id: int
    name: str
    prompt: str
