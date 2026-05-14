import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Clock, 
  MapPin, 
  Euro, 
  Users, 
  PlayCircle,
  FileText,
  BadgeAlert,
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  ChevronRight,
  MonitorPlay,
  Lock,
  Unlock,
  BookOpen,
  ArrowRight,
  Video
} from 'lucide-react';
import useThemeMode from '../hooks/useThemeMode';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const isDarkMode = useThemeMode();

  const { data: course, isLoading: loadingCourse, error: courseError } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const { data } = await api.get(`/courses/${id}`);
      return data.course;
    }
  });

  const { data: enrollmentStatusData, isLoading: loadingStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['courseStatus', id],
    queryFn: async () => {
      if (!user) return { status: 'none' };
      try {
        const { data } = await api.get(`/student/courses/${id}/status`);
        return data;
      } catch (err) {
        return { status: 'none' };
      }
    },
    enabled: !!user
  });

  const loading = loadingCourse;
  const error = courseError ? (courseError.response?.data?.message || courseError.message || 'Unknown error') : '';
  const enrollmentStatus = enrollmentStatusData?.status || 'none';

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    if (user.status === 'blocked') return alert('Your account is blocked.');
    setEnrolling(true);
    try {
      await api.post(`/student/courses/${id}/enroll`);
      refetchStatus();
      alert('Enrollment successful. You can now access the course materials.');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex justify-center items-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#FFC107] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex justify-center items-center p-4 bg-transparent text-center">
        <div className={`p-10 border rounded-2xl shadow-xl backdrop-blur-xl ${isDarkMode ? 'bg-[#0B1120]/60 border-white/10' : 'bg-white border-slate-200'}`}>
           <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-[#FFC107]" />
           <p className={`font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{error || 'Data Not Found'}</p>
        </div>
      </div>
    );
  }

  const isEnrolled = enrollmentStatus === 'active';
  const totalDuration = course.lessons?.length ? course.lessons.length * 15 : 0;

  return (
    <div className={`min-h-[calc(100vh-80px)] w-full font-sans pb-20 relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#0B1120] text-slate-100' : 'bg-[#FAFAFA] text-slate-800'}`}>
      
      {/* Hero Section */}
      <div className="relative z-10 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Link to="/courses" className="inline-flex items-center gap-2 text-xs font-black text-[#F97316] hover:text-white transition-colors mb-10   bg-[#F97316]/10 px-4 py-2 rounded-full-full border border-[#F97316]/20 hover:shadow-[0_0_15px_rgba(249,115,22,0.3)]">
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </Link>

          <div className="flex flex-col lg:flex-row gap-16 lg:items-center">
              {/* Left Hero */}
             <div className="lg:w-7/12">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-[#F97316] font-black text-[10px] sm:text-xs drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                   <span>{course.mainCategory || 'SaaS Application'}</span>
                   {course.subCategory && (
                     <>
                        <ChevronRight className="w-4 h-4 text-[#F97316]/40" />
                        <span>{course.subCategory}</span>
                     </>
                   )}
                </div>
                <h1 className={`text-5xl md:text-7xl font-black mb-6 leading-tight text-transparent bg-clip-text drop-shadow-[0_0_25px_rgba(249,115,22,0.3)] ${isDarkMode ? 'bg-gradient-to-r from-white via-amber-100 to-[#F97316]' : 'bg-gradient-to-r from-slate-900 via-amber-600 to-[#00D4FF]'}`}>
                  {course.title}
                </h1>
                <p className={`text-lg md:text-xl font-medium leading-relaxed max-w-2xl mb-10 border-l-2 border-[#00D4FF]/50 pl-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                   {course.description}
                </p>
                <div className={`flex flex-wrap items-center gap-8 text-xs font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                   <div className="flex items-center gap-3">
                     <Users className="w-5 h-5 text-[#00D4FF] drop-shadow-[0_0_10px_rgba(230,126,34,0.4)]" />
                     Instructor: <span className={`ml-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{course.instructor?.name || 'Kenenisa'}</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <MonitorPlay className="w-5 h-5 text-[#F97316] drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]" />
                     Delivery: <span className={`ml-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Hybrid / Online</span>
                   </div>
                </div>
             </div>

             {/* Right Hero (Floating Mockup Container) */}
             <div className="hidden lg:block lg:w-5/12">
                 <div className="relative group w-full transition-transform duration-500 hover:-translate-y-2">
                    <div className={`relative border rounded-2xl p-4 shadow-2xl ${isDarkMode ? 'border-white/10 bg-[#151a26]/80 backdrop-blur-md' : 'border-slate-200 bg-white/80 backdrop-blur-md'}`}>
                       <div className="w-full aspect-[4/3] relative overflow-hidden rounded-xl bg-[#030303]">
                         <img 
                           src={(course.thumbnail && course.thumbnail !== 'default-course.jpg') ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail.startsWith('/') ? '' : '/'}${course.thumbnail}`) : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'} 
                           alt="Course Preview" 
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                           onError={(e) => { 
                               e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
                           }}
                         />
                       </div>
                    </div>
                 </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-12">
           
           {/* Primary Content Column */}
           <div className="w-full lg:w-7/12">
              
              {/* Tab Navigation Navigation */}
              <div className="flex overflow-x-auto scrollbar-hide mb-12 gap-4">
                 {['Overview', 'Curriculum', 'Instructor'].map(tabLabel => {
                    const tab = tabLabel.toLowerCase();
                    return (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 min-w-fit py-4 px-8 font-black text-sm transition-all duration-300 rounded-2xl whitespace-nowrap border tracking-wide uppercase ${
                        activeTab === tab 
                        ? 'border-[#F97316]/50 bg-gradient-to-r from-[#F97316]/10 to-[#00D4FF]/10 text-[#F97316] shadow-[0_0_25px_rgba(249,115,22,0.15)] scale-[1.02]' 
                        : (isDarkMode ? 'border-white/5 bg-[#0B1120]/60 text-slate-400 hover:border-white/20 hover:text-white hover:bg-[#0B1120]/80' : 'border-slate-200 bg-white/80 text-slate-500 hover:border-[#F97316]/30 hover:text-slate-800 hover:bg-white')
                      }`}
                    >
                      {tabLabel}
                    </button>
                    );
                 })}
              </div>

              {/* Tab: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-12 animate-in fade-in duration-500 slide-in-from-bottom-4">
                  <div className={`relative p-[1px] rounded-3xl bg-gradient-to-b ${isDarkMode ? 'from-[#00D4FF]/20' : 'from-slate-200'} to-transparent shadow-[0_0_40px_rgba(0,212,255,0.05)]`}>
                     <div className={`backdrop-blur-2xl p-10 md:p-14 rounded-3xl h-full border ${isDarkMode ? 'bg-[#0B1120]/90 border-white/5' : 'bg-white/95 border-slate-100'}`}>
                        <h2 className={`text-3xl font-black mb-8 flex items-center gap-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                           <FileText className="w-8 h-8 text-[#00D4FF] drop-shadow-[0_0_15px_rgba(0,212,255,0.4)]"/> 
                           Program Details
                        </h2>
                        <div className={`prose max-w-none text-base md:text-lg leading-loose whitespace-pre-wrap font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {course.description}
                        </div>
                     </div>
                  </div>

                  <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-[#F97316]/40 to-transparent shadow-[0_0_50px_rgba(249,115,22,0.1)]">
                     <div className={`backdrop-blur-2xl p-10 md:p-14 rounded-3xl h-full border relative overflow-hidden ${isDarkMode ? 'bg-[#0B1120]/90 text-white border-white/5' : 'bg-white/95 text-slate-900 border-slate-100'}`}>
                        <h3 className="text-3xl font-black flex items-center gap-4 mb-10 relative z-10">
                          <CheckCircle className="w-8 h-8 text-[#F97316] drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]" /> 
                          What You'll Learn
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                           {[
                             'Understand core industry-standard methodologies.',
                             'Build and deploy production-ready projects.',
                             'Analyze performance metrics with modern tooling.',
                             'Receive a formalized digital certification upon passing.',
                           ].map((point, i) => (
                              <div key={i} className={`flex gap-4 group ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                 <ChevronRight className="w-5 h-5 text-[#F97316] shrink-0 group-hover:translate-x-1 transition-transform" />
                                 <span className="font-bold text-sm leading-relaxed">{point}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {/* Tab: Curriculum */}
              {activeTab === 'curriculum' && (
                <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-[#00D4FF]/40 to-transparent animate-in fade-in duration-500 slide-in-from-bottom-4 shadow-[0_0_50px_rgba(0,212,255,0.05)]">
                  <div className={`backdrop-blur-2xl p-10 md:p-14 rounded-3xl shadow-xl border ${isDarkMode ? 'bg-[#0B1120]/90 border-white/5' : 'bg-white/95 border-slate-200'}`}>
                     <div className="flex items-center justify-between mb-12">
                        <h2 className={`text-3xl font-black flex items-center gap-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                           <BookOpen className="w-8 h-8 text-[#00D4FF] drop-shadow-[0_0_15px_rgba(0,212,255,0.4)]"/> 
                           Syllabus
                        </h2>
                        <div className="text-[10px] font-black bg-indigo-500/10 px-4 py-2 rounded-full text-indigo-500 dark:text-indigo-300 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                          {course.lessons?.length || 0} Modules
                        </div>
                     </div>

                     <div className="space-y-8">
                       {course.lessons && course.lessons.length > 0 ? (
                         (() => {
                           const phases = [...new Set(course.lessons.map(l => l.phase || 'General Content'))];
                           return phases.map((phase, pIdx) => {
                             const phaseLessons = course.lessons.filter(l => (l.phase || 'General Content') === phase);
                             return (
                                <div key={pIdx} className="space-y-6">
                                 <h3 className={`text-2xl font-black text-[#00D4FF] border-b pb-4 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>{phase}</h3>
                                 {phaseLessons.map((lesson) => (
                                   <div key={lesson.id} className={`w-full border rounded-3xl p-6 transition-all flex flex-col md:flex-row gap-8 items-start md:items-center group ${isDarkMode ? 'bg-[#0B1120]/60 border-white/5 hover:border-[#00D4FF]/30 hover:bg-[#0B1120] hover:shadow-[0_0_20px_rgba(0,212,255,0.1)]' : 'bg-slate-50 border-slate-200 hover:border-[#00D4FF]/30 hover:bg-white shadow-sm hover:shadow-[0_0_20px_rgba(0,212,255,0.1)]'}`}>
                                      <div className={`shrink-0 w-24 h-24 rounded-2xl border flex flex-col items-center justify-center p-2 shadow-inner transition-colors group-hover:border-[#00D4FF]/50 ${isDarkMode ? 'bg-[#05070A] border-white/10' : 'bg-white border-slate-200'}`}>
                                         <span className="text-xs font-black text-slate-500 mb-1 uppercase tracking-wider">Module</span>
                                         <span className="text-3xl font-black text-[#00D4FF] leading-none">{course.lessons.findIndex(l => l.id === lesson.id) + 1}</span>
                                      </div>
                                      
                                      <div className="flex-1 min-w-0">
                                         <h4 className={`font-bold text-xl leading-tight mb-3 transition-colors tracking-tight ${isDarkMode ? 'text-white group-hover:text-indigo-300' : 'text-slate-800 group-hover:text-indigo-600'}`}>{lesson.title}</h4>
                                         <div className={`flex flex-wrap items-center gap-3 text-xs font-black ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                           <span className="flex items-center gap-1.5"><PlayCircle className="w-3 h-3 text-[#00D4FF]" /> {lesson.duration}m Video</span>
                                           {lesson.readingMaterials && <span className="flex items-center gap-1.5"><FileText className="w-3 h-3 text-[#F97316]" /> Docs</span>}
                                           {lesson.quiz?.length > 0 && <span className="flex items-center gap-1.5"><BadgeAlert className="w-3 h-3 text-rose-500" /> Audit</span>}
                                         </div>
                                      </div>

                                      <div className={`shrink-0 hidden md:flex items-center justify-center p-3 rounded-full border ${isDarkMode ? 'border-white/5 bg-[#0B1221] text-slate-400' : 'border-slate-200 bg-white text-slate-400'}`}>
                                         {isEnrolled ? <Unlock className="w-5 h-5 text-emerald-500" /> : <Lock className="w-5 h-5" />}
                                      </div>
                                   </div>
                                 ))}
                               </div>
                             );
                           });
                         })()
                       ) : (
                         <p className={`text-center py-12 font-black border border-dashed rounded-2xl bg-[#0B1120]/30 ${isDarkMode ? 'text-slate-400 border-white/10' : 'text-slate-500 border-slate-200'}`}>System modules currently under construction.</p>
                       )}
                     </div>
                  </div>
                </div>
              )}

              {/* Tab: Instructor */}
              {activeTab === 'instructor' && (
                <div className="relative p-[1px] rounded-3xl bg-gradient-to-b from-[#F97316]/40 to-transparent animate-in fade-in duration-500 slide-in-from-bottom-4 shadow-[0_0_50px_rgba(249,115,22,0.05)]">
                  <div className={`backdrop-blur-2xl p-10 md:p-14 rounded-3xl flex flex-col md:flex-row items-center gap-12 text-center md:text-left border shadow-xl ${isDarkMode ? 'bg-[#0B1120]/90 border-white/5' : 'bg-white/95 border-slate-200'}`}>
                     <div className={`w-40 h-40 rounded-full overflow-hidden shrink-0 border-4 border-[#00D4FF] shadow-[0_0_30px_rgba(0,212,255,0.4)] ${isDarkMode ? 'bg-[#05070A]' : 'bg-slate-100'}`}>
                       <img src="https://ui-avatars.com/api/?name=Instructor&background=0B1120&color=FFFFFF" alt="Instructor" className="w-full h-full object-cover" />
                     </div>
                     <div>
                       <h2 className={`text-4xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{course.instructor?.name || 'Kenenisa'}</h2>
                       <p className="text-[#00D4FF] font-black text-xs mb-6 bg-[#00D4FF]/10 inline-block px-4 py-1.5 rounded-full border border-[#00D4FF]/30 shadow-[0_0_10px_rgba(230,126,34,0.1)]">Lead Authority</p>
                       <p className={`font-medium leading-loose max-w-lg mx-auto md:mx-0 text-sm md:text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          Instructor is a certified professional with extensive verifiable experience in building out large-scale technical systems and leading dynamic teams across the globe.
                       </p>
                     </div>
                  </div>
                </div>
              )}
           </div>

           {/* Sticky Interaction Sidebar (Order Box) */}
           <div className="w-full lg:w-5/12 lg:-mt-24 z-20">
               <div className="relative p-[1px] rounded-[32px] shadow-lg sticky top-32 border border-slate-200/50">
                  <div className={`p-8 lg:p-12 relative overflow-hidden rounded-[32px] border ${isDarkMode ? 'bg-[#0B1221]/95 border-white/10' : 'bg-white/95 border-slate-200 shadow-xl'}`}>
                     <div className={`text-center mb-8 border-b pb-8 relative z-10 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                       <h3 className={`font-black text-[11px] mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Program Value</h3>
                       <div className="text-5xl font-black text-[#F97316] drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                         ETB {course.price || '4.94'}
                       </div>
                    </div>

                    <div className="space-y-6 mb-10 relative z-10">
                       <div className={`flex justify-between items-center text-xs font-black border-b pb-4 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                          <span className={`flex items-center gap-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><Clock className="w-4 h-4 text-[#00D4FF]"/> Duration</span>
                          <span className={isDarkMode ? 'text-white' : 'text-slate-800'}>{totalDuration} Mins Runtime</span>
                       </div>
                       <div className={`flex justify-between items-center text-xs font-black border-b pb-4 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                          <span className={`flex items-center gap-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><BookOpen className="w-4 h-4 text-[#00D4FF]"/> Syllabus Length</span>
                          <span className={isDarkMode ? 'text-white' : 'text-slate-800'}>{course.lessons?.length || 0} Modules</span>
                       </div>
                       <div className={`flex justify-between items-center text-xs font-black border-b pb-4 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                          <span className={`flex items-center gap-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><MapPin className="w-4 h-4 text-[#00D4FF]"/> Location</span>
                          <span className={isDarkMode ? 'text-white' : 'text-slate-800'}>Global Digital</span>
                       </div>
                    </div>

                    {/* Action Button Logic */}
                    <div className="relative z-10 block">
                        {enrollmentStatus === 'active' ? (
                          <div className="space-y-4">
                            <Link 
                              to={`/lesson/${course.lessons[0]?.id}?courseId=${course.id}`}
                              className="w-full relative z-10 flex border-[1px] border-orange-300 items-center justify-center bg-gradient-to-r from-orange-500/10 to-[#F97316] text-[#05070A] font-black   py-5 rounded-full hover:scale-[1.03] transition-all shadow-[0_0_30px_rgba(249,115,22,0.4)] text-sm"
                            >
                              Start Learning
                            </Link>
                            <Link 
                              to={`/dashboard/live-classes`}
                              className="w-full relative z-10 flex border-[1px] border-[#00D4FF]/50 items-center justify-center bg-gradient-to-r from-[#00D4FF]/10 to-[#00D4FF]/20 text-[#00D4FF] font-black   py-5 rounded-full hover:scale-[1.03] transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)] text-sm"
                            >
                              <Video className="w-4 h-4 mr-2" /> Live Sessions
                            </Link>
                          </div>
                        ) : enrollmentStatus === 'pending' ? (
                          <div className="w-full relative z-10 flex items-center justify-center gap-3 bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30 font-black   py-5 rounded-2xl opacity-90 cursor-wait shadow-[inset_0_0_20px_rgba(249,115,22,0.2)] text-sm">
                            <Clock className="w-5 h-5" /> Pending Approval
                          </div>
                        ) : enrollmentStatus === 'rejected' ? (
                          <div className="w-full relative z-10 flex items-center justify-center gap-3 bg-rose-500/100/10 text-rose-500 border border-rose-500/30 font-black   py-5 rounded-2xl cursor-not-allowed shadow-[inset_0_0_20px_rgba(244,63,94,0.2)] text-sm">
                            Access Denied
                          </div>
                        ) : (
                          <button 
                            onClick={handleEnroll}
                            disabled={enrolling}
                            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-transparent to-[#00D4FF]/20 border border-[#F97316] text-[#F97316] font-semibold py-5 rounded-full hover:bg-[#F97316] hover:text-[#0B1120] transition-all shadow-[0_0_30px_rgba(0,212,255,0.3)] disabled:opacity-50 hover:scale-[1.03] text-sm"
                          >
                            {enrolling ? 'Processing...' : 'Enroll Now'} <ArrowRight className="w-5 h-5"/>
                          </button>
                        )}
                    </div>

                    <div className="mt-8 text-center relative z-10">
                      <p className="text-[10px]  font-black text-slate-500 tracking-[0.2em] relative before:absolute before:left-0 before:top-1/2 before:w-10 before:h-[1px] before:bg-slate-600 after:absolute after:right-0 after:top-1/2 after:w-10 after:h-[1px] after:bg-slate-600 px-12">
                         Guaranteed Encrypted Processing
                      </p>
                    </div>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
