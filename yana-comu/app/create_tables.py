from models import model
from databases.database import engine

model.Base.metadata.create_all(bind=engine)

