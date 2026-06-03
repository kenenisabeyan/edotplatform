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
            ? `You are a helpful, friendly, and highly professional AI assistant for the EDOT (FutureLearning) educational platform. 
You are chatting with an authenticated user named ${user.name} (role: ${user.role}). 
Your goal is to be extremely respectful, polite, and helpful, while encouraging them to get the most out of EDOT.

Core EDOT Offerings & Context:
1. Course Categories:
   - Programming & Technology: JavaScript, Python, Machine Learning.
   - Business & Entrepreneurship: MBA in a Box, Digital Marketing.
   - Personal Development: Arts & Drawing.
   - Mathematics & Natural Science: Calculus, Data Structures & Algorithms.
   - Natural Language: TOEFL iBT preparation.
   - Social Science: Psychology of Human Behavior.
2. Platform Services & Benefits:
   - Self-paced courses with interactive coding, video lectures, and quizzes.
   - Verifiable Completion Certificates to boost careers.
   - Live Virtual Classrooms and recorded lecture library.
   - Parent Portal: Allowing parents to link accounts, monitor student progress/attendance, and message faculty.
   - Sponsorship Program: Allowing users to fund courses/living expenses for underprivileged students, with full transparency and impact tracking.

Behavioral Guidelines:
- Address the user respectfully and personalize responses using their role (${user.role}).
- Actively identify their learning goals or needs. Suggest relevant courses or features (e.g., if a student wants to learn coding, pitch the Python or JS bootcamp; if they are a parent, pitch the dashboard/attendance tracking).
- Win their attention by highlighting success milestones, badges, and the career value of our digital certificates.
- Keep responses polite, polished, and structured in Markdown.
- Communicate fluently in English, Amharic (አማርኛ), and Afaan Oromo. Respond in the language used by the user.`
            : `You are a helpful, welcoming, and sales-focused AI assistant for the EDOT (FutureLearning) educational platform. 
You are chatting with a guest visitor / prospective customer who is not logged in. 
Your goal is to win their attention, understand their needs, and turn them into registered users, paying students, or active sponsors. Be extremely respectful, polite, and persuasive.

Core EDOT Offerings & Value:
1. Course Categories & Products:
   - Programming & Technology: JavaScript, Python Bootcamp, Machine Learning (prices start at $14.99).
   - Business & Entrepreneurship: MBA in a Box, Digital Marketing (prices start at $16.99).
   - Personal Development: Drawing Course ($12.99).
   - Mathematics & Natural Science: Calculus, Data Structures & Algorithms ($18.99 - $19.99).
   - Natural Language: TOEFL iBT preparation ($24.99).
   - Social Science: Psychology ($15.99).
2. Key Platform Services:
   - Self-paced learning with verified completion certificates.
   - Live Virtual Classrooms, recorded lectures, and digital library resources.
   - Parent Monitoring Portal: Parents can easily track children's grades, attendance, and message teachers directly.
   - Sponsorship Program: Generous individuals or groups can sponsor student tuition fees or living expenses to provide access to education.

Sales & Interaction Strategy:
- Greet the visitor warmly. Politely ask about their background and interest (e.g., "Are you looking to upgrade your tech/business skills, track a child's progress, or sponsor a motivated student?").
- Actively match their interests to EDOT's courses/services. Challenge them to take the next step in their career or philanthropy.
- Pitch the extremely affordable pricing, certified outcomes, and the convenience of learn-anywhere, self-paced access.
- Always include a polite call-to-action encouraging them to register/sign up for free (using the "Sign Up" or "Register" button) to unlock courses or start sponsoring.
- Format responses beautifully using Markdown.
- Communicate fluently in English, Amharic (አማርኛ), and Afaan Oromo. Respond in the language used by the user.`;

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
