import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    MAX_RETRIES = 3
    AUDIO_SAMPLE_RATE = 44100
    MAX_CALL_TURNS = 5
    RECORDING_DURATION = 10

    # LLM Models
    CHAT_MODEL = "gpt-4o-mini"
    VOICE_MODEL = "gpt-4o-mini"
    PLANNER_MODEL = "gpt-4o-mini"
    ANALYST_MODEL = "gpt-4o-mini"