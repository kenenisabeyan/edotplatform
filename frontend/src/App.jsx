import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import useThemeMode from './hooks/useThemeMode';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import InstructorCourseBuilder from './pages/InstructorCourseBuilder';
import StudentDashboard from './pages/StudentDashboard';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Lesson from './pages/Lesson';
import QuizViewer from './pages/QuizViewer';
import About from './pages/About';
import Contact from './pages/Contact';
import Impact from './pages/Impact';
import Sponsorship from './pages/Sponsorship';
import { useAuth } from './context/AuthContext';

import EDOTLayout from './components/EDOTLayout';
import EDOTDashboard from './pages/EDOTDashboard';
import TeachersList from './pages/TeachersList';
import StudentsList from './pages/StudentsList';
import FinanceFees from './pages/FinanceFees';
import FinanceExpenses from './pages/FinanceExpenses';
import CalendarView from './pages/CalendarView';
import MessagesView from './pages/MessagesView';
import StudentCourses from './pages/StudentCourses';
import InstructorClasses from './pages/InstructorClasses';
import InstructorManageCourses from './pages/InstructorManageCourses';
import AdminCourseApprovals from './pages/AdminCourseApprovals';
import CertificatesView from './pages/CertificatesView';
import NoticeView from './pages/NoticeView';
import LibraryView from './pages/LibraryView';
import ProfileView from './pages/ProfileView';
import ParentLearners from './pages/ParentLearners';
import AttendanceManagement from './pages/AttendanceManagement';
import Revenue from './pages/Revenue';
import Performance from './pages/Performance';
import TeachingActivity from './pages/TeachingActivity';
import AnalyticsReport from './pages/AnalyticsReport';
import SettingsView from './pages/SettingsView';
import UsersManagement from './pages/UsersManagement';
import SectionManagement from './pages/SectionManagement';
import SupportDashboard from './pages/SupportDashboard';
import SponsorDashboard from './pages/SponsorDashboard';
import LiveClassesView from './pages/LiveClassesView';
import EcosystemView from './pages/EcosystemView';
import StudyGoalView from './pages/StudyGoalView';
import AchievementsView from './pages/AchievementsView';
import { Outlet } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';
import ChatbotWidget from './components/ChatbotWidget';

function MainLayout() {
  const isDarkMode = useThemeMode();
  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white'}`}>
      <Navbar />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

import CommandK from './components/CommandK';

function NotFound() {
  const isDarkMode = useThemeMode();
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-6 text-center ${isDarkMode ? 'bg-[#0B1120] text-white' : 'bg-white text-slate-900'}`}>
      <h1 className="text-6xl font-black mb-4 text-sky-500">404</h1>
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <p className={`mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>The page you are looking for doesn't exist or has been moved.</p>
      <button 
        onClick={() => window.history.back()}
        className="rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
      >
        Go Back
      </button>
    </div>
  );
}

