import ollama          # ollama の公式ライブラリを利用
import requests
import json
import tempfile
import os
import subprocess
from sqlalchemy.future import select
from db import async_session
from models import Speaker

async def prepare_prompt_file(speaker_id: int) -> str:
    async with async_session() as session:
        result = await session.execute(select(Speaker).filter(Speaker.id == speaker_id))
        speaker = result.scalars().first()

    if speaker is None:
        return ""

    prompt_content = speaker.prompt

    if prompt_content:
        prompt_dir = "./prompts"
        os.makedirs(prompt_dir, exist_ok=True)
        filepath = os.path.join(prompt_dir, f"prompt_template{speaker_id}.txt")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(prompt_content)
        return filepath
    else:
        return ""

# --- Ollama API へ問い合わせする関数 ---
async def query_ollama(input_text, conversation_history, speaker_id=46):
    prompt_path = await prepare_prompt_file(speaker_id)
    if prompt_path and os.path.exists(prompt_path):
        with open(prompt_path, "r", encoding="utf-8") as f:
            prompt_suffix = f.read().strip()
    else:
        prompt_suffix = "300文字以内で簡潔に答えてください。"

    modified_prompt = f"{input_text}{prompt_suffix}" + "300文字以内で簡潔に答えてください。"
    messages = conversation_history + [{"role": "user", "content": modified_prompt}]

    result = ollama.chat(model="phi4", messages=messages)

    try:
        answer = result['message']['content']
    except (KeyError, IndexError):
        answer = "回答の取得に失敗しました。"

    return answer

# --- VoiceVox の音声合成を行う関数 ---
def get_voicevox_audio(text, speaker=46):
    print(f"🔍 voicevox に送信するデータ: text='{text}', speaker={speaker}")
    
    if not text or not isinstance(speaker, int):
        print("❌ 無効な入力値です")
        return None

    params = {"text": text, "speaker": speaker}
    audio_query_url = "http://localhost:50021/audio_query"
    r = requests.post(audio_query_url, params=params)

    if r.status_code != 200:
        print("❌ audio_query に失敗しました:", r.status_code, r.text)
        return None

    query = r.json()

    synthesis_url = "http://localhost:50021/synthesis"
    headers = {"Content-Type": "application/json"}
    r2 = requests.post(synthesis_url, params={"speaker": speaker}, data=json.dumps(query), headers=headers)

    if r2.status_code != 200:
        print("❌ synthesis に失敗しました:", r2.status_code, r2.text)
        return None

    return r2.content

# --- WAV 音声を再生する関数 ---
# def play_audio(audio_data):
#     """
#     audio_data: WAV データのバイナリ
#     """
#     # 一時ファイルに書き出して再生（simpleaudio を利用）
#     with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as f:
#         f.write(audio_data)
#         filename = f.name
#     try:
#         subprocess.run(["ffplay", "-nodisp", "-autoexit", "-loglevel", "quiet", filename])
#     except Exception as e:
#         print("音声再生に失敗しました:", e)
#     finally:
#         os.remove(filename)

conversation_history = []  # 過去の会話を保持するリスト

# --- メインの対話ループ ---
async def comment(user_input: str, speaker: int):
    global conversation_history
    
    # ユーザーの入力を会話履歴に追加
    conversation_history.append({"role": "user", "content": user_input})
    
    # ollama ライブラリを用いて問い合わせ（モデル: phi4）
    answer = await query_ollama(user_input, conversation_history, speaker)
    print("AI の回答: ", answer)
    conversation_history.append({"role": "assistant", "content": answer})
    
    # VoiceVox により音声合成し再生
    audio = get_voicevox_audio(answer, speaker)
    # if audio:
    #     play_audio(audio)
    return {"answer": answer, "audio": audio}
