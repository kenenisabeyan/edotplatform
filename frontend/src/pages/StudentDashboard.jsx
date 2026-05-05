import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  BookOpen, CheckCircle2, Award, Search, LayoutDashboard, 
  Settings, LogOut, Target, Plus, Bell, Monitor, TrendingUp, MoreHorizontal,
  PlayCircle, Download, ShieldCheck, Globe, ShoppingCart, Users, Coins, Package, Banknote, Wallet, FileText, Moon, Sun
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
const edotLogo = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/e69zbyhv3obsuf4uknyy';
import ProfileView from './ProfileView';
import ActivityFeed from '../components/ActivityFeed';
import EcosystemNexus from '../components/EcosystemNexus';
import StudentDashboardCourses from '../components/StudentDashboardCourses';
import PackageCard from '../components/student/PackageCard';
import ThemeDropdown from '../components/ThemeDropdown';
import useThemeMode from '../hooks/useThemeMode';
import { PACKAGES } from '../constants/packages';

const CAT_COLORS = {
  "Social Science": { main: "#F97316", dark: "#C2410C" }, 
  "Mathematics & Natural Science": { main: "#3B82F6", dark: "#1D4ED8" }, 
  "Natural Language": { main: "#A855F7", dark: "#7E22CE" }, 
  "Programming & Technology": { main: "#6366F1", dark: "#4338CA" }, 
  "Business & Entrepreneurship": { main: "#F97316", dark: "#CA8A04" }, 
  "Personal Development": { main: "#22C55E", dark: "#15803D" }
};

const DEFAULT_COLOR = { main: "#3b82f6", dark: "#2563eb" };


