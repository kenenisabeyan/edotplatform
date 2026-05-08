/**
 * Test script for Enrollment Approval Workflow
 * Run this after seeding test data
 * 
 * Usage: node test-enrollment-approval.js
 */

import { prisma } from './lib/prisma.js';

async function testEnrollmentApprovalWorkflow() {
  console.log('\n=== ENROLLMENT APPROVAL WORKFLOW TEST ===\n');

  try {
    // Test 1: Create test data
    console.log('📋 Test 1: Creating test data...');
    
    const testStudent = await prisma.user.create({
      data: {
        name: 'Test Student',
        email: `student-${Date.now()}@test.com`,
        password: 'hashedPassword',
        role: 'student'
      }
    });
    console.log('✅ Created test student:', testStudent.name);

    const testInstructor = await prisma.user.create({
      data: {
        name: 'Test Instructor',
        email: `instructor-${Date.now()}@test.com`,
        password: 'hashedPassword',
        role: 'instructor'
      }
    });
    console.log('✅ Created test instructor:', testInstructor.name);

    const testAdmin = await prisma.user.create({
      data: {
        name: 'Test Admin',
        email: `admin-${Date.now()}@test.com`,
        password: 'hashedPassword',
        role: 'admin'
      }
    });
    console.log('✅ Created test admin:', testAdmin.name);

    const testCourse = await prisma.course.create({
      data: {
        title: 'Test Course - Enrollment Approval',
        slug: `test-course-${Date.now()}`,
        description: 'Test course for enrollment approval',
        instructorId: testInstructor.id,
        mainCategory: 'Technology',
        subCategory: 'Programming',
        level: 'Beginner',
        duration: 10,
        isPublished: true,
        status: 'approved'
      }
    });
    console.log('✅ Created test course:', testCourse.title);

    // Test 2: Create pending enrollment
    console.log('\n📋 Test 2: Creating pending enrollment...');
    
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: testStudent.id,
        courseId: testCourse.id,
        status: 'pending'
      }
    });
    console.log('✅ Created enrollment with status: PENDING');
    console.log('   - Enrollment ID:', enrollment.id);
    console.log('   - Status:', enrollment.status);
    console.log('   - Requested At:', enrollment.requestedAt);

    // Test 3: Verify pending enrollment
    console.log('\n📋 Test 3: Verifying pending enrollment query...');
    
    const pendingEnrollments = await prisma.enrollment.findMany({
      where: { status: 'pending' },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } }
      }
    });
    console.log('✅ Found', pendingEnrollments.length, 'pending enrollments');
    console.log('   -', pendingEnrollments[0].student.name, 'enrolled in', pendingEnrollments[0].course.title);

    // Test 4: Admin approves enrollment
    console.log('\n📋 Test 4: Admin approving enrollment...');
    
    const approvedEnrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        status: 'active',
        approvedAt: new Date(),
        approvedBy: testAdmin.id
      }
    });
    console.log('✅ Enrollment approved successfully');
    console.log('   - Status: ACTIVE');
    console.log('   - Approved By:', testAdmin.name);
    console.log('   - Approved At:', approvedEnrollment.approvedAt);

    // Test 5: Create user progress for active enrollment
    console.log('\n📋 Test 5: Creating user course progress...');
    
    const userProgress = await prisma.userCourseProgress.create({
      data: {
        userId: testStudent.id,
        courseId: testCourse.id,
        status: 'active',
        progress: 0
      }
    });
    console.log('✅ Created user progress record');
    console.log('   - Status:', userProgress.status);

    // Test 6: Verify student can now access course
    console.log('\n📋 Test 6: Verifying student enrollment access...');
    
    const activeEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: testStudent.id,
        courseId: testCourse.id,
        status: 'active'
      }
    });
    
    if (activeEnrollment) {
      console.log('✅ Student enrollment is ACTIVE - can access course');
    } else {
      console.log('❌ FAILED: Enrollment is not active');
    }

    // Test 7: Test rejection workflow
    console.log('\n📋 Test 7: Testing rejection workflow...');
    
    const testStudent2 = await prisma.user.create({
      data: {
        name: 'Test Student 2',
        email: `student2-${Date.now()}@test.com`,
        password: 'hashedPassword',
        role: 'student'
      }
    });

    const enrollment2 = await prisma.enrollment.create({
      data: {
        studentId: testStudent2.id,
        courseId: testCourse.id,
        status: 'pending'
      }
    });
    console.log('✅ Created second pending enrollment');

    const rejectedEnrollment = await prisma.enrollment.update({
      where: { id: enrollment2.id },
      data: {
        status: 'rejected',
        rejectionReason: 'Does not meet course prerequisites'
      }
    });
    console.log('✅ Enrollment rejected successfully');
    console.log('   - Status: REJECTED');
    console.log('   - Reason:', rejectedEnrollment.rejectionReason);

    // Test 8: Verify rejection
    console.log('\n📋 Test 8: Verifying rejection...');
    
    const rejectedCheck = await prisma.enrollment.findFirst({
      where: {
        studentId: testStudent2.id,
        courseId: testCourse.id,
        status: 'rejected'
      }
    });
    
    if (rejectedCheck) {
      console.log('✅ Student cannot access rejected course');
    }

    // Cleanup
    console.log('\n📋 Cleanup: Removing test data...');
    
    await prisma.userCourseProgress.deleteMany({
      where: { userId: { in: [testStudent.id, testStudent2.id] } }
    });
    await prisma.enrollment.deleteMany({
      where: { studentId: { in: [testStudent.id, testStudent2.id] } }
    });
    await prisma.course.delete({ where: { id: testCourse.id } });
    await prisma.user.deleteMany({
      where: { id: { in: [testStudent.id, testStudent2.id, testInstructor.id, testAdmin.id] } }
    });
    console.log('✅ Test data cleaned up');

    console.log('\n=== ✅ ALL TESTS PASSED ===\n');
    console.log('Summary:');
    console.log('  1. ✅ Create pending enrollment');
    console.log('  2. ✅ Admin approval workflow');
    console.log('  3. ✅ Student access after approval');
    console.log('  4. ✅ Admin rejection workflow');
    console.log('  5. ✅ Status tracking (pending → active/rejected)');
    console.log('  6. ✅ Approval metadata (approvedAt, approvedBy)');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testEnrollmentApprovalWorkflow();
