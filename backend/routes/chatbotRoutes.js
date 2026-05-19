import express from 'express';
import OpenAI from 'openai';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

router.post('/message', protect, async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_key') {
             return res.status(500).json({ 
                 success: false, 
                 message: 'OpenAI API Key is missing. Please configure OPENAI_API_KEY in the backend environment variables.'
             });
        }

        // Convert the history array (role/content) to OpenAI's expected format
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
        }));

        const systemMessage = {
            role: 'system',
            content: 'You are a helpful, friendly, and knowledgeable AI assistant for an educational platform called FutureLearning (or EDOT). Answer the student\'s question clearly and concisely.'
        };

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // fast and cost-effective model
            messages: [systemMessage, ...formattedHistory, { role: 'user', content: message }],
        });

        const reply = completion.choices[0].message.content;

        res.json({
            success: true,
            reply: reply
        });
    } catch (error) {
        console.error('Chatbot API Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate response' });
    }
});

export default router;