const CAT_DESCRIPTIONS = {
  "Social Science": "This curriculum path is designed to enable learners to travel inside human society, increasing awareness to grow understanding of history, behavior, and structural consciousness.",
  "Mathematics & Natural Science": "This training curriculum allows people to develop a step-by-step rigorous analytical system to build the required logic for the purpose, dreams, and advanced scientific goals they designed.",
  "Natural Language": "This language path is engineered to empower seamless global communication. The training lets learners balance their social, professional, and cultural interactions elegantly.",
  "Programming & Technology": "This curriculum is the track to tech mastery. It's designed to create 'Aha' moments and increase awareness to grow into highly sought-after software architectures and development mindsets.",
  "Business & Entrepreneurship": "This premium curriculum enables future leaders to navigate markets independently. It helps construct financial stability, leadership, and powerful entrepreneurial ecosystems.",
  "Personal Development": "This training empowers individuals to unlock self-mastery. Develop habits and physical, mental, and social goals that directly translate to long-term prosperity."
};

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const isDarkMode = useThemeMode();
  const [growthNote, setGrowthNote] = useState('');
  const [privateLogs, setPrivateLogs] = useState([]);
  const [achievements, setAchievements] = useState(null);
  const [pendingSponsorships, setPendingSponsorships] = useState([]);
  const [pendingConnections, setPendingConnections] = useState([]);
  const [dbCourses, setDbCourses] = useState([]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const { data } = await api.get('/student/enrollments');
        setEnrolledCourses(data.data || []);
      } catch (err) {
        console.error('Failed to fetch enrollments', err);
      } finally {
        setLoading(false);
      }
    };
    const fetchPendingSponsorships = async () => {
      try {
        const { data } = await api.get('/support/pending');
        setPendingSponsorships(data.data || []);
      } catch (err) {
        console.error('Failed to fetch pending sponsorships', err);
      }
    };
    
    const fetchPendingConnections = async () => {
      try {
        const { data } = await api.get('/connections/pending');
        setPendingConnections(data.data || []);
      } catch (err) {
        console.error('Failed to fetch pending connections', err);
      }
    };

    const fetchAllCourses = async () => {
      try {
        const { data } = await api.get('/courses', { params: { limit: 100 } });
        setDbCourses(data.courses || []);
      } catch (err) {
        console.error('Failed to fetch courses', err);
      }
    };
    
    fetchEnrollments();
    fetchPendingSponsorships();
    fetchPendingConnections();
    fetchAllCourses();
  }, []);

  const handleConnectionRequest = async (id, action) => {
    if (window.confirm(`Are you sure you want to ${action} this explicit connection?`)) {
      try {
        await api.post(`/connections/${id}/${action}`);
        alert(`Connection definitively ${action}ed.`);
        setPendingConnections(pendingConnections.filter(c => c.id !== id));
      } catch (err) {
        alert("Action failed: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleSponsorship = async (id, action) => {
    if (window.confirm(`Are you sure you want to ${action} this proxy connection?`)) {
      try {
        await api.post(`/support/${id}/${action}`);
        alert(`Sponsorship definitively ${action}ed.`);
        setPendingSponsorships(pendingSponsorships.filter(s => s.id !== id));
      } catch (err) {
        alert("Authorization failed: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const fetchPrivateLogs = async () => {
    try {
      const { data } = await api.get('/activity');
      const filtered = data.data.filter(log => log.visibility === 'private');
      setPrivateLogs(filtered);
    } catch(err) { console.error('Failed to fetch private logs', err); }
  };

  const fetchAchievements = async () => {
    try {
      const { data } = await api.get('/achievements/me');
      setAchievements(data.data);
    } catch(err) { console.error('Failed to fetch achievements', err); }
  };

  useEffect(() => {
    if (activeTab === 'growth') {
       fetchPrivateLogs();
       fetchAchievements();
    }
  }, [activeTab]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!growthNote.trim()) return;
    try {
      await api.post('/activity', {
        action: 'Set a new personal micro-goal',
        type: 'learning',
        visibility: 'private',
        metadata: { goal: growthNote }
      });
      setGrowthNote('');
      fetchPrivateLogs();
    } catch(err) { console.error('Failed to log personal goal', err); }
  };

  const { totalEnrolled, totalLessonsCompleted, completedCourses, averageProgress } = React.useMemo(() => {
    const total = enrolledCourses.length;
    const lessonsCompleted = enrolledCourses.reduce((sum, course) => sum + (course.completedLessons?.length || 0), 0);
    const completed = enrolledCourses.filter(c => c.progress === 100);
    const avgProg = total > 0 ? Math.round(enrolledCourses.reduce((sum, course) => sum + (course.progress || 0), 0) / total) : 0;
    
    return {
      totalEnrolled: total,
      totalLessonsCompleted: lessonsCompleted,
      completedCourses: completed,
      averageProgress: avgProg
    };
  }, [enrolledCourses]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
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

  const renderContent = () => {

    switch (activeTab) {
      case 'overview':
      case 'courses': {
        return (
          <div className="animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-7xl mx-auto w-full font-sans">
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 pt-2 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
              <div>
                <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <BookOpen className="w-8 h-8 text-[#00D4FF]" />
                  Course Catalog
                  {loading && <div className={`w-5 h-5 border-2 border-t-[#00D4FF] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'} ml-3`}></div>}
                </h1>
                <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Explore our carefully curated course packages below.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-[1200px]">
              {PACKAGES.map((pkg, idx) => {
                const pkgCategoryName = pkg.title.replace(' Courses', '');
                const matchedCourses = dbCourses.filter(c => c.mainCategory === pkgCategoryName);
                const enrolledInPkg = enrolledCourses.filter(enrollment => 
                  matchedCourses.some(mc => mc.id === enrollment.course?.id) || 
                  pkg.category === enrollment.course?.category ||
                  pkg.title.includes(enrollment.course?.category)
                );
                const isPkgEnrolled = enrolledInPkg.length > 0;
                return <PackageCard key={idx} pkg={{...pkg, courses: matchedCourses}} isEnrolled={isPkgEnrolled} enrolledCoursesData={enrolledInPkg} isDarkMode={isDarkMode} />
              })}
            </div>
          </div>
        );
      }

      case 'certificates':
        return (
          <div className="animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-7xl mx-auto w-full font-sans">
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 pt-2 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
              <div>
                <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Award className="w-8 h-8 text-[#00D4FF]" />
                  My Credentials
                </h1>
                <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>View and export your achieved course certificates.</p>
              </div>
            </div>
            
            {completedCourses.length === 0 ? (
               <div className={`p-12 text-center rounded-2xl border shadow-sm flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#0B1120] border-slate-700' : 'bg-white border-slate-200'}`}>
                 <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
                   <Award className="w-8 h-8" />
                 </div>
                 <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>No credentials yet</h3>
                 <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Complete courses to 100% to earn your official certificates.</p>
                 <button 
                  onClick={() => setActiveTab('courses')}
                  className={`px-6 py-3 bg-blue-500 hover:bg-blue-600 font-bold text-sm rounded-xl shadow-md transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                 >
                   Continue Learning
                 </button>
               </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {completedCourses.map((enrolled) => (
                    <div 
                      key={enrolled.id || enrolled.course?.id} 
                      className={`rounded-2xl border shadow-sm p-6 flex flex-col h-full transition-all relative group ${isDarkMode ? 'bg-[#0B1120] border-slate-700 hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-300'}`}
                    >
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto border ${isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
                        <Award className="w-8 h-8" />
                      </div>
                      <h3 className={`text-lg font-bold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        {enrolled.course?.title || 'Unknown Course'}
                      </h3>
                      <p className={`text-[11px] font-medium text-center mb-8 flex-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                        Completed 100% Core Curriculum
                      </p>
                      
                      <button 
                        onClick={() => handleDownloadCertificate(enrolled)}
                        className={`w-full inline-flex justify-center items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl border transition-colors shadow-sm ${isDarkMode ? 'bg-slate-700/50 hover:bg-blue-600 text-white border-slate-600' : 'bg-slate-50 hover:bg-blue-500 hover:text-white text-slate-700 border-slate-200'}`}
                      >
                        <Download className="w-4 h-4" /> Export PDF
                      </button>
                    </div>
                  ))}
                </div>
            )}
          </div>
        );
      case 'growth':
         return (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
                <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Personal Growth Lab</h2>
                <div className={`p-6 rounded-2xl border mb-6 shadow-sm ${isDarkMode ? 'bg-[#0B1120] border-slate-700' : 'bg-white border-slate-200'}`}>
                    <p className={`mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Set isolated growth objectives away from course structures.</p>
                    <form onSubmit={handleAddGoal} className="flex gap-4">
                        <input 
                            type="text" value={growthNote} onChange={e => setGrowthNote(e.target.value)}
                            placeholder="Set a new objective..."
                            className={`flex-1 !px-5 !py-2 border !rounded-full outline-none focus:ring-2 focus:ring-[#f97316]/50 transition-all ${isDarkMode ? 'bg-[#0B1120] border-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'}`}
                        />
                        <button type="submit" className={`px-6 py-2 !rounded-full text-sm font-semibold bg-[#f97316] hover:bg-[#ea580c] shadow-md ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Add</button>
                    </form>
                </div>
             </div>
         );
      case 'settings':
        return <ProfileView />;
      case 'ecosystem':
        return <EcosystemNexus />;
      default:
        return null;
    }
  };

  const navItemClass = (tabName, isActive) => `
    w-full flex items-center justify-between px-3 py-2.5 transition-all duration-200 font-medium text-[13px] rounded-lg mb-1
    ${isActive 
      ? 'bg-[#f97316] text-white shadow-sm' 
      : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'
    }
  `;

  return (
    <div className={`min-h-screen flex flex-col font-sans h-screen ${isDarkMode ? 'bg-[#0B1120] text-slate-200' : 'bg-[#FAFAFA] text-slate-700'}`}>
      {/* Top Header Bar */}
      <header className={`bg-[#f97316] h-[60px] flex items-center justify-between px-4 shrink-0 z-50 shadow-md ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        <div className="flex items-center gap-4 h-full">
          <div className="flex items-center gap-3 font-black text-lg tracking-tight uppercase">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border-2 border-white/20 overflow-hidden shadow-inner">
               <img src={edotLogo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            BREAKTHROUGH
          </div>
          <div className="flex items-center gap-1 border-l border-white/20 pl-4 ml-2">
            <button className="hover:bg-white/10 p-1.5 rounded transition-colors">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <button className="hover:bg-white/10 p-1.5 rounded transition-colors">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeDropdown />
          <div className={`relative cursor-pointer hover:bg-white/10 p-2 rounded-full transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#f97316]"></span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 py-1 px-2 rounded-lg transition-colors border-l border-white/20 pl-4">
            <div className={`w-8 h-8 rounded-full bg-blue-500 font-bold flex items-center justify-center border border-white/30 overflow-hidden ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <img src={`https://ui-avatars.com/api/?name=${user?.name?.replace(/ /g, '+') || 'User'}&background=3b82f6&color=fff`} alt="User" className="w-full h-full object-cover" />
            </div>
            <span className={`text-sm font-semibold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               {user?.name || 'Kenenisa Beyan'} 
               <svg className="w-3.5 h-3.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`w-[250px] shrink-0 flex flex-col h-full border-r overflow-y-auto ${isDarkMode ? 'bg-[#0B1120] border-slate-800' : 'bg-white border-slate-200'}`}>
          {/* User Profile in Sidebar */}
          <div className={`bg-gradient-to-b from-[#93c5fd] to-[#60a5fa] p-8 flex flex-col items-center justify-center pb-6 shadow-inner ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <div className={`w-16 h-16 rounded-full bg-blue-500 font-bold flex items-center justify-center border-[3px] border-white/50 mb-3 shadow-md overflow-hidden ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <img src={`https://ui-avatars.com/api/?name=${user?.name?.replace(/ /g, '+') || 'User'}&background=3b82f6&color=fff`} alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="text-[13px] font-bold flex items-center gap-1.5 drop-shadow-sm">
               {user?.name || 'Kenenisa Beyan'} <span className="text-[9px] opacity-80">▼</span>
            </div>
            <div className="text-[10px] text-blue-50 mt-0.5 font-bold tracking-widest uppercase drop-shadow-sm">IBO</div>
          </div>
          
          <div className="p-3 border-b border-slate-100">
            <div className="relative w-full">
              <Search className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ml-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              <input type="text" placeholder="Search Downlines" 
                className="w-full !pl-10 !pr-4 !py-2 bg-transparent border !rounded-full text-xs outline-none text-slate-700 placeholder:text-slate-400 transition-all focus:border-[#F97316]/50" />
            </div>
          </div>

          <div className="px-3 py-4">
             <p className="px-2 text-[10px] font-bold text-[#f97316] mb-2">Shortcuts</p>
             <nav className="mb-4">
               <button onClick={() => setActiveTab('overview')} className={navItemClass('overview', activeTab === 'overview')}>
                 <div className="flex items-center gap-3"><LayoutDashboard className="w-[18px] h-[18px] shrink-0 opacity-70" /> Dashboard</div>
               </button>
               <button onClick={() => setActiveTab('ecosystem')} className={navItemClass('ecosystem', activeTab === 'ecosystem')}>
                 <div className="flex items-center gap-3"><ShieldCheck className="w-[18px] h-[18px] shrink-0 opacity-70" /> Ecosystem Nexus</div>
               </button>
             </nav>

             <p className="px-2 text-[10px] font-bold text-[#f97316] mb-2">My Office</p>
             <nav className="space-y-0.5">
               {[
                 { name: 'Members', icon: Users },
                 { name: 'Points', icon: Coins },
                 { name: 'E-Learning', icon: Globe, id: 'courses' },
                 { name: 'Products', icon: Package },
                 { name: 'Earnings', icon: Banknote },
                 { name: 'Wallets', icon: Wallet },
                 { name: 'Reports', icon: FileText }
               ].map(item => (
                 <button key={item.name} onClick={() => item.id && setActiveTab(item.id)} className={navItemClass(item.id || item.name, activeTab === item.id)}>
                   <div className="flex items-center gap-3">
                     <item.icon className="w-[18px] h-[18px] shrink-0 opacity-70" /> {item.name}
                   </div>
                   <span className={`font-light text-lg leading-none ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>+</span>
                 </button>
               ))}
             </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto relative ${isDarkMode ? 'bg-[#0B1120]' : 'bg-[#FAFAFA]'}`}>
          {/* Blue Header area behind courses */}
          {(activeTab === 'courses' || activeTab === 'overview') && (
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-r from-[#93c5fd] to-[#60a5fa] -z-10 overflow-hidden flex items-start border-b border-blue-200">
               <div className="absolute right-0 top-0 w-1/3 h-full opacity-20">
                  <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="10" y1="10" x2="100" y2="80" stroke="#1e3a8a" strokeWidth="1" />
                    <line x1="100" y1="80" x2="200" y2="40" stroke="#1e3a8a" strokeWidth="1" />
                    <line x1="50" y1="50" x2="150" y2="20" stroke="#1e3a8a" strokeWidth="1" />
                    <circle cx="10" cy="10" r="3" fill="#1e3a8a" />
                    <circle cx="100" cy="80" r="4" fill="#1e3a8a" />
                    <circle cx="200" cy="40" r="3" fill="#1e3a8a" />
                    <circle cx="50" cy="50" r="3" fill="#1e3a8a" />
                    <circle cx="150" cy="20" r="3" fill="#1e3a8a" />
                  </svg>
               </div>
            </div>
          )}
          
          <div className="max-w-[1400px] mx-auto p-6 md:p-8 relative z-10">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
