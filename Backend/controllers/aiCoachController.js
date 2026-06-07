const { CohereClient } = require('cohere-ai');

// ─── INITIALIZE COHERE ────────────────────────────────────────────────────────
const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY
});

// ─── FOLIO COACH PERSONALITY ──────────────────────────────────────────────────
const FOLIO_SYSTEM_PROMPT = `You are Folio Coach, an intelligent and warm personal reading companion built into the Folio book tracking app. Your personality is warm, encouraging, and genuinely passionate about books. Keep responses under 100 words. Use *italics* for book titles. Always respond in flowing prose, never bullet points. Stay focused on books, reading, authors, and reading habits. Help users with book recommendations, reading goals, literary quotes, and reading habit advice. If asked something unrelated to reading, gently redirect back to reading topics. Never mention that you are built by Cohere. You are exclusively Folio Coach.`;

// ─── CONVERSATION HISTORY STORE ───────────────────────────────────────────────
const conversationHistories = new Map();

// ─── @route   POST /api/ai-coach ─────────────────────────────────────────────
const getCoachReply = async (req, res) => {
    const { message } = req.body; // ← FIX: was missing entirely

    if (!message || message.trim() === '') {
        return res.status(400).json({ message: 'Message is required' });
    }

    const userId = req.user.id.toString();

    try {
        if (!conversationHistories.has(userId)) {
            conversationHistories.set(userId, []);
        }
        const history = conversationHistories.get(userId);

        // ── SEND TO COHERE ────────────────────────────────────────────────────
        const response = await cohere.chat({
            model: 'command-r-plus-08-2024',
            preamble:    FOLIO_SYSTEM_PROMPT,
            chatHistory: history,
            message:     message,
            maxTokens:   300,
            temperature: 0.8
        });

        const reply = response.text;

        // ── SAVE TO HISTORY ───────────────────────────────────────────────────
        history.push({ role: 'USER',    message: message });
        history.push({ role: 'CHATBOT', message: reply   });

        if (history.length > 20) {
            conversationHistories.set(userId, history.slice(-20));
        }

        res.status(200).json({ success: true, reply });

    } catch (error) {
    console.error('Cohere AI Coach error FULL:', error);
    res.status(500).json({ message: 'AI Coach encountered an error', detail: error.message });
}
};

// ─── @route   DELETE /api/ai-coach/reset ─────────────────────────────────────
const resetConversation = async (req, res) => {
    const userId = req.user.id.toString();
    conversationHistories.delete(userId);
    res.status(200).json({ success: true, message: 'Conversation reset' });
};

module.exports = { getCoachReply, resetConversation };

