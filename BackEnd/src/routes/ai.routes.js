const express = require('express');
const aiController = require("../controllers/ai.controller");
const createRateLimiter = require("../middleware/rateLimit");

const router = express.Router();

const reviewLimiter = createRateLimiter({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 20,
});

router.post("/get-review", reviewLimiter, aiController.getReview);


module.exports = router;
