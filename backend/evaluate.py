# evaluate.py
# Evaluation framework: scores every translation across three dimensions.
# Returns a prompt that instructs Claude to respond with structured JSON only.
# Scores are floats (1.0-10.0) to one decimal place -- never bare integers.

def get_evaluation_prompt(
    source_lang: str,
    target_lang: str,
    source_code: str,
    translated_code: str,
    thinking_output: str = "",
) -> str:
    """
    Build the evaluation prompt for a completed translation.

    Args:
        source_lang:     The language the code was translated FROM.
        target_lang:     The language the code was translated TO.
        source_code:     The original source code.
        translated_code: The translated output code.
        thinking_output: The thinking/reflection output produced during
                         translation (empty string if Thinking Mode was off).

    Returns:
        A prompt string that instructs Claude to evaluate the translation
        across three dimensions and respond with JSON only.
        Scores are floats to one decimal place (e.g. 8.7, not 9).
    """

    # Include the thinking block only when it was actually produced
    thinking_section = (
        f"Thinking output:\n{thinking_output}"
        if thinking_output and thinking_output.strip()
        else "Thinking output: (none - Thinking Mode was not active)"
    )

    prompt = f"""You are a precise code translation evaluator. You will be given a source code snippet, its translation into another language, and optionally a thinking output that explains the translation decisions.

Evaluate the translation across exactly three dimensions and respond with a single JSON object. Do not include any text before or after the JSON. Do not use markdown code fences. Do not explain your reasoning outside the JSON.

=== DIMENSIONS ===

1. logic_preservation (score 1.0-10.0, one decimal place)
Does the translated code perform the same operations and produce the same outcomes as the source?
Penalise any missing logic, added assumptions, or behavioural drift.
A score of 10.0 means the logic is perfectly preserved.

2. idiomatic_quality (score 1.0-10.0, one decimal place)
Does the translated code look like it was written natively in {target_lang}, or like a mechanical line-by-line conversion?
Reward use of native patterns, conventions, idioms, and standard library features of {target_lang}.
A score of 10.0 means an experienced {target_lang} developer would not guess this was translated.

3. explainability (score 1.0-10.0, one decimal place)
How thoroughly and accurately does the thinking output explain the translation decisions?
It should cover: what changed directly, what had no direct equivalent and how it was handled, and how core logic was preserved.
If no thinking output was provided, the score MUST be 0.0.

=== RESPONSE FORMAT ===

Scores MUST be floats to one decimal place (e.g. 8.7, 6.0, 9.3 -- never bare integers like 8 or 10).
Respond with this exact JSON structure and nothing else:

{{
  "logic_preservation": {{
    "score": 8.7,
    "justification": "<one sentence>"
  }},
  "idiomatic_quality": {{
    "score": 6.3,
    "justification": "<one sentence>"
  }},
  "explainability": {{
    "score": 9.1,
    "justification": "<one sentence>"
  }}
}}

=== INPUT ===

Source language: {source_lang}
Target language: {target_lang}

Source ({source_lang}) code:
{source_code}

Translated ({target_lang}) code:
{translated_code}

{thinking_section}"""

    return prompt
