from fastapi import FastAPI, Request, HTTPException, Query
from pydantic import BaseModel
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.chains import ConversationalRetrievalChain
from langchain_community.chat_models import ChatOllama
from langchain.schema import Document
from langchain.memory import ConversationBufferMemory
import os
import json
from typing import Dict
from datetime import datetime

app = FastAPI()

embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

if os.path.exists("sii_qa_index"):
    db = FAISS.load_local("sii_qa_index", embedding_model, allow_dangerous_deserialization=True)
else:
    with open('faq_data.json', 'r', encoding='utf-8') as f:
        qa_pairs = json.load(f)
    documents = [Document(page_content=f"Q: {q}\nA: {a}") for q, a in qa_pairs.items()]
    db = FAISS.from_documents(documents, embedding_model)
    db.save_local("sii_qa_index")

retriever = db.as_retriever()

llm = ChatOllama(model="mistral_prompt")

memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

rag_chain = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=retriever,
    memory=memory,
    return_source_documents=False,
)


user_memories: Dict[str, ConversationBufferMemory] = {}

LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

def log_message_to_file(user_id: str, role: str, message: str):
    log_file = os.path.join(LOG_DIR, f"{user_id}.log")
    timestamp = datetime.utcnow().isoformat()
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {role.upper()}: {message}\n")

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    answer: str

@app.post("/chat", response_model=QueryResponse)
def chat(request: QueryRequest, user_id: str = Query(default="default", description="User identifier")):
    if user_id not in user_memories:
        user_memories[user_id] = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        memory=user_memories[user_id],
        return_source_documents=False,
    )

    log_message_to_file(user_id, role="user", message=request.query)

    response = chain.invoke({"question": request.query})
    answer = response["answer"]

    log_message_to_file(user_id, role="bot", message=answer)

    return QueryResponse(answer=answer)

#plain text
@app.get("/logs/{user_id}")
def get_user_logs(user_id: str):
    log_file = os.path.join(LOG_DIR, f"{user_id}.log")
    if not os.path.exists(log_file):
        raise HTTPException(status_code=404, detail="Log file not found.")
    with open(log_file, "r", encoding="utf-8") as f:
        return {"logs": f.read()}

#JSON lines
@app.get("/loglines/{user_id}")
def get_user_log_lines(user_id: str):
    log_file = os.path.join(LOG_DIR, f"{user_id}.log")
    if not os.path.exists(log_file):
        raise HTTPException(status_code=404, detail="Log file not found.")
    logs = []
    with open(log_file, "r", encoding="utf-8") as f:
        for line in f:
            try:
                timestamp_part, rest = line.strip().split("] ", 1)
                timestamp = timestamp_part.strip("[").strip()
                role, message = rest.split(": ", 1)
                logs.append({
                    "timestamp": timestamp,
                    "role": role.strip().lower(),
                    "message": message.strip()
                })
            except Exception:
                continue
    return {"logs": logs}