export default function App() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const getSocketUrl = () => {
      const apiEnv = import.meta.env.VITE_API_URL;
      if (apiEnv) {
        return apiEnv.replace(/\/api$/, '').replace(/\/$/, '');
      }
      return import.meta.env.PROD ? 'https://edotplatform-2.onrender.com' : 'http://localhost:5005';
    };
    const SOCKET_BASE_URL = getSocketUrl();

    const socket = io(SOCKET_BASE_URL, {
      withCredentials: true
    });

    // Join room for direct direct alert push
    socket.emit('join_room', `user_${user.id}`);

    // Listen for direct direct alert events
    socket.on('notification', (data) => {
      toast.custom((t) => (
        <div className={`p-4 max-w-sm w-full shadow-2xl rounded-2xl flex flex-col gap-2 border pointer-events-auto backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] ${
          t.visible ? 'animate-enter' : 'animate-leave'
        } ${isDarkMode ? 'bg-[#0B1120]/95 border-white/10 text-white' : 'bg-white/95 border-slate-200 text-slate-900'}`}>
          <div className="flex items-start gap-3">
            <span className="text-xl">🔔</span>
            <div className="flex-1 text-left min-w-0">
              <span className="text-sm font-black block truncate leading-snug">{data.title}</span>
              <span className={`text-[11.5px] font-medium leading-relaxed block mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{data.message}</span>
            </div>
          </div>
        </div>
      ), {
        duration: 8000,
        position: 'top-right'
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user, isDarkMode]);

  return (
    <>
      <ScrollToTop />
      <CommandK />
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
             background: isDarkMode ? 'rgba(11, 17, 32, 0.85)' : 'rgba(255, 255, 255, 0.85)',
             backdropFilter: 'blur(16px)',
             WebkitBackdropFilter: 'blur(16px)',
             color: isDarkMode ? '#fff' : '#0f172a',
             border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
             boxShadow: isDarkMode ? '0 25px 50px -12px rgba(0,0,0,0.7), 0 0 20px rgba(0, 212, 255, 0.15)' : '0 25px 50px -12px rgba(0,0,0,0.15), 0 0 20px rgba(0,0,0,0.05)',
             padding: '16px 20px',
             borderRadius: '20px',
             fontSize: '14px',
             fontWeight: '600',
             maxWidth: '450px',
             lineHeight: '1.6',
          },
          success: {
             iconTheme: { primary: '#10B981', secondary: isDarkMode ? '#0B1120' : '#fff' },
             style: { borderLeft: '4px solid #10B981' }
          },
          error: {
             iconTheme: { primary: '#EF4444', secondary: isDarkMode ? '#0B1120' : '#fff' },
             style: { borderLeft: '4px solid #EF4444' }
          }
        }} 
      />
      <Routes>
      {/* Immersive Pages (No Nav/Footer) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/lesson/:id" element={
          <ErrorBoundary>
            <Lesson />
          </ErrorBoundary>
        } />
        <Route path="/quiz/:id" element={
          <ErrorBoundary>
            <QuizViewer />
          </ErrorBoundary>
        } />
      </Route>

      {/* Public / Landing Pages with Navbar & Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/sponsorship" element={<Sponsorship />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Old Standalone routes mapping to null or removed to force dashboard usage */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
          <Route path="/instructor/*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student/*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* New EDOT Dashboard Layout (Full UI, no main Navbar/Footer) */}
      <Route path="/dashboard" element={
        <ErrorBoundary>
          <ProtectedRoute />
        </ErrorBoundary>
      }>
        <Route element={<EDOTLayout />}>
          <Route index element={<EDOTDashboard />} />
          
          {/* Admin Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="users" element={<UsersManagement />} />
            <Route path="teachers" element={<TeachersList />} />
            <Route path="approvals" element={<AdminCourseApprovals />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="analytics" element={<AnalyticsReport />} />
            <Route path="finance/fees" element={<FinanceFees />} />
            <Route path="finance/expenses" element={<FinanceExpenses />} />
          </Route>

          {/* Admin & Instructor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'instructor']} />}>
            <Route path="classes" element={<InstructorClasses />} />
            <Route path="my-courses" element={<InstructorManageCourses />} />
            <Route path="builder" element={<InstructorCourseBuilder />} />
            <Route path="builder/:id" element={<InstructorCourseBuilder />} />
            <Route path="teaching" element={<TeachingActivity />} />
          </Route>

          {/* Admin, Instructor, Student (Shared with internal logic vs strict role blocks) */}
          <Route path="students" element={<StudentsList />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="performance" element={<Performance />} />
          <Route path="sections" element={<SectionManagement />} />
          
          {/* Parent Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['parent']} />}>
            <Route path="child" element={<ParentLearners />} />
            <Route path="progress" element={<ParentLearners />} />
          </Route>

          {/* Student Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="courses" element={<StudentCourses />} />
          </Route>

          {/* General Dashboard Routes available to anyone logged in */}
          <Route path="support" element={<SupportDashboard />} />
          <Route path="notice" element={<NoticeView />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="schedule" element={<CalendarView />} />
          <Route path="library" element={<LibraryView />} />
          <Route path="messages" element={<MessagesView />} />
          <Route path="certificates" element={<CertificatesView />} />
          <Route path="study-goal" element={<StudyGoalView />} />
          <Route path="achievements" element={<AchievementsView />} />
          <Route path="profile" element={<ProfileView />} />
          <Route path="live-classes" element={<LiveClassesView />} />
          {/* Sponsor Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['sponsor']} />}>
            <Route path="sponsor" element={<SponsorDashboard />} />
          </Route>

          <Route path="settings" element={<SettingsView />} />
          <Route path="ecosystem" element={<EcosystemView />} />
        </Route>
      </Route>

      {/* Global 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    <ChatbotWidget />
    </>
  );
}

function DashboardRouter() {
  const { user } = useAuth();
  
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'instructor') return <Navigate to="/instructor" replace />;
  return <Navigate to="/student" replace />; // Default to student
}
