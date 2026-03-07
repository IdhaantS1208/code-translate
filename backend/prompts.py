from config import SUPPORTED_LANGUAGES

def get_translation_prompt(source_lang: str, target_lang: str, code: str) -> str:
    
    if source_lang not in SUPPORTED_LANGUAGES or target_lang not in SUPPORTED_LANGUAGES:
        raise ValueError(f"Unsupported language. Supported languages are: {SUPPORTED_LANGUAGES}")
    
    if source_lang == target_lang:
        raise ValueError("Source and target languages must be different")

    language_notes = {
        ("Python", "C"): """
        - Python lists become arrays in C, declare with fixed size or use malloc for dynamic allocation
        - Replace Python classes with structs
        - Add explicit type declarations for all variables
        - Replace Python exceptions with error codes or exit()
        - Include necessary headers like stdio.h, stdlib.h, string.h
        - Python's garbage collection does not exist in C, manage memory manually
        """,

        ("Python", "C++"): """
        - Convert Python classes to C++ classes, preserving methods and attributes
        - Replace Python lists with std::vector, dictionaries with std::map
        - Add explicit type declarations for all variables
        - Replace Python exceptions with C++ try/catch blocks
        - Use std::string instead of Python strings
        - Include necessary headers like iostream, vector, map, string
        """,

        ("C", "Python"): """
        - Convert structs to Python classes
        - Replace manual memory management with Python's automatic garbage collection
        - Replace C arrays with Python lists
        - Convert C error codes to Python exceptions
        - Remove all header includes, use Python standard library equivalents
        - Replace printf/scanf with print/input
        """,

        ("C", "C++"): """
        - Convert structs to C++ classes where appropriate
        - Replace malloc/free with new/delete or smart pointers
        - Use std::string instead of char arrays where appropriate
        - Replace printf/scanf with cout/cin
        - Add appropriate C++ headers
        - Wrap logical groups of functions into classes if it improves structure
        """,

        ("C++", "Python"): """
        - Convert C++ classes to Python classes, preserving structure
        - Replace std::vector with lists, std::map with dictionaries
        - Remove all type declarations, Python is dynamically typed
        - Convert C++ exceptions to Python exceptions
        - Replace cout/cin with print/input
        - Remove header includes, use Python standard library equivalents
        """,

        ("C++", "C"): """
        - Convert C++ classes to structs with associated functions
        - Replace new/delete with malloc/free
        - Replace std::vector with fixed arrays or malloc'd arrays
        - Replace std::string with char arrays
        - Replace cout/cin with printf/scanf
        - Remove all C++ specific features like templates and operator overloading
        """
    }

    notes = language_notes.get((source_lang, target_lang), "")

    prompt = f"""You are an expert code translator. Your task is to translate the following {source_lang} code into {target_lang}.

Follow these rules strictly:
1. Preserve the exact same functionality and logic
2. Preserve all function and variable names where the target language allows
3. Preserve all comments, translating them if needed to fit the target language style
4. Make idiomatic choices for the target language — do not do a literal word for word translation
5. If any part of the code cannot be cleanly translated, add a comment explaining why and what the closest equivalent is
6. Return only the translated code with no explanation, no markdown, no code fences

Language specific instructions:
{notes}

Code to translate:
{code}

Translated {target_lang} code:"""

    return prompt

def get_thinking_prompt(source_lang: str, target_lang: str, source_code: str, translated_code: str) -> str:

    prompt = f"""You are Soptera's internal translation engine reflecting on the decisions you just made. Write your analysis as a series of bullet points, each one a first-person internal thought about a specific element of the code you translated.

Each bullet point must:
- Start with "• "
- Be 2 to 3 lines long
- Focus on one specific element that changed between the {source_lang} and {target_lang} versions
- Explain what it was in {source_lang}, what it became in {target_lang}, and why you made that choice
- Be written as a direct internal thought — first person, present tense, as if you are reasoning through your own decision
- Reference the actual code specifically — never speak in generalities
- When referencing any specific code keyword, function name, variable, operator, or syntax element, always wrap it in backticks like `print()` or `std::cout`. Never use single quotes or any other wrapper for code references.

Rules:
- Write 5 to 7 bullet points total
- No headers, no blank lines between bullets, no markdown formatting beyond the • character
- Do not use filler phrases like "it is worth noting" or "it is important to understand"
- Be direct, technical, and specific to this exact code
- Write for an intermediate developer who understands both languages

Original {source_lang} code:
{source_code}

Translated {target_lang} code:
{translated_code}

Your internal thoughts:"""

    return prompt