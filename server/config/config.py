import os
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

class Envconfig(BaseModel):
    WEBSOCKETS_PORT: str = os.environ["WEBSOCKETS_PORT"]
    FRONTEND_URL: str = os.environ["FRONTEND_URL"]
    MONGODB_URI: str = os.environ["MONGODB_URI"]
    MONGODB_DATABASE: str = os.environ["MONGODB_DATABASE"]
    MONGODB_USER_COLLECTION: str = os.environ["MONGODB_USER_COLLECTION"]
