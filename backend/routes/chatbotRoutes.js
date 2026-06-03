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

        // Optionally resolve user authentication at the beginning for audit logging and instructions
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

        // Intercept and handle scanned QR Codes/Verification links directly from DB
        try {
            let qrData = null;
            if (message.trim().startsWith('{') && message.trim().endsWith('}')) {
                try {
                    qrData = JSON.parse(message);
                } catch (e) {
                    // Not valid JSON, ignore
                }
            }

            // Case 1: Digital ID Card QR Code
            if (qrData && qrData.type === 'digital_id') {
                const student = await prisma.user.findUnique({
                    where: { id: qrData.userId || qrData.id }
                });
                if (student) {
                    if (user) {
                        try {
                            await prisma.activity.create({
                                data: {
                                    userId: user.id,
                                    action: 'Scanned and verified Digital ID Card',
                                    type: 'security',
                                    details: `Verified Digital ID Card. Student Name: ${student.name}, ID: ${student.id}`,
                                    visibility: 'private'
                                }
                            });
                        } catch (logErr) {
                            console.error('Failed to log chatbot ID scan activity:', logErr);
                        }
                    }
                    return res.json({
                        success: true,
                        reply: `### 🔍 Verified Digital ID Card\n\nI have successfully scanned and verified the student's Digital ID Card from the EDOT database:\n\n*   **Name:** **${student.name}**\n*   **Email:** ${student.email}\n*   **Role:** \`${student.role.toUpperCase()}\`\n*   **Status:** \`${student.status.toUpperCase()}\`\n*   **Department:** ${student.department || 'Not Assigned'}\n*   **Specialization:** ${student.specialization || 'Not Assigned'}\n\n**System Verification:** ✅ **AUTHENTIC ID CARD**\n\n**Purpose:** This QR Code is dynamically generated on the student's portfolio page to permit campus building access, fast identity verification, and rapid daily class attendance roll calls.`
                    });
                } else {
                    return res.json({
                        success: true,
                        reply: `### ⚠️ Digital ID Verification Warning\n\nI scanned the Digital ID Card, but the user ID **"${qrData.userId || qrData.id}"** could not be found in our records.\n\n**Verification Status:** ❌ **INVALID OR SUSPENDED ACCOUNT**`
                    });
                }
            }
            // Case 2: Class Attendance Session QR Code
            else if (qrData && qrData.type === 'session_attendance') {
                const course = await prisma.course.findUnique({
                    where: { id: qrData.courseId },
                    include: { instructor: true }
                });
                if (course) {
                    if (user) {
                        try {
                            await prisma.activity.create({
                                data: {
                                    userId: user.id,
                                    action: 'Scanned class session check-in QR code',
                                    type: 'attendance',
                                    details: `Scanned class session QR code for course "${course.title}".`,
                                    visibility: 'private'
                                }
                            });
                        } catch (logErr) {
                            console.error('Failed to log chatbot session scan activity:', logErr);
                        }
                    }
                    return res.json({
                        success: true,
                        reply: `### 📅 Scanned Class Session Check-in\n\nI have successfully verified the class session details:\n\n*   **Course:** **${course.title}**\n*   **Instructor:** ${course.instructor?.name || 'Unassigned'}\n*   **Section:** \`${qrData.section || 'Main Section'}\`\n*   **Level:** ${course.level}\n\n**Check-in Instructions:** Students scan this QR code on a projector screen using the **"Scan Class QR"** button in their Attendance menu to instantly register their attendance for the day.`
                    });
                } else {
                    return res.json({
                        success: true,
                        reply: `### 📅 Scanned Class Session Check-in\n\nI detected a check-in QR code, but Course ID **"${qrData.courseId}"** is not logged in the database.`
                    });
                }
            }
            // Case 3: Certificate Verification URL / Hash / Code
            else if (message.includes('verify-certificate') || message.includes('EDOT-CERT-') || (message.includes('EDOT-') && message.split('-').length >= 3)) {
                let cleanHash = message.trim();
                if (message.includes('/verify-certificate/')) {
                    cleanHash = message.split('/verify-certificate/')[1].split(' ')[0].trim();
                }

                const certificate = await prisma.certificate.findFirst({
                    where: {
                        OR: [
                            { id: cleanHash },
                            { verificationHash: cleanHash }
                        ]
                    },
                    include: { user: true, course: true }
                });

                if (certificate) {
                    // Query associated sponsorship campaign securely
                    let sponsorship = null;
                    try {
                        sponsorship = await prisma.sponsorship.findFirst({
                            where: {
                                targetStudentId: certificate.userId,
                                courseId: certificate.courseId
                            }
                        });
                    } catch (e) {
                        console.error('Failed to query certificate sponsorship inside chatbot:', e);
                    }

                    let sponsorshipInfo = '';
                    if (sponsorship) {
                        const sponsorDisplayName = sponsorship.isAnonymous ? 'Anonymous Supporter (Privacy Protected 🔒)' : (sponsorship.sponsorName || 'EDOT Supporter');
                        sponsorshipInfo = `\n\n*   **Sponsorship Campaign:** \`${sponsorship.category.toUpperCase()}\`\n*   **Sponsorship Supporter:** ${sponsorDisplayName}\n*   **Funding Status:** Fully Funded ✅`;
                    }

                    if (user) {
                        try {
                            await prisma.activity.create({
                                data: {
                                    userId: user.id,
                                    action: 'Scanned and verified Certificate QR code',
                                    type: 'security',
                                    details: `Verified Certificate Hash: ${certificate.verificationHash} for student ${certificate.user?.name}`,
                                    visibility: 'private'
                                }
                            });
                        } catch (logErr) {
                            console.error('Failed to log chatbot QR scan activity:', logErr);
                        }
                    }

                    return res.json({
                        success: true,
                        reply: `### 🎓 Verified Academic Certificate\n\nI have officially verified the credentials for this certificate in the registry:\n\n*   **Recipient Student:** **${certificate.user?.name || 'Unknown'}**\n*   **Course Completed:** ${certificate.course?.title || 'Unknown Course'}\n*   **Completion Date:** ${new Date(certificate.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n*   **Credential Status:** ✅ **OFFICIALLY VERIFIED & SECURE**\n*   **Verification Tracking Hash:** \`${certificate.verificationHash}\`${sponsorshipInfo}\n\n**Purpose:** This QR Code is embedded on student PDF certificates to allow third-party verification (such as employers, universities, or sponsors) of their academic achievement.`
                    });
                } else {
                    return res.json({
                        success: true,
                        reply: `### 🎓 Certificate Verification Request\n\nI scanned for the verification code **"${cleanHash}"**, but could not find a matching record in our certificate logs.\n\nIf this certificate was just claimed, please reload the page or download it again. Otherwise, contact the EDOT support team for assistance.`
                    });
                }
            }
        } catch (err) {
            console.error('Error handling QR scan inside chatbot:', err);
        }

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key') {
             console.error('Gemini API Key is missing. Please configure GEMINI_API_KEY in the backend environment variables.');
             return res.status(500).json({ 
                 success: false, 
                 message: "I'm sorry, my chat system is currently undergoing maintenance. Please try again later."
             });
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

Behavioral Guidelines & Emotional Intelligence:
- Communicate with high emotional intelligence (EQ). Be deeply empathetic, validating user concerns, and showing understanding of their challenges.
- Be extremely patient, supportive, and gentle, regardless of how basic or complex the user's questions are.
- Address the user respectfully and personalize responses using their role (${user.role}).
- **Keep Progress & Retention Focus**: If they are an active student, politely check in on their learning journey. Encourage them to check their dashboard progress percentage, complete remaining lessons, take outstanding quizzes, and work towards earning their verified completion certificate. Challenge them to stay motivated and keep moving forward daily (e.g., "Keep up the excellent momentum! Let's conquer the next module together.").
- **Upsell & Cross-sell**: Suggest next-level or complementary courses (e.g. if they finished JavaScript, suggest Python or Machine Learning) politely to help them expand their skillset.
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

Sales & Interaction Strategy (with high EQ):
- Greet the visitor warmly. Politely ask about their background and interest (e.g., "Are you looking to upgrade your tech/business skills, track a child's progress, or sponsor a motivated student?").
- Act with high emotional intelligence (EQ) and empathy. Listen to their needs patiently, make them feel valued, and support their queries with care.
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
