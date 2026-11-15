const aiService = require("../services/ai.service");

module.exports.getReview = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code || typeof code !== 'string' || !code.trim()) {
            return res.status(400).json({ 
                error: "Code snippet is required and cannot be empty." 
            });
        }

        if (code.length > 50000) {
            return res.status(413).json({ 
                error: "Code snippet exceeds the maximum supported length of 50,000 characters." 
            });
        }

        const review = await aiService(code);

        // Send markdown review text
        return res.send(review);
    } catch (error) {
        console.error("AI Controller Error:", error.message || error);

        if (error.message && error.message.includes("GOOGLE_GEMINI_KEY")) {
            return res.status(500).json({ 
                error: "Server configuration error: GOOGLE_GEMINI_KEY is missing." 
            });
        }

        return res.status(500).json({ 
            error: error.message || "An error occurred while generating the code review. Please try again." 
        });
    }
};
