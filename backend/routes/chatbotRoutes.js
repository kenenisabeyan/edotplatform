import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

router.post('/message', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key') {
             console.error('Gemini API Key is missing. Please configure GEMINI_API_KEY in the backend environment variables.');
             return res.status(500).json({ 
                 success: false, 
                 message: "I'm sorry, my chat system is currently undergoing maintenance. Please try again later."
             });
        }

        // Optionally resolve user authentication to customize chatbot instructions
        let user = null;
        let token;
        
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await prisma.user.findUnique({ where: { id: decoded.id } });
                if (user) {
                    delete user.password;
                }
            } catch (err) {
                // Ignore JWT decoding/verification errors for guests/visitors
            }
        }

        // Custom system instruction for personalization or guest welcoming
        const systemInstruction = user 
            ? `You are a helpful, friendly, and knowledgeable AI assistant for an educational platform called FutureLearning (or EDOT). You are chatting with ${user.name} (role: ${user.role}). You can communicate fluently in English, Amharic, and Afaan Oromo. Answer their questions clearly and concisely in the language they used to ask, and personalize your responses when appropriate. Make sure to format your answers beautifully using Markdown where appropriate (e.g., bold headers, lists, bullet points, or code blocks).`
            : `You are a helpful, friendly, and knowledgeable AI assistant for an educational platform called FutureLearning (or EDOT). You are chatting with a guest visitor / prospective customer who is not logged in. Be extremely welcoming, polite, and professional. Explain the benefits of the platform and guide them on how they can register or learn more if they ask. You can communicate fluently in English, Amharic, and Afaan Oromo. Answer their questions clearly and concisely in the language they used to ask. Make sure to format your answers beautifully using Markdown where appropriate (e.g., bold headers, lists, bullet points, or code blocks).`;

        // Initialize model with a system instruction defining persona
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.5-flash",
            systemInstruction: systemInstruction
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
        res.status(500).json({ 
            success: false, 
            message: "I'm sorry, I am currently unable to generate a response. Please try again in a moment." 
        });
    }
});

export default router;
