import { prisma } from '../lib/prisma.js';

export const createQuiz = async (req, res) => {
    try {
        const { lessonId, title, questions } = req.body;
        
        const quiz = await prisma.quiz.create({
            data: {
                lessonId,
                title,
                questions
            }
        });
        res.status(201).json({ success: true, data: quiz });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getQuizzesByLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const quizzes = await prisma.quiz.findMany({
            where: { lessonId },
            orderBy: { createdAt: 'asc' }
        });
        res.status(200).json({ success: true, data: quizzes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
