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

    prompt = f"""You are Soptera, an expert code translator. You have just translated the following {source_lang} code into {target_lang}.

Your task is to produce a deep, code-specific explanation of every meaningful decision made during this translation. You are writing for an intermediate developer who understands both languages but wants to understand exactly why certain choices were made and what they should be aware of before using the translated code in production.

Go through the translation systematically and address the following where relevant:

STRUCTURAL CHANGES
Explain any changes to how the code is organised. If classes became structs, if functions were reorganised, if the entry point changed — explain exactly why and what the implications are for the developer.

TYPE SYSTEM DIFFERENCES
If the source language is dynamically typed and the target is statically typed or vice versa, explain every type decision made. Where types were inferred or assumed, flag this explicitly so the developer can verify.

MEMORY AND RESOURCE MANAGEMENT
If the two languages handle memory differently — for example Python garbage collection versus C manual memory management, or Swift ARC versus C++ manual allocation — explain every decision made and flag any areas where memory leaks or unsafe behaviour could occur if the developer is not careful.

IDIOMATIC CHOICES
Where you chose the idiomatic {target_lang} way of doing something rather than a literal translation, explain what the {source_lang} construct was, what the {target_lang} equivalent is, and why the idiomatic choice is preferable.

CONSTRUCTS WITH NO DIRECT EQUIVALENT
For any {source_lang} feature that has no clean equivalent in {target_lang}, explain what the feature does, how you approximated it, and what the limitations of that approximation are.

ERROR HANDLING
If the two languages handle errors differently, explain how error handling was translated and whether the translated error handling is semantically equivalent or just approximate.

LIBRARY AND DEPENDENCY CHANGES
If any standard library functions, imports, or dependencies changed, explain what the {source_lang} original did and what the {target_lang} replacement does, and whether they are fully equivalent.

WHAT TO DOUBLE CHECK
End with a specific, honest list of things the developer should manually review or test before using this code in production. Be direct and specific to this exact code — do not give generic advice.

Write in clean, flowing technical prose. Do not use markdown, headers, or bullet points. Be specific to this exact code — every observation must reference something that actually appears in the source or translated code. Do not make generic statements that could apply to any translation.

Original {source_lang} code:
{source_code}

Translated {target_lang} code:
{translated_code}

Your explanation:"""

    return prompt