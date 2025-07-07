from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)  # 事前にハッシュ化した文字列
    icon = Column(String, nullable=True)

# DB接続設定
DATABASE_URL = "postgresql+asyncpg://yana:yanasan@localhost:5432/yana_db"
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = async_sessionmaker(engine, expire_on_commit=False)

async def get_async_session():
    async with async_session() as session:
        yield session
