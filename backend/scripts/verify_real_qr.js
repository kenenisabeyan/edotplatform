import { prisma } from '../lib/prisma.js';

async function verifyRealEntities() {
    try {
        console.log('--- Fetching real database records for testing ---');
        const user = await prisma.user.findFirst({ select: { id: true, name: true, email: true } });
        const course = await prisma.course.findFirst({ select: { id: true, title: true } });
        const certificate = await prisma.certificate.findFirst({ select: { id: true, verificationHash: true } });

        console.log('Real User:', user);
        console.log('Real Course:', course);
        console.log('Real Certificate:', certificate);

        if (user) {
            console.log('\n--- 1. Testing Real Digital ID ---');
            const res1 = await fetch('http://localhost:5005/api/chatbot/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: JSON.stringify({ userId: user.id, email: user.email, role: 'student', type: 'digital_id' }),
                    history: []
                })
            });
            const data1 = await res1.json();
            console.log(data1.reply);
        }

        if (course) {
            console.log('\n--- 2. Testing Real Course Session Check-in ---');
            const res2 = await fetch('http://localhost:5005/api/chatbot/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: JSON.stringify({ type: 'session_attendance', courseId: course.id, section: 'Main Section' }),
                    history: []
                })
            });
            const data2 = await res2.json();
            console.log(data2.reply);
        }

        if (certificate) {
            console.log('\n--- 3. Testing Real Certificate Verification ---');
            const res3 = await fetch('http://localhost:5005/api/chatbot/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `http://localhost:5173/verify-certificate/${certificate.verificationHash}`,
                    history: []
                })
            });
            const data3 = await res3.json();
            console.log(data3.reply);
        }

    } catch (error) {
        console.error('Verification error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifyRealEntities();
