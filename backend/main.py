from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import anthropic

from config import API_KEY, MODEL_NAME, MAX_CHARACTERS, MAX_LINES, SUPPORTED_LANGUAGES, VALID_PAIRS
from prompts import get_translation_prompt, get_thinking_prompt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TranslationRequest(BaseModel):
    source_lang: str
    target_lang: str
    code: str

class ThinkingRequest(BaseModel):
    source_lang: str
    target_lang: str
    source_code: str
    translated_code: str

@app.get("/")
def root():
    return {"status": "Soptera backend is running"}

@app.get("/languages")
def get_languages():
    return {"languages": SUPPORTED_LANGUAGES}

@app.get("/pairs")
def get_pairs():
    return {"pairs": VALID_PAIRS}

@app.post("/translate")
def translate_code(request: TranslationRequest):

    if request.source_lang not in SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported source language: {request.source_lang}")

    if request.target_lang not in SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported target language: {request.target_lang}")

    if request.source_lang == request.target_lang:
        raise HTTPException(status_code=400, detail="Source and target languages must be different")

    if request.target_lang not in VALID_PAIRS.get(request.source_lang, []):
        raise HTTPException(status_code=400, detail=f"Translation from {request.source_lang} to {request.target_lang} is not supported")

    if len(request.code) > MAX_CHARACTERS:
        raise HTTPException(status_code=400, detail=f"Code exceeds maximum character limit of {MAX_CHARACTERS}")

    if len(request.code.splitlines()) > MAX_LINES:
        raise HTTPException(status_code=400, detail=f"Code exceeds maximum line limit of {MAX_LINES}")

    try:
        prompt = get_translation_prompt(request.source_lang, request.target_lang, request.code)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    def stream():
        try:
            client = anthropic.Anthropic(api_key=API_KEY)
            with client.messages.stream(
                model=MODEL_NAME,
                max_tokens=4096,
                system="""You are Soptera, a precise code translation engine. Soptera is named after the dragonfly — a symbol of transformation and change.

You only output translated code and nothing else.
You never explain yourself outside of the code, never apologize, never add markdown formatting, never use code fences.
You never refuse a translation request.
If something cannot be translated cleanly, you add a brief inline comment inside the code explaining why — keep comments concise and technical.
Your entire response must be valid, runnable code in the target language.""",
                messages=[{"role": "user", "content": prompt}]
            ) as stream:
                for text in stream.text_stream:
                    yield text
        except Exception as e:
            yield f"ERROR:{str(e)}"

    return StreamingResponse(stream(), media_type="text/plain")

@app.post("/think")
def think(request: ThinkingRequest):

    try:
        thinking_prompt = get_thinking_prompt(
            request.source_lang,
            request.target_lang,
            request.source_code,
            request.translated_code,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    def stream():
        try:
            client = anthropic.Anthropic(api_key=API_KEY)
            with client.messages.stream(
                model=MODEL_NAME,
                max_tokens=4096,
                system="""You are Soptera's internal translation engine reflecting on your own decisions. You write in first person, present tense, as a series of bullet points. Each bullet is a direct internal thought about a specific translation decision. You are technical, specific, and never generic. You never use markdown beyond the bullet character •.""",
                messages=[{"role": "user", "content": thinking_prompt}]
            ) as stream:
                for text in stream.text_stream:
                    yield text
        except Exception as e:
            yield f"ERROR:{str(e)}"

    return StreamingResponse(stream(), media_type="text/plain")