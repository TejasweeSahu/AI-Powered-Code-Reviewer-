import { useState } from 'react'
import "prismjs/themes/prism-tomorrow.css"
import Editor from "react-simple-code-editor"
import prism from "prismjs"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-python"
import "prismjs/components/prism-java"
import "prismjs/components/prism-c"
import "prismjs/components/prism-cpp"
import "prismjs/components/prism-go"
import "prismjs/components/prism-rust"
import "prismjs/components/prism-sql"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import axios from 'axios'
import './App.css'

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const API_URL = rawApiUrl.replace(/\/+$/, '')

// Values must match SUPPORTED_LANGUAGES in BackEnd/src/controllers/ai.controller.js
const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
]

function App() {
  const [ code, setCode ] = useState(`function sum() {
  return 1 + 1
}`)
  const [ language, setLanguage ] = useState('javascript')
  const [ review, setReview ] = useState('')
  const [ isLoading, setIsLoading ] = useState(false)
  const [ error, setError ] = useState(null)

  async function reviewCode() {
    if (!code || !code.trim()) {
      setError("Please provide a valid code snippet to review.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post(`${API_URL}/ai/get-review`, { code, language })
      setReview(response.data)
    } catch (err) {
      console.error("Code review failed:", err)
      const message =
        err.response?.data?.error ||
        err.message ||
        "An unexpected error occurred while reviewing code."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <main>
        <div className="left">
          {error && (
            <div className="error-banner" role="alert">
              <span>{error}</span>
              <button
                type="button"
                className="close-error"
                onClick={() => setError(null)}
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}
          <div className="toolbar">
            <label htmlFor="language-select">Language</label>
            <select
              id="language-select"
              value={language}
              onChange={e => setLanguage(e.target.value)}
              disabled={isLoading}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>
          <div className="code">
            <Editor
              value={code}
              onValueChange={newCode => setCode(newCode)}
              highlight={codeSnippet => prism.highlight(codeSnippet, prism.languages[language], language)}
              padding={16}
              style={{
                fontFamily: '"Fira Code", "Fira Mono", "Courier New", monospace',
                fontSize: 15,
                border: "1px solid #2d2d2d",
                borderRadius: "0.7rem",
                height: "100%",
                width: "100%",
                minHeight: "100%",
                outline: "none"
              }}
            />
          </div>
          <button
            type="button"
            onClick={reviewCode}
            disabled={isLoading}
            className="review-btn"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Reviewing...
              </>
            ) : (
              "Review"
            )}
          </button>
        </div>
        <div className="right">
          {isLoading ? (
            <div className="review-loading">
              <span className="spinner large" aria-hidden="true"></span>
              <p>Analyzing code with Gemini AI...</p>
            </div>
          ) : review ? (
            <Markdown rehypePlugins={[ rehypeHighlight ]}>{review}</Markdown>
          ) : (
            <div className="review-placeholder">
              <h3>AI Code Reviewer</h3>
              <p>Write or paste your code on the left and click <strong>Review</strong> to get a senior-level code analysis covering quality, bugs, performance, and best practices.</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default App

