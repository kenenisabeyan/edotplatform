import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import { Award, Download } from 'lucide-react';
import api from '../utils/api';
import useThemeMode from '../hooks/useThemeMode';
import QRCode from 'qrcode';

const edotLogo = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/jpw8g8m6spazsktyizdw';

export default function CertificatesView() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [claimedCertificates, setClaimedCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimingCourseId, setClaimingCourseId] = useState(null);

  const getCourseId = (item) => item.course?.id || item.courseId;

  const hasClaimedCertificate = (courseId) => claimedCertificates.some(cert => cert.courseId === courseId);

  const isCourseComplete = (enrollment) => {
    return enrollment.progress === 100 || enrollment.completed || enrollment.status === 'completed';
  };

  const hasPassedExam = (enrollment) => {
    return !enrollment.course?.isExamRequired || enrollment.passedFinalExam;
  };

  const getTotalLessons = (enrollment) => {
    const lessons = enrollment.course?.lessons;
    return Array.isArray(lessons) ? lessons.length : 0;
  };

  const getCompletedLessonCount = (enrollment) => {
    const completed = enrollment.completedLessons;
    if (Array.isArray(completed)) return completed.length;
    if (typeof completed === 'string') {
      try {
        return JSON.parse(completed).length;
      } catch {
        return 0;
      }
    }
    return 0;
  };

  const getLearningStatusLabel = (enrollment) => {
    const totalLessons = getTotalLessons(enrollment);
    const completedLessons = getCompletedLessonCount(enrollment);
    if (isCourseComplete(enrollment)) return 'Course complete';
    if (totalLessons === 0) return 'No lesson progress yet';
    return `${completedLessons}/${totalLessons} lessons completed`;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [enrolledResponse, certificatesResponse] = await Promise.all([
        api.get('/courses/enrolled'),
        api.get('/certificates')
      ]);

      setEnrolledCourses(enrolledResponse.data?.data || []);
      setClaimedCertificates(certificatesResponse.data?.data || []);

      try {
        await api.put('/users/mark-certificates-seen');
      } catch (markErr) {
        console.error('Failed to mark certificates as seen', markErr);
      }
    } catch (err) {
      console.error('Failed to fetch certificates data', err);
      setError(err.response?.data?.message || err.message || 'Failed to load certificates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClaimCertificate = async (courseId) => {
    try {
      setError(null);
      setClaimingCourseId(courseId);
      await api.post('/progress/certificate', { courseId });
      await fetchData();
      alert('Certificate claimed successfully.');
    } catch (err) {
      console.error('Failed to claim certificate', err);
      const serverMessage = err.response?.data?.message;
      const blockedReasons = err.response?.data?.blocked_by;
      const approvalRequired = err.response?.data?.approvalRequired;

      if (approvalRequired) {
        const approvalErrorText = "Certificate Generation Denied: Your enrollment must be approved by an admin first.";
        setError(approvalErrorText);
        alert(approvalErrorText);
      } else if (Array.isArray(blockedReasons) && blockedReasons.length > 0) {
        const reasonText = blockedReasons.map(item => `${item.lesson}: ${item.reason}`).join('\n');
        setError(`Certificate blocked: ${reasonText}`);
        alert(`Certificate blocked:\n${reasonText}`);
      } else {
        setError(serverMessage || 'Failed to claim certificate.');
        alert(serverMessage || 'Failed to claim certificate.');
      }
    } finally {
      setClaimingCourseId(null);
    }
  };

  const handleDownloadCertificate = async (enrolled) => {
    const courseName = enrolled.course?.title || 'Course';
    const duration = enrolled.course?.duration ? `${enrolled.course.duration} Hours` : 'Self-Paced';
    const level = enrolled.course?.level || 'Intermediate';
    const ceus = enrolled.course?.duration ? `${(enrolled.course.duration / 10).toFixed(1)} CEUs` : '3.0 CEUs';
    const dateCompleted = new Date(enrolled.updatedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const instructorName = enrolled.course?.instructor?.name || 'EDOT Instructor';

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = edotLogo;
    await new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve; // Continue even if logo fails
    });

    const getCircularLogo = (image) => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.arc(image.width / 2, image.height / 2, Math.min(image.width, image.height) / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(image, 0, 0, image.width, image.height);
      return canvas.toDataURL('image/png');
    };

    const doc = new jsPDF('landscape', 'mm', 'a4');
    const certId = `EDOT-CERT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    
    // Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F');
    
    // Outer Orange Border
    doc.setDrawColor(249, 115, 22); // #00D4FF
    doc.setLineWidth(1);
    doc.rect(5, 5, 287, 200);
    // Inner Orange Border
    doc.setLineWidth(0.3);
    doc.rect(7, 7, 283, 196);

    // Top Left Corner Polygon (Orange shadow and Dark Navy)
    doc.setFillColor(249, 115, 22);
    doc.triangle(0, 0, 95, 0, 0, 105, 'F');
    doc.setFillColor(11, 17, 32); // #0B1120
    doc.triangle(0, 0, 90, 0, 0, 100, 'F');
    
    // Bottom Right Corner
    doc.setFillColor(249, 115, 22);
    doc.triangle(297, 210, 207, 210, 297, 145, 'F');
    doc.setFillColor(11, 17, 32);
    doc.triangle(297, 210, 212, 210, 297, 150, 'F');

    // Ribbon Top Right
    doc.setFillColor(11, 17, 32);
    doc.rect(255, 0, 16, 45, 'F');
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(0.5);
    doc.rect(256, 0, 14, 44);
    // Ribbon bottom cut (triangle)
    doc.setFillColor(255, 255, 255);
    doc.triangle(255, 45, 263, 38, 271, 45, 'F');

    // Seal on Ribbon
    doc.setFillColor(249, 115, 22);
    doc.circle(263, 40, 14, 'F');
    doc.setFillColor(11, 17, 32);
    doc.circle(263, 40, 11, 'F');
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(0.5);
    doc.circle(263, 40, 9);
    
    doc.setTextColor(249, 115, 22);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.text('VERIFIED', 263, 37, {align: 'center'});
    doc.text('CERTIFICATE', 263, 43, {align: 'center'});

    // Logo & Top Left Text
    try {
      if (img.width > 0) {
        doc.addImage(getCircularLogo(img), 'PNG', 15, 15, 20, 20);
        // Orange border around circular logo
        doc.setDrawColor(249, 115, 22);
        doc.setLineWidth(0.5);
        doc.circle(25, 25, 10, 'S');
      }
    } catch (e) {}
    doc.setTextColor(249, 115, 22);
    doc.setFontSize(10);
    doc.text('EDOT', 25, 42, {align: 'center'});
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('Learn. Teach. Support.', 25, 47, {align: 'center'});
    doc.text('Sponsor a Future.', 25, 50, {align: 'center'});

    // Certificate ID
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(7);
    doc.text('Certificate ID:', 240, 20, {align: 'right'});
    doc.setTextColor(11, 17, 32);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(certId, 240, 25, {align: 'right'});

    // MAIN TITLE
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 17, 32);
    doc.setFontSize(42);
    doc.text('CERTIFICATE', 148.5, 45, {align: 'center'});
    
    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(249, 115, 22);
    doc.text('OF COMPLETION', 148.5, 55, {align: 'center'});
    
    // Lines around OF COMPLETION
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(0.5);
    doc.line(95, 53.5, 120, 53.5);
    doc.line(177, 53.5, 202, 53.5);
    doc.setFillColor(249, 115, 22);
    doc.circle(95, 53.5, 1, 'F');
    doc.circle(202, 53.5, 1, 'F');

    // Proudly presented
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text('THIS IS PROUDLY PRESENTED TO', 148.5, 75, {align: 'center'});

    // Student Name
    doc.setFont('times', 'italic');
    doc.setTextColor(11, 17, 32);
    doc.setFontSize(45);
    doc.text(user?.name || 'Test User', 148.5, 98, {align: 'center'});

    // Line below name
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(0.5);
    doc.line(90, 108, 207, 108);
    doc.setFillColor(249, 115, 22);
    // Draw a small diamond in the middle of the line
    doc.triangle(148.5, 106, 150.5, 108, 148.5, 110, 'F');
    doc.triangle(148.5, 106, 146.5, 108, 148.5, 110, 'F');

    // Course completion text
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.text('For successfully completing the course', 148.5, 122, {align: 'center'});

    // Course Name
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 17, 32);
    doc.setFontSize(26);
    doc.text(courseName.toUpperCase(), 148.5, 138, {align: 'center'});

    // Paragraph
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text('This course covered essential topics and practical applications of the subject matter.\nThe holder has demonstrated dedication, knowledge, and a commitment to learning.', 148.5, 150, {align: 'center', lineHeightFactor: 1.5});

    // Four Columns
    // DATE | DURATION | LEVEL | CREDIT EARNED
    const colY = 165;
    // Dividers
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(105, 158, 105, 173);
    doc.line(148.5, 158, 148.5, 173);
    doc.line(192, 158, 192, 173);

    // DATE
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(50, 50, 50);
    doc.text('DATE OF COMPLETION', 75, colY, {align: 'center'});
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(11, 17, 32);
    doc.text(dateCompleted, 75, colY + 5, {align: 'center'});

    // DURATION
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(50, 50, 50);
    doc.text('DURATION', 126.5, colY, {align: 'center'});
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(11, 17, 32);
    doc.text(duration, 126.5, colY + 5, {align: 'center'});

    // LEVEL
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(50, 50, 50);
    doc.text('LEVEL', 170.5, colY, {align: 'center'});
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(11, 17, 32);
    doc.text(level, 170.5, colY + 5, {align: 'center'});

    // CREDIT EARNED
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(50, 50, 50);
    doc.text('CREDIT EARNED', 222, colY, {align: 'center'});
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(11, 17, 32);
    doc.text(ceus, 222, colY + 5, {align: 'center'});

    // Signatures
    const sigY = 192;
    
    // Left
    doc.setFont('times', 'italic');
    doc.setFontSize(22);
    doc.setTextColor(11, 17, 32);
    doc.text(instructorName, 100, sigY - 2, {align: 'center'});
    
    doc.setDrawColor(249, 115, 22);
    doc.line(75, sigY, 125, sigY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(11, 17, 32);
    doc.text(instructorName, 100, sigY + 5, {align: 'center'});
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('Course Instructor', 100, sigY + 9, {align: 'center'});

    // Right
    doc.setFont('times', 'italic');
    doc.setFontSize(22);
    doc.setTextColor(11, 17, 32);
    doc.text('EDOT Administration', 197, sigY - 2, {align: 'center'});
    
    doc.setDrawColor(249, 115, 22);
    doc.line(172, sigY, 222, sigY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(11, 17, 32);
    doc.text('EDOT Administration', 197, sigY + 5, {align: 'center'});
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('Academic Director', 197, sigY + 9, {align: 'center'});

    // Center Gold Badge
    doc.setFillColor(249, 115, 22);
    doc.circle(148.5, sigY, 10, 'F');
    doc.setFillColor(255, 255, 255);
    doc.circle(148.5, sigY, 8, 'F');
    doc.setFillColor(249, 115, 22);
    doc.circle(148.5, sigY, 6, 'F');
    
    // QR Code visual (Real)
    try {
      const verifyUrl = `${window.location.origin}/verify-certificate/${certId}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        margin: 0,
        width: 300,
        color: { dark: '#0B1120', light: '#FFFFFF' }
      });
      doc.addImage(qrDataUrl, 'PNG', 260, 180, 16, 16);
    } catch (e) {
      console.error('Failed to generate QR code', e);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(255, 255, 255);
    doc.text('Verify Certificate', 268, 202, {align: 'center'});
    doc.text('edot.org/verify', 268, 205, {align: 'center'});

    doc.save(`${courseName.replace(/\s+/g, '_')}_Certificate.pdf`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={`w-10 h-10 border-4 border-t-[#00D4FF] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-12 text-center rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-[#0B1120]/90 border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-900'}`}>
        <h3 className="text-xl font-bold mb-3">Unable to load certificates</h3>
        <p className="text-sm mb-6">{error}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center justify-center rounded-full-full bg-[#00D4FF] px-6 py-3 text-sm font-bold text-white hover:bg-[#EA580C]"
        >
          Retry
        </button>
      </div>
    );
  }

  const claimableCourses = enrolledCourses.filter(enrollment => {
    const courseId = getCourseId(enrollment);
    return isCourseComplete(enrollment) && hasPassedExam(enrollment) && !hasClaimedCertificate(courseId);
  });

  const blockedCourses = enrolledCourses.filter(enrollment => {
    const courseId = getCourseId(enrollment);
    return isCourseComplete(enrollment) && !hasPassedExam(enrollment) && !hasClaimedCertificate(courseId);
  });

  const inProgressCourses = enrolledCourses.filter(enrollment => {
    const courseId = getCourseId(enrollment);
    return !isCourseComplete(enrollment) && !hasClaimedCertificate(courseId);
  });

  const claimedCount = claimedCertificates.length;
  const claimableCount = claimableCourses.length;

  return (
    <div className="animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-none w-full">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 pt-2 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Award className="w-8 h-8 text-[#00D4FF]" />
            My Certificates
          </h1>
          <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
            Your official credential hub for course completion and certificate claims.
          </p>
        </div>
      </div>

      {claimableCount === 0 && claimedCount === 0 && blockedCourses.length === 0 && inProgressCourses.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border shadow-2xl flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#0B1120]/90 backdrop-blur-xl border-white/10' : 'bg-white/95 border-slate-200'}`}>
          <div className={`w-20 h-20 border rounded-full flex items-center justify-center mb-4 shadow-sm ${isDarkMode ? 'bg-[#0B1120]/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
            <Award className="w-10 h-10" />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No certificates yet</h3>
          <p className={`max-w-sm mb-6 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>
            Complete courses, finish required lessons, and pass any exams to unlock your official certificates.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {claimableCount > 0 && (
            <div className="space-y-6">
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Ready to Claim</h2>
                <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                  These courses are complete and eligible for certificates. Claim them to record your achievement.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {claimableCourses.map((enrollment) => {
                  const courseId = getCourseId(enrollment);
                  return (
                    <div key={`claim-${courseId}`} className={`rounded-3xl border p-6 shadow-sm ${isDarkMode ? 'bg-[#0B1120] border-slate-700' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-[#1E2A44]' : 'bg-slate-100'}`}>
                          <Award className="w-7 h-7 text-[#00D4FF]" />
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{enrollment.course?.title || 'Completed Course'}</h3>
                          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Completed on {new Date(enrollment.updatedAt || Date.now()).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="mb-4 text-sm text-slate-500">
                        {getLearningStatusLabel(enrollment)} • {enrollment.course?.isExamRequired ? 'Final exam passed' : 'No final exam required'}
                      </div>
                      <button
                        onClick={() => handleClaimCertificate(courseId)}
                        disabled={claimingCourseId === courseId}
                        className={`w-full inline-flex justify-center items-center gap-2 rounded-full px-5 py-3 font-bold transition ${claimingCourseId === courseId ? 'bg-slate-500 text-white cursor-wait' : 'bg-[#00D4FF] hover:bg-[#EA580C] text-white'}`}
                      >
                        {claimingCourseId === courseId ? 'Claiming…' : 'Claim Certificate'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {blockedCourses.length > 0 && (
            <div className={`rounded-3xl border p-6 ${isDarkMode ? 'bg-[#111827] border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <h2 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Pending Requirements</h2>
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                These courses are complete but still require final exam validation before a certificate can be issued.
              </p>
              <div className="mt-6 grid gap-4">
                {blockedCourses.map((enrollment) => (
                  <div key={`blocked-${getCourseId(enrollment)}`} className={`rounded-2xl border p-4 ${isDarkMode ? 'bg-[#0B1120] border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-center gap-4 mb-3">
                      <div>
                        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{enrollment.course?.title || 'Course'}</h3>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Complete the final exam to claim your certificate.</p>
                      </div>
                      <span className={`text-xs uppercase font-bold ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`}>Action needed</span>
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                      {getLearningStatusLabel(enrollment)} • Final exam required
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {inProgressCourses.length > 0 && (
            <div className={`rounded-3xl border p-6 ${isDarkMode ? 'bg-[#111827] border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <h2 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Progressing Toward Certificates</h2>
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                These courses are still in progress. Finish the remaining lessons and any required exam to unlock the certificate.
              </p>
              <div className="mt-6 grid gap-4">
                {inProgressCourses.map((enrollment) => (
                  <div key={`progress-${getCourseId(enrollment)}`} className={`rounded-2xl border p-4 ${isDarkMode ? 'bg-[#0B1120] border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-center gap-4 mb-3">
                      <div>
                        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{enrollment.course?.title || 'Course'}</h3>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{getLearningStatusLabel(enrollment)}</p>
                      </div>
                      <span className={`text-xs uppercase font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>{Math.round(enrollment.progress || 0)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 dark:bg-slate-800 overflow-hidden mb-3">
                      <div className="h-full bg-[#00D4FF] rounded-full" style={{ width: `${Math.min(100, enrollment.progress || 0)}%` }}></div>
                    </div>
                    <button
                      onClick={() => window.open(`/course/${enrollment.course?.id || getCourseId(enrollment)}`, '_blank')}
                      className={`inline-flex justify-center w-full items-center gap-2 rounded-full px-4 py-3 font-bold transition ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-[#00D4FF] hover:bg-[#EA580C] text-white'}`}
                    >
                      Continue Course
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {claimedCount > 0 && (
            <div className="space-y-6">
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Claimed Certificates</h2>
                <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                  These certificates have already been issued to your account. Download the PDF when you're ready.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {claimedCertificates.map((cert) => (
                  <div key={cert.id} className={`rounded-3xl border p-6 shadow-sm ${isDarkMode ? 'bg-[#0B1120] border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-[#1E2A44]' : 'bg-slate-100'}`}>
                        <Award className="w-7 h-7 text-[#00D4FF]" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{cert.course?.title || 'Certificate'}</h3>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Issued {new Date(cert.issueDate || Date.now()).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Official certificate recorded in your learner profile.
                    </p>
                    <button
                      onClick={() => handleDownloadCertificate({ course: cert.course, updatedAt: cert.issueDate })}
                      className={`w-full inline-flex justify-center items-center gap-2 rounded-full px-5 py-3 font-bold transition ${isDarkMode ? 'bg-[#0B1120] border border-slate-700 text-white hover:bg-[#111827]' : 'bg-[#00D4FF] hover:bg-[#0099CC] text-white'}`}
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
