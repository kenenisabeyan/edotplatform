import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

router.post('/message', protect, async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key') {
             return res.status(500).json({ 
                 success: false, 
                 message: 'Gemini API Key is missing. Please configure GEMINI_API_KEY in the backend environment variables.'
             });
        }

        // Initialize model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Convert the history array (role/content) to Gemini's expected format if needed
        // For simplicity, we just pass the new message with context.
        const prompt = `You are a helpful, friendly, and knowledgeable AI assistant for an educational platform called FutureLearning (or EDOT). You can communicate fluently in English, Amharic, and Afaan Oromo. Answer the student's question clearly and concisely in the language they used to ask.
        
User Question: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({
            success: true,
            reply: text
        });
    } catch (error) {
        console.error('Chatbot API Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate response' });
    }
});

export default router;
