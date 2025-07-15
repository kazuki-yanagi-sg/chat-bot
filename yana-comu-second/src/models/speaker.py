from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base

from db import Base  # db.pyからBaseを使う！

class Speaker(Base):
    __tablename__ = "speakers"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    prompt = Column(String, default="")
