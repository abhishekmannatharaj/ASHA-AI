from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict

# ✅ IMPORT BOT FUNCTIONS HERE
from api.askbot import start_askbot, askbot

# -------------------------
# App
# -------------------------
app = FastAPI(
    title="ASHA AI Backend",
    version="1.0.0",
)

# -------------------------
# CORS
# -------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Request Models
# -------------------------
class InitialAssessmentRequest(BaseModel):
    stored_data: Dict


class ChatRequest(BaseModel):
    message: str


# -------------------------
# Health Check
# -------------------------
@app.get("/")
def health():
    return {"status": "ASHA AI backend running"}

# -------------------------
# Routes
# -------------------------
@app.post("/chat/start")
def start_chat(req: InitialAssessmentRequest):
    reply = start_askbot(req.stored_data)
    return {"reply": reply}


@app.post("/chat")
def chat(req: ChatRequest):
    reply = askbot(req.message)
    return {"reply": reply}
