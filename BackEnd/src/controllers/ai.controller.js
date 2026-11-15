const aiService = require("../services/ai.service");

const MAX_CODE_LENGTH = 50000;

// Languages the frontend offers. Anything else is rejected rather than interpolated
// into the prompt.
const SUPPORTED_LANGUAGES = new Set([
    'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'go', 'rust', 'sql',
]);

// Maps upstream (Gemini) failures to safe, client-facing responses. Raw error messages
// are logged server-side only, since they can contain SDK internals or request details.
function toClientError(error) {
    if (error.code === 'MISSING_API_KEY') {
        return { status: 500, message: "Server configuration error: the AI service is not configured." };
    }
    if (error.status === 429) {
        return { status: 503, message: "The AI service is busy right now. Please try again shortly." };
    }
    // GoogleGenerativeAIResponseError: the model returned no usable text, e.g. a safety block.
    if (error.response && !error.status) {
        return { status: 422, message: "The AI service declined to review this snippet." };
    }
    return { status: 502, message: "An error occurred while generating the code review. Please try again." };
}

module.exports.getReview = async (req, res) => {
    const { code, language = 'javascript' } = req.body || {};

    if (!code || typeof code !== 'string' || !code.trim()) {
        return res.status(400).json({
            error: "Code snippet is required and cannot be empty."
        });
    }

    if (code.length > MAX_CODE_LENGTH) {
        return res.status(413).json({
            error: "Code snippet exceeds the maximum supported length of 50,000 characters."
        });
    }

    if (typeof language !== 'string' || !SUPPORTED_LANGUAGES.has(language)) {
        return res.status(400).json({
            error: `Unsupported language. Supported: ${[...SUPPORTED_LANGUAGES].join(', ')}.`
        });
    }

    try {
        const review = await aiService(code, language);

        // Send markdown review text
        return res.type('text/markdown').send(review);
    } catch (error) {
        console.error("AI Controller Error:", error);
        const { status, message } = toClientError(error);
        return res.status(status).json({ error: message });
    }
};

module.exports.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
