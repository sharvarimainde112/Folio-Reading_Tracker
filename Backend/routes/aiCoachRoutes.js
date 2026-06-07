const express = require('express');
const router  = express.Router();
const { getCoachReply, resetConversation } = require('../controllers/aiCoachController');
const { protect } = require('../middleware/authMiddleware');

router.post('/',      protect, getCoachReply);      // POST   /api/ai-coach
router.delete('/reset', protect, resetConversation); // DELETE /api/ai-coach/reset

module.exports = router;