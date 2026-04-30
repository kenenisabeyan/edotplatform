import { prisma } from '../lib/prisma.js';

export const createMaterial = async (req, res) => {
    try {
        const { lessonId, title, fileUrl, fileType, duration } = req.body;
        
        if (!lessonId || !title || !fileUrl || !fileType) {
            return res.status(400).json({ success: false, message: 'Please provide lessonId, title, fileUrl, and fileType' });
        }
        
        const material = await prisma.material.create({
            data: {
                lessonId,
                title,
                fileUrl,
                fileType,
                duration: duration || null
            }
        });
        
        res.status(201).json({ success: true, data: material });
    } catch (error) {
        console.error('Error creating material:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getMaterialsByLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const materials = await prisma.material.findMany({
            where: { lessonId },
            orderBy: { createdAt: 'asc' }
        });
        res.status(200).json({ success: true, data: materials });
    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const deleteMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.material.delete({
            where: { id }
        });
        res.status(200).json({ success: true, message: 'Material deleted successfully' });
    } catch (error) {
        console.error('Error deleting material:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
