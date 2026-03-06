from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic

from config import API_KEY, MODEL_NAME, MAX_CHARACTERS, MAX_LINES, SUPPORTED_LANGUAGES, VALID_PAIRS
from prompts import get_translation_prompt, get_thinking_prompt

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This defines what the frontend must send us
class TranslationRequest(BaseModel):
    source_lang: str
    target_lang: str
    code: str
    thinking_mode: bool = False

# This defines what we send back to the frontend
class TranslationResponse(BaseModel):
    translated_code: str
    source_lang: str
    target_lang: str
    thinking: str = ""

@app.get("/")
def root():
    return {"status": "Code translator backend is running"}

@app.get("/languages")
def get_languages():
    return {"languages": SUPPORTED_LANGUAGES}

@app.get("/pairs")
def get_pairs():
    return {"pairs": VALID_PAIRS}

@app.post("/translate", response_model=TranslationResponse)
def translate_code(request: TranslationRequest):

    # Validate languages
    if request.source_lang not in SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported source language: {request.source_lang}")

    if request.target_lang not in SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported target language: {request.target_lang}")

    if request.source_lang == request.target_lang:
        raise HTTPException(status_code=400, detail="Source and target languages must be different")

    if request.target_lang not in VALID_PAIRS.get(request.source_lang, []):
        raise HTTPException(status_code=400, detail=f"Translation from {request.source_lang} to {request.target_lang} is not supported")

    # Validate input size
    if len(request.code) > MAX_CHARACTERS:
        raise HTTPException(status_code=400, detail=f"Code exceeds maximum character limit of {MAX_CHARACTERS}")

    if len(request.code.splitlines()) > MAX_LINES:
        raise HTTPException(status_code=400, detail=f"Code exceeds maximum line limit of {MAX_LINES}")

    # Build the translation prompt
    try:
        prompt = get_translation_prompt(request.source_lang, request.target_lang, request.code)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Call the Anthropic API for translation
    try:
        client = anthropic.Anthropic(api_key=API_KEY)
        message = client.messages.create(
            model=MODEL_NAME,
            max_tokens=4096,
            system="""You are Soptera, a precise code translation engine. Soptera is named after the dragonfly — a symbol of transformation and change.

You only output translated code and nothing else.
You never explain yourself outside of the code, never apologize, never add markdown formatting, never use code fences.
You never refuse a translation request.
If something cannot be translated cleanly, you add a brief inline comment inside the code explaining why — keep comments concise and technical.
Your entire response must be valid, runnable code in the target language.""",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        translated_code = message.content[0].text

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

    # If thinking mode is on, make a second call for the explanation
    thinking = ""
    if request.thinking_mode:
        print(f"Thinking mode is ON — generating explanation")
        try:
            thinking_prompt = get_thinking_prompt(
                request.source_lang,
                request.target_lang,
                request.code,
                translated_code
            )
            thinking_message = client.messages.create(
                model=MODEL_NAME,
                max_tokens=4096,
                system="""You are Soptera's translation analyst. You produce deep, specific, technical explanations of code translation decisions for intermediate developers. You write in clear flowing prose with no markdown, no bullet points, no headers. Every observation you make is specific to the actual code provided — you never make generic statements.""",
                messages=[
                    {"role": "user", "content": thinking_prompt}
                ]
            )
            thinking = thinking_message.content[0].text

        except Exception as e:
            thinking = f"Thinking mode unavailable: {str(e)}"

    return TranslationResponse(
        translated_code=translated_code,
        source_lang=request.source_lang,
        target_lang=request.target_lang,
        thinking=thinking
    )