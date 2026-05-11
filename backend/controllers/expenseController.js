import { prisma } from '../lib/prisma.js';

// Get all expenses
export const getExpenses = async (req, res) => {
  try {
    // 1. Fetch manually recorded expenses (Servers, Marketing, etc)
    const expenses = await prisma.expense.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    let formattedExpenses = expenses.map(exp => ({
      ...exp,
      date: exp.date.toISOString().split('T')[0]
    }));

    // 2. Fetch all approved enrollments to calculate instructor payouts dynamically
    const enrollments = await prisma.enrollment.findMany({
      where: { status: 'approved' },
      include: {
        course: {
          select: {
            title: true,
            price: true,
            instructor: { select: { name: true } }
          }
        }
      }
    });

    // 3. Aggregate revenue per course
    const courseRevenue = {};
    enrollments.forEach(enroll => {
       if (enroll.course && enroll.course.price > 0) {
          const courseTitle = enroll.course.title;
          const instructorName = enroll.course.instructor?.name || 'Unknown Instructor';
          const price = enroll.course.price;
          const key = `${courseTitle}-${instructorName}`;
          
          if (!courseRevenue[key]) {
             courseRevenue[key] = {
               courseTitle,
               instructorName,
               totalRevenue: 0
             };
          }
          courseRevenue[key].totalRevenue += price;
       }
    });

    // 4. Generate dynamic 'Instructor Payouts' (70% revenue share)
    const dynamicPayouts = Object.values(courseRevenue).map((rev, index) => ({
       id: `dynamic-payout-${index}`,
       category: 'Instructor Payouts',
       description: `${rev.courseTitle} (70% share for ${rev.instructorName})`,
       amount: rev.totalRevenue * 0.70,
       status: 'pending',
       date: new Date().toISOString().split('T')[0],
       isDynamic: true
    }));

    // Combine static expenses with dynamic payouts
    const allExpenses = [...dynamicPayouts, ...formattedExpenses];

    res.status(200).json({ success: true, data: allExpenses });
  } catch (err) {
    console.error('Failed to get expenses', err);
    res.status(500).json({ success: false, message: 'Server error fetching expenses' });
  }
};

// Create a new expense
export const createExpense = async (req, res) => {
  const { category, description, amount, status } = req.body;

  try {
    const expense = await prisma.expense.create({
      data: {
        category,
        description,
        amount: Number(amount),
        status: status || 'paid',
        date: new Date()
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Expense recorded successfully', 
      data: { ...expense, date: expense.date.toISOString().split('T')[0] } 
    });
  } catch (err) {
    console.error('Failed to create expense', err);
    res.status(500).json({ success: false, message: 'Server error creating expense' });
  }
};
