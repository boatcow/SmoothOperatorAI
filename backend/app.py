from fastapi import FastAPI, Request, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from voice_server import router as voice_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(voice_router)

import json
from twilio.twiml.voice_response import VoiceResponse, Gather, Connect, Say, Stream
from pydantic import BaseModel
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
import uuid

from agents.agent_graph import AgentGraph
from agents import firebase

sessions = {}
config = { "configurable": { "thread_id": str(uuid.uuid4()) } }

@app.get("/api/")
async def root():
    return {"message": "Fast API Server" }

@app.get("/api/chat")
async def chat():
    return { "message": "Chat Api" }

class ChatBody(BaseModel):
    message: str

@app.post("/api/chat")
async def chat(data: ChatBody, background_tasks: BackgroundTasks, user = Depends(firebase.verify_user)):
    message = data.message

    if user['uid'] in sessions:
        agent_graph = sessions[user['uid']]
    else:
        agent_graph = AgentGraph(user['uid'])
        sessions[user['uid']] = agent_graph

    def run_graph():
        results = agent_graph.graph.invoke({"messages": [HumanMessage(content=message)]}, config=config)
        response_message = results['messages'][-1].content
        print(response_message)

    background_tasks.add_task(run_graph)

    return { "message": "Chat Posted" }

@app.get("/api/chat/new")
async def new_chat(user = Depends(firebase.verify_user)):
    sessions[user['uid']] = AgentGraph(user['uid'])
    return { "message": "New agent created" }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)