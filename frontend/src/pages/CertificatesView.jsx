import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import { Award, Download } from 'lucide-react';
import api from '../utils/api';
import useThemeMode from '../hooks/useThemeMode';

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

  const handleDownloadCertificate = async (courseName) => {
    const img = new Image();
    img.src = '/edot-logo.png';
    await new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve; // Continue even if logo fails
    });

    const doc = new jsPDF('landscape');
    const dateCompleted = new Date().toLocaleDateString();
    
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 297, 210, 'F');
    
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);

    try {
      doc.addImage(img, 'PNG', 133.5, 20, 30, 25);
    } catch {
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(40);
    doc.text('Certificate of Completion', 148.5, 60, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('This is proudly presented to', 148.5, 90, { align: 'center' });
    
    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text(user?.name || 'Amazing Student', 148.5, 110, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text('For successfully completing the course:', 148.5, 130, { align: 'center' });
    
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(courseName || 'Course', 148.5, 150, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Date: ${dateCompleted}`, 148.5, 180, { align: 'center' });
    
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
                    onClick={() => handleDownloadCertificate(enrolled.course?.title)}
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
