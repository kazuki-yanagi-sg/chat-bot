from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(
    'postgresql://yana:yanasan@localhost:5432/yana_db'
)
sessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
