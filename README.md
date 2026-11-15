# AI-Powered Code Reviewer

An automated, intelligent code reviewing application built with **React**, **Express**, and **Google Gemini AI** (`gemini-3.8-flash`). Paste or type your code, click review, and receive an instant, senior-developer-level analysis covering code quality, performance optimizations, bug detection, and security vulnerabilities.

---

## ✨ Features

- ⚡ **Instant AI Feedback**: Powered by Google's Gemini generative AI model with custom senior-level review instructions.
- 🎨 **Syntax-Highlighted Editor**: In-browser code editing with Prism highlighting for JavaScript, TypeScript, Python, Java, C, C++, Go, Rust, and SQL.
- 📝 **Structured Markdown Output**: Reviews broken down into issues, recommended fixes, and key architectural improvements.
- 🛡️ **Defensive Error Handling**: Input validation, payload limits, API error alerting, and graceful fallback handling.
- 📱 **Responsive Design**: Split-pane layout that adapts cleanly to desktop and mobile screen sizes.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Axios, React Simple Code Editor, Prism.js, React Markdown, Rehype Highlight.
- **Backend**: Node.js, Express, `@google/generative-ai`, CORS, Dotenv.
- **AI Model**: Google Gemini (`gemini-3.8-flash`).

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A Google Gemini API key (Obtain one for free at [Google AI Studio](https://aistudio.google.com/app/apikey))

---

### 1. Backend Setup

1. Open a terminal and navigate to the `BackEnd` directory:
   ```bash
   cd BackEnd
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your Google Gemini API key to `.env`:
   ```env
   PORT=3000
   GOOGLE_GEMINI_KEY=your_actual_gemini_api_key_here
   CLIENT_URL=http://localhost:5173
   ```

5. Start the backend server:
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Or production
   npm start

   # Run tests (no API key needed; the Gemini call is stubbed)
   npm test
   ```

   Optional settings (see `.env.example`):
   - `CLIENT_URL`: allowed CORS origins. Unset or `*` allows all. Otherwise a comma-separated list, where entries may use `*` wildcards (e.g. `https://my-app-*.vercel.app` for preview deployments).
   - `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS`: per-IP limit on reviews (default 20 per 15 minutes).
   - `GEMINI_MODEL`: override the default model.

   The server will start on `http://localhost:3000`.

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create a `.env` file if your backend runs on a custom port/URL:
   ```bash
   cp .env.example .env
   ```
   Default `VITE_API_URL` is `http://localhost:3000`.

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

---

## 📡 API Endpoints

### `POST /ai/get-review`
Submits source code for senior code review.

- **Request Body**:
  ```json
  {
    "code": "function sum() { return 1 + 1; }",
    "language": "javascript"
  }
  ```
  `language` is optional (defaults to `javascript`). Supported: `javascript`, `typescript`, `python`, `java`, `c`, `cpp`, `go`, `rust`, `sql`.
- **Success Response (200)**: Markdown formatted review string.
- **Error Responses**:
  - `400 Bad Request`: empty code, unsupported language, or malformed JSON.
  - `413 Payload Too Large`: code longer than 50,000 characters.
  - `422 Unprocessable Entity`: the AI declined to review the snippet (e.g. safety block).
  - `429 Too Many Requests`: per-IP rate limit hit; see the `Retry-After` header.
  - `500 Internal Server Error`: server misconfiguration (e.g. missing API key).
  - `502 Bad Gateway` / `503 Service Unavailable`: the AI service failed or is over quota.

  All errors are `{ "error": "<safe message>" }`; upstream details are logged server-side only.

### `GET /health`
Returns backend health status.
- **Response**: `{ "status": "ok", "timestamp": "2026-11-06T..." }`

---

## 📄 License
ISC
