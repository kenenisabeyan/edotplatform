import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import { Award, Download } from 'lucide-react';
import api from '../utils/api';
import useThemeMode from '../hooks/useThemeMode';

const edotLogo = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/e69zbyhv3obsuf4uknyy';

export default function CertificatesView() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const { data } = await api.get('/users/mycourses');
        const enrolled = data.enrolledCourses || [];
        const completed = enrolled.filter(e => {
            if (e.progress < 100) return false;
            if (e.course?.isExamRequired && !e.passedFinalExam) return false;
            return true;
        });
        setCompletedCourses(completed);

        try {
          await api.put('/users/mark-certificates-seen');
        } catch (markErr) {
          console.error('Failed to mark certificates as seen', markErr);
        }
      } catch (err) {
        console.error('Failed to fetch user completed courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

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
    doc.setDrawColor(249, 115, 22); // #F97316
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
    const colY = 175;
    // Dividers
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(105, 165, 105, 180);
    doc.line(148.5, 165, 148.5, 180);
    doc.line(192, 165, 192, 180);

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
    const sigY = 195;
    
    // Left
    doc.setFont('times', 'italic');
    doc.setFontSize(22);
    doc.setTextColor(11, 17, 32);
    doc.text(instructorName, 75, sigY - 2, {align: 'center'});
    
    doc.setDrawColor(249, 115, 22);
    doc.line(50, sigY, 100, sigY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(11, 17, 32);
    doc.text(instructorName, 75, sigY + 5, {align: 'center'});
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('Course Instructor', 75, sigY + 9, {align: 'center'});

    // Right
    doc.setFont('times', 'italic');
    doc.setFontSize(22);
    doc.setTextColor(11, 17, 32);
    doc.text('EDOT Administration', 222, sigY - 2, {align: 'center'});
    
    doc.setDrawColor(249, 115, 22);
    doc.line(197, sigY, 247, sigY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(11, 17, 32);
    doc.text('EDOT Administration', 222, sigY + 5, {align: 'center'});
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('Academic Director', 222, sigY + 9, {align: 'center'});

    // Center Gold Badge
    doc.setFillColor(249, 115, 22);
    doc.circle(148.5, sigY, 10, 'F');
    doc.setFillColor(255, 255, 255);
    doc.circle(148.5, sigY, 8, 'F');
    doc.setFillColor(249, 115, 22);
    doc.circle(148.5, sigY, 6, 'F');
    
    // QR Code visual
    doc.setFillColor(0, 0, 0);
    doc.rect(260, 180, 16, 16, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(261, 181, 14, 14, 'F');
    doc.setFillColor(0, 0, 0);
    doc.rect(262, 182, 3, 3, 'F');
    doc.rect(270, 182, 3, 3, 'F');
    doc.rect(262, 190, 3, 3, 'F');
    doc.rect(266, 186, 2, 2, 'F');
    doc.rect(268, 189, 4, 2, 'F');
    doc.rect(263, 187, 2, 2, 'F');

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
        <div className={`w-10 h-10 border-4 border-t-[#F97316] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 pt-2 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Award className="w-8 h-8 text-[#00D4FF]" />
            My Certificates
          </h1>
          <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Download and share your achievements.</p>
        </div>
      </div>

      {completedCourses.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border shadow-2xl flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#0B1120]/90 backdrop-blur-xl border-white/10' : 'bg-white/95 border-slate-200'}`}>
           <div className={`w-20 h-20 border rounded-full flex items-center justify-center mb-4 shadow-sm ${isDarkMode ? 'bg-[#0B1120]/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
             <Award className="w-10 h-10" />
           </div>
           <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No certificates yet</h3>
           <p className={`max-w-sm mb-6 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Complete a course 100% and pass the final exam (if required) to earn your first certificate.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedCourses.map((enrolled) => (
            <div key={enrolled.course?.id} className={`rounded-3xl border shadow-2xl overflow-hidden group transition-colors ${isDarkMode ? 'bg-[#0B1120]/90 backdrop-blur-xl border-white/10 hover:border-[#F97316]/30' : 'bg-white/95 border-slate-200 hover:border-indigo-300 hover:shadow-lg'}`}>
              <div className={`aspect-[4/3] border-b p-8 flex flex-col items-center justify-center relative ${isDarkMode ? 'bg-gradient-to-br from-[#00D4FF]/5 to-[#0B1120] border-white/10' : 'bg-gradient-to-br from-indigo-50 to-white border-slate-200'}`}>
                <Award className={`w-16 h-16 mb-4 drop-shadow-sm ${isDarkMode ? 'text-[#F97316]' : 'text-indigo-500'}`} />
                <h3 className={`font-bold text-center line-clamp-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{enrolled.course?.title}</h3>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <button 
                    onClick={() => handleDownloadCertificate(enrolled)}
                    className={`flex items-center gap-2 bg-gradient-to-r from-[#00D4FF] to-[#0099CC] px-6 py-3 rounded-full font-bold shadow-[0_0_15px_rgba(0,212,255,0.5)] hover:-translate-y-0.5 transition-all transform scale-95 group-hover:scale-100 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              </div>
              <div className={`p-4 flex justify-between items-center ${isDarkMode ? 'bg-[#0B1120]/5' : 'bg-slate-50'}`}>
                <div className={`text-xs font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Issued to</div>
                <div className={`text-sm font-bold truncate ml-4 ${isDarkMode ? 'text-[#F97316]' : 'text-indigo-600'}`}>{user?.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
