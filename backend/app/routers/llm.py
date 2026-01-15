from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, schemas, models, auth
import openai
import os

router = APIRouter(
    prefix="/llm",
    tags=["LLM"]
)

# Mocking LLM response if no API key is present for initial testing
import google.generativeai as genai

# Mocking LLM response if no API key is present for initial testing
async def get_llm_response(history: list):
    api_key = os.getenv("LLM_API_KEY")
    if not api_key:
        last_msg = history[-1]["parts"][0]
        return f"Mock response: I received your message '{last_msg}'. (Set LLM_API_KEY to get real responses)"
    
    genai.configure(api_key=api_key)
    # Using 'gemini-flash-latest' as it is typically the most efficient/generous tier
    model = genai.GenerativeModel('gemini-flash-latest')
    
    import time
    max_retries = 3
    for attempt in range(max_retries):
        try:
            # Generate content with history
            # For multi-turn chat, we usually use start_chat, but here we reconstruct history each time
            # forstateless REST API. generate_content can take a list of contents.
            response = model.generate_content(history)
            if response.candidates and response.candidates[0].content.parts:
                return response.text
            else: 
                return "I apologize, but I couldn't generate a response to that. Please try rephrasing your question."
        except Exception as e:
            error_str = str(e)
            if "429" in error_str and attempt < max_retries - 1:
                # Error suggests ~20-30s wait. Increasing backoff to cover this window.
                # attempt 0: wait 10s
                # attempt 1: wait 20s
                # attempt 2: wait 30s
                time.sleep(10 * (attempt + 1)) 
                continue
            return f"Error communicating with Gemini: {error_str}"

@router.post("/chat", response_model=schemas.ChatMessageResponse)
async def chat(request: schemas.ChatRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    
    # Create session if not provided
    if not request.session_id:
        session = models.StudySession(user_id=current_user.id, topic=request.topic or "General Study")
        db.add(session)
        db.commit()
        db.refresh(session)
        session_id = session.id
    else:
        session = db.query(models.StudySession).filter(models.StudySession.id == request.session_id, models.StudySession.user_id == current_user.id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        session_id = session.id

    # Store User Message
    user_msg = models.ChatMessage(session_id=session_id, role="user", content=request.message)
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)
    
    # Fetch History (Last 20 messages for context)
    history_records = db.query(models.ChatMessage).filter(
        models.ChatMessage.session_id == session_id
    ).order_by(models.ChatMessage.timestamp.asc()).limit(20).all()
    
    # Format for Gemini
    history = []
    # Add System Prompt
    history.append({
        "role": "user",
        "parts": ["You are an elite AI Study Assistant. Your goal is to help students learn faster, explain complex topics simply, and provide study plans. Be encouraging, concise, and professional."]
    })
    history.append({
        "role": "model",
        "parts": ["Understood. I am ready to assist with any study inquiries."]
    })

    for msg in history_records:
        role = "user" if msg.role == "user" else "model"
        history.append({"role": role, "parts": [msg.content]})

    # Get LLM Response
    ai_response_content = await get_llm_response(history)
    
    # Store AI Message
    
    # Store AI Message
    ai_msg = models.ChatMessage(session_id=session_id, role="ai", content=ai_response_content)
    db.add(ai_msg)
    
    db.commit()
    db.refresh(ai_msg)
    
    return ai_msg
