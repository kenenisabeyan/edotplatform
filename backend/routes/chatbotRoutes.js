import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { protect } from '../middleware/auth.js';

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

        // Initialize model with a system instruction defining persona
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.5-flash",
            systemInstruction: "You are a helpful, friendly, and knowledgeable AI assistant for an educational platform called FutureLearning (or EDOT). You can communicate fluently in English, Amharic, and Afaan Oromo. Answer the student's question clearly and concisely in the language they used to ask. Make sure to format your answers beautifully using Markdown where appropriate (e.g., bold headers, lists, bullet points, or code blocks)."
        });

        // Convert the history array to Gemini's expected alternating format: user, model, user, model
        const formattedHistory = [];
        if (Array.isArray(history)) {
            // Find the index of the first user message (since Gemini chat history must start with user)
            const firstUserIdx = history.findIndex(msg => msg.role === 'user');
            if (firstUserIdx !== -1) {
                const relevantHistory = history.slice(firstUserIdx);
                relevantHistory.forEach((msg) => {
                    if (msg.role && msg.content) {
                        const role = msg.role === 'assistant' ? 'model' : 'user';
                        const lastMsg = formattedHistory[formattedHistory.length - 1];
                        if (lastMsg && lastMsg.role === role) {
                            // Merge consecutive messages with the same role to maintain strict alternation
                            lastMsg.parts[0].text += "\n" + msg.content;
                        } else {
                            formattedHistory.push({
                                role: role,
                                parts: [{ text: msg.content }]
                            });
                        }
                    }
                });
            }
        }

        // Ensure history does not end with a user message to prevent double-user message error on sendMessage
        if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
            formattedHistory.pop();
        }

        // Start a chat session with memory
        const chat = model.startChat({
            history: formattedHistory
        });

        const result = await chat.sendMessage(message);
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
