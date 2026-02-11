from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from api.askbot import start_askbot, askbot

# -------------------------------------------------
# App setup
# -------------------------------------------------
app = FastAPI(title="ASHA AI Backend")

# 🔥 CORS — REQUIRED for localhost:3000 → 8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session context (per patient)
SESSION_CONTEXT = {}

# -------------------------------------------------
# Request models
# -------------------------------------------------
class StartRequest(BaseModel):
    patient_id: str


class ChatRequest(BaseModel):
    patient_id: str
    user_text: str


# -------------------------------------------------
# Routes
# -------------------------------------------------
@app.post("/askbot/start")
def start(req: StartRequest):
    print("🟢 /askbot/start called")
    print("patient_id:", req.patient_id)

    result = start_askbot(req.patient_id)

    if not result or result.get("context") is None:
        print("❌ No patient data found")
        return {
            "error": "Unable to load patient health data"
        }

    # store context for follow-up chat
    SESSION_CONTEXT[req.patient_id] = result["context"]

    print("✅ Context stored for patient")

    return {
        "patient_id": req.patient_id,
        "message": result["message"]
    }


@app.post("/askbot/chat")
def chat(req: ChatRequest):
    print("🟢 /askbot/chat called")
    print("patient_id:", req.patient_id)
    print("user_text:", req.user_text)

    context = SESSION_CONTEXT.get(req.patient_id)

    if context is None:
        print("❌ No context found for patient")
        return {
            "error": "Session expired or AskBot not started"
        }

    reply = askbot(
        user_text=req.user_text,
        context=context
    )

    return {
        "response": reply
    }
