import ollama          # ollama の公式ライブラリを利用
import requests
import json
import tempfile
import os
import subprocess

# --- Ollama API へ問い合わせする関数 ---
def query_ollama(prompt, conversation_history):
    """
    prompt: ユーザーの新規質問
    conversation_history: これまでの会話履歴（例: [{"role": "user", "content": "質問内容"}, {"role": "assistant", "content": "回答内容"}]）
    
    ※ この例では、ollama ライブラリの chat 関数を利用し、モデルとして "phi4" を指定しています。
    """
    # 最新の質問を含む会話リストを作成
    modified_prompt = f"{prompt}(300文字以内で簡潔に答えてください。)またあなたは知的な女の子として振る舞います。"
    messages = conversation_history + [{"role": "user", "content": modified_prompt}]
    
    # モデル "phi4" を指定して問い合わせ
    # ※ 以下の呼び出しは、ollama ライブラリのインターフェースに合わせてください。
    result = ollama.chat(model="phi4", messages=messages)
    
    # ※ レスポンス形式は、ollama ライブラリのバージョンに合わせて調整してください。
    try:
        answer = result['message']['content']
    except (KeyError, IndexError):
        answer = "申し訳ありません。回答の取得に失敗しました。"
    
    return answer

# --- VoiceVox の音声合成を行う関数 ---
def get_voicevox_audio(text, speaker=46):
    """
    text: 読み上げるテキスト
    speaker: VoiceVox のスピーカー番号（ここではずんだもんの例として 3 を指定）
    """
    # 1. audio_query エンドポイントで合成用パラメータを取得
    params = {"text": text, "speaker": speaker}
    audio_query_url = "http://localhost:50021/audio_query"
    r = requests.post(audio_query_url, params=params)
    if r.status_code != 200:
        print("audio_query に失敗しました:", r.text)
        return None
    
    query = r.json()
    
    # 2. synthesis エンドポイントで音声合成
    synthesis_url = "http://localhost:50021/synthesis"
    headers = {"Content-Type": "application/json"}
    r2 = requests.post(synthesis_url, params={"speaker": speaker}, data=json.dumps(query), headers=headers)
    if r2.status_code != 200:
        print("synthesis に失敗しました:", r2.text)
        return None
    
    return r2.content  # WAV バイナリデータ

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
def comment(user_input: str):
    global conversation_history
    
    # ユーザーの入力を会話履歴に追加
    conversation_history.append({"role": "user", "content": user_input})
    
    # ollama ライブラリを用いて問い合わせ（モデル: phi4）
    answer = query_ollama(user_input, conversation_history)
    print("AI の回答: ", answer)
    conversation_history.append({"role": "assistant", "content": answer})
    
    # VoiceVox により音声合成し再生
    audio = get_voicevox_audio(answer, speaker=46)
    # if audio:
    #     play_audio(audio)
    return {"answer": answer, "audio": audio}
