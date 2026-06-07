# probable-guacamole#

An AI-powered code translator that converts code between programming languages using Claude. It supports Python, C, C++, Ruby, and Swift, and includes optional Librarian Mode and Build Mode for extended translation capabilities.

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

Open `.env` in a text editor and replace `your_api_key_here` with your actual Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
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

Start the backend (from the `backend/` directory):

```bash
uvicorn main:app --reload
```

Start the frontend (from the `frontend/` directory, in a separate terminal):

```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000). The backend runs on port 8000 by default.

## Features

- **Translation** — Convert code between Python, C, C++, Ruby, and Swift
- **Thinking Mode** — See an internal reflection on every translation decision
- **Librarian Mode** — Get a full breakdown of every library or header introduced and why
- **Build Mode** — Describe features to add on top of the translation
