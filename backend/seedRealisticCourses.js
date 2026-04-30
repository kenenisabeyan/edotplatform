import { prisma } from './lib/prisma.js';

const realisticCourses = [
  {
    title: "The Complete JavaScript Course 2024: From Zero to Expert!",
    slug: "complete-javascript-course-2024",
    description: "The modern JavaScript course for everyone! Master JavaScript with projects, challenges and theory. Many courses in one! Includes ES6+, OOP, asynchronous programming, and modern tooling.",
    mainCategory: "Programming & Technology",
    subCategory: "Web Development",
    level: "Beginner to Advanced",
    duration: 68.5,
    price: 19.99,
    rating: 4.8,
    totalStudents: 854000,
    requirements: ["No coding experience necessary to take this course!", "Any computer and OS will work — Windows, macOS or Linux."],
    whatYouWillLearn: ["Become an advanced, confident, and modern JavaScript developer from scratch", "Build 6 beautiful real-world projects for your portfolio (not boring toy apps)", "Become job-ready by understanding how JavaScript really works behind the scenes"]
  },
  {
    title: "Machine Learning A-Z: AI, Python & R + ChatGPT Bonus",
    slug: "machine-learning-a-z",
    description: "Learn to create Machine Learning Algorithms in Python and R from two Data Science experts. Code templates included. Covering Deep Learning, NLP, Reinforcement Learning, and XGBoost.",
    mainCategory: "Programming & Technology",
    subCategory: "Data Science",
    level: "Intermediate",
    duration: 42.5,
    price: 24.99,
    rating: 4.7,
    totalStudents: 980000,
    requirements: ["High school mathematics level.", "Basic Python or R programming knowledge."],
    whatYouWillLearn: ["Master Machine Learning on Python & R", "Make accurate predictions and powerful analysis", "Build robust Machine Learning models"]
  },
  {
    title: "Complete Python Bootcamp From Zero to Hero in Python",
    slug: "complete-python-bootcamp",
    description: "Learn Python like a Professional! Start from the basics and go all the way to creating your own applications and games. The most comprehensive and straight-forward course for the Python programming language.",
    mainCategory: "Programming & Technology",
    subCategory: "Programming Languages",
    level: "Beginner",
    duration: 22.0,
    price: 14.99,
    rating: 4.6,
    totalStudents: 1800000,
    requirements: ["Access to a computer with an internet connection."],
    whatYouWillLearn: ["Learn to use Python professionally, learning both Python 2 and Python 3!", "Create games with Python, like Tic Tac Toe and Blackjack!", "Learn advanced Python features, like the collections module and how to work with timestamps!"]
  },
  {
    title: "The Ultimate Drawing Course - Beginner to Advanced",
    slug: "ultimate-drawing-course",
    description: "Learn the #1 most important building block of all art, Drawing. This course will teach you how to draw like a pro! We will cover shading, perspective, character design, and figure drawing.",
    mainCategory: "Personal Development",
    subCategory: "Arts",
    level: "All Levels",
    duration: 11.0,
    price: 12.99,
    rating: 4.6,
    totalStudents: 540000,
    requirements: ["Paper, pencils, and an eraser.", "A desire to learn and practice."],
    whatYouWillLearn: ["Draw objects out of your head", "Understand the fundamentals of art", "Draw the human face and figure"]
  },
  {
    title: "MBA in a Box: Business Lessons from a CEO",
    slug: "mba-in-a-box",
    description: "Business strategy, Management, Marketing, Accounting, Decision making & Negotiation. Learn from an award-winning MBA professor and CEO.",
    mainCategory: "Business & Entrepreneurship",
    subCategory: "Business Strategy",
    level: "All Levels",
    duration: 14.5,
    price: 29.99,
    rating: 4.7,
    totalStudents: 210000,
    requirements: ["No prior business knowledge required.", "A willingness to learn and apply business concepts."],
    whatYouWillLearn: ["Start a company from scratch", "Understand the core concepts of marketing", "Manage a team and negotiate effectively"]
  },
  {
    title: "Mastering Data Structures & Algorithms using C and C++",
    slug: "data-structures-algorithms-c-cpp",
    description: "Learn, Analyse and Implement Data Structure using C and C++. Learn Recursive Algorithms, Sorting, Searching, Trees, Graphs, and Dynamic Programming.",
    mainCategory: "Mathematics & Natural Science",
    subCategory: "Computer Science",
    level: "Intermediate",
    duration: 58.5,
    price: 18.99,
    rating: 4.6,
    totalStudents: 320000,
    requirements: ["Basic knowledge of C and C++ programming.", "Understanding of arrays and pointers."],
    whatYouWillLearn: ["Learn various Popular Data Structures and their Algorithms.", "Develop your Analytical skills on Data Structure and use them efficiently.", "Learn Recursive Algorithms on Data Structures"]
  },
  {
    title: "TOEFL iBT (26+) Complete Preparation Course!",
    slug: "toefl-ibt-complete-preparation",
    description: "The most comprehensive TOEFL course online! Master Reading, Listening, Speaking, and Writing with proven strategies and practice tests.",
    mainCategory: "Natural Language",
    subCategory: "Test Prep",
    level: "Advanced",
    duration: 48.0,
    price: 24.99,
    rating: 4.8,
    totalStudents: 150000,
    requirements: ["Intermediate level of English (B1/B2)", "Dedication to practice consistently"],
    whatYouWillLearn: ["Master all 4 sections of the TOEFL iBT", "Learn specific strategies for every question type", "Score 100+ on your TOEFL exam"]
  },
  {
    title: "Psychology of Human Behavior",
    slug: "psychology-human-behavior",
    description: "Understand the fundamental principles of human psychology, cognitive biases, emotional intelligence, and social behavior in everyday life.",
    mainCategory: "Social Science",
    subCategory: "Psychology",
    level: "Beginner",
    duration: 12.5,
    price: 15.99,
    rating: 4.7,
    totalStudents: 85000,
    requirements: ["No prior psychology knowledge required", "Curiosity about human nature"],
    whatYouWillLearn: ["Understand why people behave the way they do", "Identify common cognitive biases in decision making", "Improve your emotional intelligence"]
  },
  {
    title: "Calculus 1: The Ultimate Calculus Course",
    slug: "calculus-1-ultimate",
    description: "Master limits, derivatives, and integrals with hundreds of practice problems and step-by-step video solutions.",
    mainCategory: "Mathematics & Natural Science",
    subCategory: "Mathematics",
    level: "Beginner",
    duration: 35.0,
    price: 19.99,
    rating: 4.9,
    totalStudents: 112000,
    requirements: ["Precalculus or Algebra 2 and Trigonometry"],
    whatYouWillLearn: ["Compute limits of complex functions", "Master all rules of differentiation", "Understand the fundamental theorem of calculus"]
  },
  {
    title: "Complete Digital Marketing Course - 12 Courses in 1",
    slug: "complete-digital-marketing",
    description: "Master Digital Marketing Strategy, Social Media Marketing, SEO, YouTube, Email, Facebook Marketing, Analytics & More!",
    mainCategory: "Business & Entrepreneurship",
    subCategory: "Marketing",
    level: "All Levels",
    duration: 22.5,
    price: 16.99,
    rating: 4.6,
    totalStudents: 750000,
    requirements: ["No prior marketing knowledge required", "Internet connection and a computer"],
    whatYouWillLearn: ["Grow a business online from scratch", "Make money as an affiliate marketer", "Get hired as a digital marketing expert"]
  }
];

async function main() {
  console.log("Starting realistic course seeding...");
  
  // Get an instructor user or create one
  let instructor = await prisma.user.findFirst({
    where: { role: 'instructor' }
  });

  if (!instructor) {
    instructor = await prisma.user.create({
      data: {
        name: "Dr. Angela Yu",
        email: "angela@edot.com",
        password: "hashedpassword123", // placeholder
        role: "instructor",
        bio: "Lead Instructor and Developer",
        status: "approved"
      }
    });
    console.log("Created fallback instructor.");
  }

  for (const courseData of realisticCourses) {
    // Check if course exists
    const existing = await prisma.course.findUnique({
      where: { slug: courseData.slug }
    });

    if (!existing) {
      await prisma.course.create({
        data: {
          ...courseData,
          instructorId: instructor.id,
          isPublished: true,
          status: "published"
        }
      });
      console.log(`Created: ${courseData.title}`);
    } else {
      console.log(`Already exists: ${courseData.title}`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
