# chat-bot

## 概要

このプロジェクトは、FastAPI（バックエンド）と React（フロントエンド）を用いて構築された、AI と対話可能なチャットボットアプリケーションです。  
VoiceVox による音声合成、および Ollama によるローカル LLM 推論を組み合わせることで、視覚と聴覚の両方から対話体験を提供します。

---

## 技術スタック

- **バックエンド**: FastAPI
- **フロントエンド**: React + TypeScript
- **AI モデル**: Ollama (例: LLaMA3, Mistral など)
- **音声合成**: VoiceVox
- **データベース**: PostgreSQL
- **認証**: ユーザーログイン / サインアップ機能

---

## インストール

### 前提条件

- Node.js (v18 以上推奨)
- Python (3.10 以上)
- Docker & Docker Compose
- VoiceVox エンジン（ローカルで起動済み）
- Ollama（ローカルに LLM モデルをダウンロード済み）
- PostgreSQL

### セットアップ手順

#### 1. リポジトリをクローン

```bash
git clone https://github.com/kazuki-yanagi-sg/chat-bot
cd yana-comu
```

#### 2. バックエンド環境構築

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### 3. フロントエンド環境構築

```bash

cd src
npm install
npm run dev
```
