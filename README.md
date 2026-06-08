# Code Translator

An AI-native code translation tool that converts code between programming languages while preserving core logic. Built on Claude, it includes an original automated evaluation framework that assesses logic preservation accuracy and translation explainability — the core technical contribution of the project.

Supports Python, C, C++, Ruby, and Swift.

## How it works

The translator uses Claude to analyse the source code's underlying logic before translating, rather than converting line by line. An automated evaluation framework then scores each translation on logic preservation, idiomatic quality, and explainability to one decimal place. Optional Librarian Mode and Build Mode extend the translation pipeline without modifying the core evaluation logic.

## Features

- **Translation** — Convert code between Python, C, C++, Ruby, and Swift
- **Thinking Mode** — See a detailed reflection on every translation decision: what changed directly, what had no direct equivalent, and how core logic was preserved
- **Librarian Mode** — The translator identifies and uses idiomatic libraries in the target language rather than translating logic manually. Includes a full breakdown of every library introduced and why
- **Build Mode** — Describe features to add on top of the translation. The model translates and builds in one pass, distinguishing what was translated from what was newly built
- **Evaluation Framework** — Automated scoring of logic preservation accuracy, idiomatic quality, and explainability across each translation, scored to one decimal place

## What's Next

- **Transform Mode** — Convert text-based and CLI interfaces into fully functional GUIs across multiple frameworks and output languages, in a single pass
- **Multi-mode stacking** — Run multiple modes simultaneously in a single translation pass for combined capabilities

## Getting Started

### Prerequisites

- Python 3.9+ (for the backend)
- Node.js 18+ and npm (for the frontend)
- An [Anthropic API key](https://console.anthropic.com/)

### 1. Clone the repository

```bash
git clone https://github.com/IdhaantS1208/probable-guacamole.git
cd probable-guacamole
```

### 2. Set up the backend environment

Copy the example environment file and add your Anthropic API key:

```bash
cd backend
cp .env.example .env
```

### 3. Install backend dependencies

From the `backend/` directory:

```bash
pip install -r requirements.txt
```

### 4. Install frontend dependencies

From the `frontend/` directory:

```bash
cd ../frontend
npm install
```

### 5. Run the app

Start the backend (from `backend/`):

```bash
uvicorn main:app --reload
```

Start the frontend (from `frontend/`, in a separate terminal):

```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000). The backend runs on port 8000 by default.

Open `.env` and replace `your_api_key_here` with your actual key:
