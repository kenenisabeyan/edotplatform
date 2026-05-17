import { prisma } from './lib/prisma.js';

const categories = [
  { name: 'Social Science', description: 'This curriculum path is designed to enable learners to travel inside human society, increasing awareness to grow understanding of history, behavior, and society.' },
  { name: 'Mathematics & Natural Science', description: 'This training curriculum allows people to develop a step-by-step rigorous analytical system to build the required logic for the purpose, dreams, and life.' },
  { name: 'Natural Language', description: 'This language path is engineered to empower seamless global communication. The training lets learners balance their social interaction.' },
  { name: 'Programming & Technology', description: 'This curriculum is the track to tech mastery. It\'s designed to create \'Aha\' moments and increase awareness to grow into highly sought-after software developers.' },
  { name: 'Business & Entrepreneurship', description: 'This premium curriculum enables future leaders to navigate markets independently. It helps construct financial stability, leadership, and management.' },
  { name: 'Personal Development', description: 'This training empowers individuals to unlock self-mastery. Develop habits and physical, mental, and social goals that directly translate to long-term success.' }
];

async function main() {
  for (const cat of categories) {
    const existing = await prisma.learnerGroup.findUnique({
      where: { name: cat.name }
    });

    if (!existing) {
      console.log(`Creating LearnerGroup: ${cat.name}`);
      await prisma.learnerGroup.create({
        data: {
          name: cat.name,
          description: cat.description
        }
      });
    } else {
      console.log(`Updating LearnerGroup: ${cat.name}`);
      await prisma.learnerGroup.update({
        where: { name: cat.name },
        data: { description: cat.description }
      });
    }
  }
  console.log('Successfully seeded categories!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
