import React, { useEffect, useState, useCallback } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Users, Layers, Radio, PlusCircle, Edit3, Settings, LogOut, 
  FolderOpen, LayoutDashboard, Clock, CheckCircle2, 
  AlertCircle, XSquare, PlayCircle, Send, Search, Bell
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
const edotLogo = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/e69zbyhv3obsuf4uknyy';
import ActivityFeed from '../components/ActivityFeed';
import CustomDropdown from '../components/CustomDropdown';
import { courseDropdownOptions } from '../constants/courseCategories';
import ProfileView from './ProfileView';

export default function InstructorDashboard() {
  const isDarkMode = useThemeMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Social Science', duration: 1, thumbnail: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [lessonData, setLessonData] = useState({ title: '', description: '', videoUrl: '', duration: 10 });

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/instructor/dashboard');
      setStats(data.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const { data } = await api.get('/instructor/analytics/detailed');
      setAnalytics(data.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const { data } = await api.get('/instructor/courses');
      setCourses(data.data);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        await Promise.all([fetchCourses(), fetchStats(), fetchAnalytics()]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [fetchCourses, fetchStats, fetchAnalytics]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const submissionData = { ...formData };
      if (!submissionData.thumbnail) {
        submissionData.thumbnail = 'default-course.jpg';
      }
      
      await api.post('/instructor/courses', submissionData);
      setFormData({ title: '', description: '', category: 'Programming', duration: 1, thumbnail: '' });
      fetchCourses();
      setActiveTab('courses'); // Redirect to courses list after creation
    } catch (err) {
      console.error('Failed to create course', err);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!activeCourseId) return;
    
    try {
      await api.post(`/instructor/courses/${activeCourseId}/lessons`, lessonData);
      setLessonData({ title: '', description: '', videoUrl: '', duration: 10 });
      setActiveCourseId(null);
      fetchCourses();
    } catch (err) {
      console.error('Failed to add lesson', err);
    }
  };

  const handleSubmitReview = async (courseId) => {
    try {
      await api.put(`/instructor/courses/${courseId}/submit`);
      fetchCourses();
    } catch (err) {
      console.error('Failed to submit for review', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  void stats;
  const totalStudents = courses.reduce((acc, course) => acc + (course.totalStudents || 0), 0);
  const activeCourses = courses.filter(c => c.status === 'approved').length;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className={`w-12 h-12 border-4 border-t-[#F97316] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview': {
        const revenueData = analytics?.revenueData || [];
        const engagementData = analytics?.engagementData || [];

        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Instructor Overview</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className={`border rounded-2xl p-6 shadow-sm hover:border-white/10 transition-colors ${isDarkMode ? 'bg-[#1E293B] border-white/5' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded shrink-0 border flex items-center justify-center bg-transparent ${isDarkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Total Students</span>
                </div>
                <h3 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{totalStudents}</h3>
              </div>

              <div className={`border rounded-2xl p-6 shadow-sm hover:border-white/10 transition-colors ${isDarkMode ? 'bg-[#1E293B] border-white/5' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded shrink-0 border flex items-center justify-center bg-transparent ${isDarkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <Radio className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Active Courses</span>
                </div>
                <h3 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{activeCourses}</h3>
              </div>

              <div className={`border rounded-2xl p-6 shadow-sm hover:border-white/10 transition-colors ${isDarkMode ? 'bg-[#1E293B] border-white/5' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded shrink-0 border flex items-center justify-center bg-transparent ${isDarkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Total Creations</span>
                </div>
                <h3 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{courses.length}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              <div className={`border rounded-2xl p-6 shadow-sm flex flex-col ${isDarkMode ? 'bg-[#1E293B] border-white/5' : 'bg-white border-slate-100'}`}>
                <h3 className={`font-medium text-[13px] mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Earnings (Last 6 Months)</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData} margin={{ top: 5, right: 0, bottom: 0, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} tickFormatter={(value) => `$${value}`} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#13161B', color: '#fff', fontWeight: 'bold' }}
                        formatter={(value) => [`$${value}`, 'Earnings']}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#38bdf8" strokeWidth={2} dot={false} activeDot={{r: 4, fill: '#38bdf8'}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`border rounded-2xl p-6 shadow-sm flex flex-col ${isDarkMode ? 'bg-[#1E293B] border-white/5' : 'bg-white border-slate-100'}`}>
                <h3 className={`font-medium text-[13px] mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Student Engagement</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engagementData} margin={{ top: 5, right: 0, bottom: 0, left: -25 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#13161B', color: '#fff', fontWeight: 'bold' }}
                        cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
                      />
                      <Bar dataKey="students" fill="#FFD700" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className={`mt-8 backdrop-blur-xl p-8 rounded-2xl border shadow-2xl ${isDarkMode ? 'bg-[#1E293B]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
               <h3 className={`text-xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Recent Activity</h3>
               <ActivityFeed isAdmin={false} limit={5} />
            </div>
          </div>
        );
      }
      case 'courses':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className={`text-2xl font-display font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>My Courses</h2>
              <button 
                onClick={() => navigate('/instructor/builder')} 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD700] to-yellow-600 text-[#0B0E14] font-black   text-[11px] rounded-xl hover:-translate-y-0.5 transition-transform shadow-[0_0_20px_rgba(255,215,0,0.3)]"
              >
                <PlusCircle className="w-4 h-4" /> Create Course
              </button>
            </div>
            
            {courses.length === 0 ? (
               <div className={`bg-[#1E293B]/50 backdrop-blur-xl p-12 text-center rounded-2xl border-2 border-dashed shadow-sm flex flex-col items-center justify-center ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                 <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-[#1E293B]/5 text-slate-300' : 'bg-slate-50 text-slate-500'}`}>
                   <FolderOpen className="w-10 h-10" />
                 </div>
                 <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No courses created</h3>
                 <p className={`max-w-sm mb-6 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Share your knowledge with the world by creating your first complete course.</p>
                 <button 
                  onClick={() => navigate('/instructor/builder')} 
                  className="px-8 py-3.5 bg-gradient-to-r from-[#FFD700] to-yellow-600 text-[#0B0E14] font-black   text-xs rounded-xl hover:-translate-y-0.5 transition-transform shadow-[0_0_20px_rgba(255,215,0,0.3)]"
                 >
                   Start Creating
                 </button>
               </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                  {courses.map(c => (
                    <div key={c.id} className={`backdrop-blur-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col md:flex-row group transition-all hover:border-[#FFD700]/30 relative ${isDarkMode ? 'bg-[#1E293B]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700] rounded-bl-full opacity-5 pointer-events-none group-hover:scale-110 transition-transform"></div>
                      <div className="w-full md:w-64 h-48 md:h-auto shrink-0 relative bg-[#1E293B]">
                         <img 
                          src={c.thumbnail === 'default-course.jpg' ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80' : c.thumbnail} 
                          alt={c.title} 
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                        />
                         <div className={`absolute top-3 left-3 backdrop-blur-sm px-3 py-1.5 rounded-md text-[9px] font-black text-[#FFD700] border ${isDarkMode ? 'bg-[#1E293B]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
                           {c.category}
                         </div>
                      </div>
                      
                      <div className="flex flex-col flex-1 relative z-10">
                        <div className="p-6 md:p-8 flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-2">
                            <h3 className={`text-xl font-bold leading-snug ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{c.title}</h3>
                            <span className={`shrink-0 inline-flex items-center px-3 py-1 rounded-sm text-[9px] font-black   border ${
                              c.status === 'approved' ? 'bg-[#E67E22]/20 text-[#E67E22] border-[#E67E22]/30' : 
                              (c.status === 'pending' ? 'bg-amber-500/100/20 text-amber-500 border-amber-500/30' : 
                              (c.status === 'rejected' ? 'bg-red-500/20 text-red-500 border-red-500/30' : 
                              'bg-[#1E293B]/5 text-slate-200 border-white/10'))
                            }`}>
                              {c.status}
                            </span>
                          </div>
                          
                          <p className={`text-xs font-black mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#FFD700]" /> {c.duration} hours</span>
                            <span className="flex items-center gap-1.5"><PlayCircle className="w-3.5 h-3.5 text-[#E67E22]" /> {c.lessons?.length || 0} lessons</span>
                            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-amber-500" /> {c.totalStudents || 0} students</span>
                          </p>
                          
                          <p className={`text-sm line-clamp-2 md:line-clamp-3 mb-0 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{c.description}</p>
                        </div>
                        
                        <div className={`p-4 md:px-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 ${isDarkMode ? 'border-white/10 bg-[#1E293B]/50' : 'border-slate-200 bg-slate-100'}`}>
                           <span className={`text-[10px] font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                             Updated: {new Date(c.updatedAt).toLocaleDateString()}
                           </span>
                           
                           <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                             {(c.status === 'draft' || c.status === 'rejected') && (
                               <>
                                 <button 
                                  onClick={() => navigate('/instructor/builder/' + c.id)} 
                                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 font-bold text-[10px] rounded-lg border hover:bg-[#FFD700] hover:text-[#0B0E14] hover:border-[#FFD700] transition-colors ${isDarkMode ? 'bg-[#1E293B]/5 text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'}`}
                                 >
                                   <PlusCircle className="w-4 h-4" /> Add Lesson
                                 </button>
                                 <button 
                                  onClick={() => handleSubmitReview(c.id)} 
                                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#FFD700] to-yellow-600 text-[#0B0E14] font-bold   text-[10px] rounded-lg hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all"
                                 >
                                   <Send className="w-4 h-4" /> Submit for Review
                                 </button>
                               </>
                             )}
                             {c.status === 'approved' && (
                                 <span className="inline-flex items-center gap-2 text-[#E67E22] text-[10px] font-black   bg-[#E67E22]/10 px-4 py-2 rounded-lg border border-[#E67E22]/20">
                                   <CheckCircle2 className="w-4 h-4" /> Live for Students
                                 </span>
                             )}
                             {c.status === 'pending' && (
                                 <span className="inline-flex items-center gap-2 text-amber-500 text-[10px] font-black   bg-amber-500/100/10 px-4 py-2 rounded-lg border border-amber-500/20">
                                   <Clock className="w-4 h-4" /> Pending Admin Review
                                 </span>
                             )}
                             {c.status === 'rejected' && (
                                 <span className="inline-flex items-center gap-2 text-red-500 text-[10px] font-black   bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 sm:ml-2">
                                   <XSquare className="w-4 h-4" /> Changes Required
                                 </span>
                             )}
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            )}
          </div>
        );
      case 'create':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
            <h2 className={`text-2xl font-display font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Create Curriculum</h2>
            <div className={`backdrop-blur-xl p-6 md:p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${isDarkMode ? 'bg-[#1E293B]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700] opacity-[0.02] rounded-full blur-3xl pointer-events-none"></div>
              
              <form onSubmit={handleCreateCourse} className="space-y-6 relative z-10">
                
                <div>
                  <label className="block text-[10px] font-black   text-[#FFD700] mb-2">Subject Matter Title <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    required 
                    className={`w-full px-6 py-4 bg-[#1E293B] font-bold border rounded-xl focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none transition-all placeholder:text-slate-300 ${isDarkMode ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'}`} 
                    placeholder="E.g., Advanced JavaScript Patterns" 
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black   text-[#FFD700] mb-2">Detailed Framework <span className="text-red-500">*</span></label>
                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    required 
                    className={`w-full px-6 py-4 bg-[#1E293B] font-medium border rounded-xl focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none transition-all resize-y placeholder:text-slate-300 ${isDarkMode ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'}`} 
                    rows="5" 
                    placeholder="Provide a comprehensive operational framework for this module."
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black   text-[#FFD700] mb-2">Primary Domain</label>
                    <CustomDropdown
                      value={formData.category}
                      onChange={(val) => setFormData({...formData, category: val})}
                      options={courseDropdownOptions}
                      className="w-full bg-[#1E293B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black   text-[#FFD700] mb-2">Time to Mastery (Hours) <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      min="1" 
                      value={formData.duration} 
                      onChange={e => setFormData({...formData, duration: Number(e.target.value)})} 
                      required 
                      className={`w-full px-6 py-4 bg-[#1E293B] font-bold border rounded-xl focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none transition-all ${isDarkMode ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'}`} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black   text-[#FFD700] mb-2">Visual Asset Node (URL)</label>
                  <input 
                    type="url" 
                    value={formData.thumbnail} 
                    onChange={e => setFormData({...formData, thumbnail: e.target.value})} 
                    className={`w-full px-6 py-4 bg-[#1E293B] font-medium border rounded-xl focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none transition-all placeholder:text-slate-300 ${isDarkMode ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'}`} 
                    placeholder="https://content-node.cloud/thumbnail.jpg" 
                  />
                  <p className={`mt-2 text-xs font-bold flex items-center gap-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                    <AlertCircle className="w-4 h-4 text-[#FFD700]" /> Will fallback to system default if empty.
                  </p>
                </div>

                <div className={`pt-8 border-t flex flex-col sm:flex-row gap-4 justify-end ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                   <button 
                    type="button" 
                    onClick={() => setActiveTab('courses')} 
                    className={`px-8 py-3.5 bg-transparent font-black text-[11px] rounded-xl border hover:bg-[#1E293B]/5 hover:text-white transition-all order-2 sm:order-1 ${isDarkMode ? 'text-slate-200 border-white/10' : 'text-slate-600 border-slate-200'}`}
                   >
                     Abort Setup
                   </button>
                   <button 
                    type="submit" 
                    className={`px-8 py-3.5 font-semibold rounded-xl hover:-translate-y-0.5 transition-transform order-1 sm:order-2 bg-[#E67E22] hover:bg-[#CF711F] shadow-md border border-[#E67E22] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                   >
                     Initialize Protocol
                   </button>
                </div>
              </form>
            </div>
          </div>
        );
      case 'settings':
        return <ProfileView />;
      default:
        return null;
    }
  };

  const navItemClass = (tabName) => `
    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm text-left
    ${activeTab === tabName 
      ? 'bg-[#1E293B] text-white shadow-sm' 
      : 'bg-transparent text-slate-400 hover:bg-[#1E293B] hover:text-white'
    }
  `;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0B1120]' : 'bg-[#FAFAFA]'} flex flex-col md:flex-row font-sans ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
      {/* Sidebar Layout */}
      <aside className={`w-full md:w-64 ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white'} shrink-0 flex flex-col md:h-screen border-r sticky top-0 font-sans ${isDarkMode ? 'text-white border-white/5' : 'text-slate-900 border-slate-100'}`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
           <img src={edotLogo} alt="EDOT Logo" className="h-8 w-auto rounded opacity-90" />
        </div>
        
        <div className="p-6">
           <p className="text-xs font-bold text-slate-500   mb-4">Menu</p>
           <nav className="space-y-1">
             <button onClick={() => setActiveTab('overview')} className={navItemClass('overview')}>
               <LayoutDashboard className="w-4 h-4 shrink-0" /> Systems Overview
             </button>
             <button onClick={() => setActiveTab('courses')} className={navItemClass('courses')}>
               <Layers className="w-4 h-4 shrink-0" /> Control Matrix
             </button>
             <button onClick={() => navigate('/instructor/builder')} className={navItemClass('create')}>
               <PlusCircle className="w-4 h-4 shrink-0" /> Generate Construct
             </button>
           </nav>
           
           <p className="text-xs font-bold text-slate-500   mt-8 mb-4">Preference</p>
           <nav className="space-y-1">
             <button onClick={() => setActiveTab('settings')} className={navItemClass('settings')}>
               <Settings className="w-4 h-4 shrink-0" /> Authority Core
             </button>
           </nav>
        </div>
        
        <div className="p-6 mt-auto">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:text-red-400 hover:bg-red-400/10 border border-transparent transition-colors font-medium text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
          >
            <LogOut className="w-4 h-4 shrink-0" /> Terminate Link
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto relative">
          
          {/* Top Header mapped from image requirements */}
          <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 w-full">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Global Search (Students, Courses, Messages)..." 
                className={`w-full pl-10 pr-20 py-2.5 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-white/10 transition-all font-medium placeholder:text-slate-500 shadow-sm ${isDarkMode ? 'bg-[#1E293B] border-white/5 text-white' : 'bg-white border-slate-100 text-slate-900'}`} />
              <div className={`absolute right-2 top-1/2 -translate-y-1/2 bg-[#1A1E26] text-[9px] px-2 py-1 rounded font-bold border ${isDarkMode ? 'text-slate-400 border-white/5' : 'text-slate-500 border-slate-100'}`}>
                CTRL + K
              </div>
            </div>
            
            <div className="flex items-center gap-6 w-full sm:w-auto justify-end">
              <div className="relative cursor-pointer hover:bg-white/5 p-2 rounded-full transition-colors">
                <Bell className={`w-5 h-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
                <span className={`absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#E30A17] rounded-full border-2 border-[#0d0f12] text-[7px] flex items-center justify-center font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>1</span>
              </div>
              
              <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-white/5 transition-colors">
                 <div className="w-9 h-9 rounded-full bg-white text-[#0B0E14] font-black flex items-center justify-center shadow-sm">
                   {user?.name?.charAt(0) || 'I'}
                 </div>
                 <div className="text-left hidden sm:block">
                   <div className={`text-sm font-bold leading-none mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'Instructor'}</div>
                   <div className={`text-[11px] font-medium leading-none capitalize ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{user?.role || 'Instructor'}</div>
                 </div>
              </div>
            </div>
          </header>

          {renderContent()}
        </div>
      </main>

      {/* Add Lesson Modal Overlays */}
      {activeCourseId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-0">
          <div className={`absolute inset-0 backdrop-blur-md ${isDarkMode ? 'bg-[#1E293B]/80' : 'bg-white/90'}`} onClick={() => setActiveCourseId(null)}></div>
          
          <div className={`bg-[#1E293B] border rounded-3xl w-full max-w-xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
            <div className={`flex justify-between items-center p-8 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
              <h2 className={`text-xl font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <PlayCircle className="w-6 h-6 text-[#FFD700]" />
                Compile Module Entry
              </h2>
              <button 
                onClick={() => setActiveCourseId(null)} 
                className={`w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#1E293B]/10 hover:text-white transition-colors ${isDarkMode ? 'bg-[#1E293B]/5 text-slate-200' : 'bg-slate-50 text-slate-600'}`}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddLesson} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black   text-[#FFD700] mb-2">Module Designation <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={lessonData.title} 
                  onChange={e => setLessonData({...lessonData, title: e.target.value})} 
                  required 
                  className={`w-full px-6 py-4 font-bold border rounded-xl focus:ring-2 focus:ring-[#FFD700] outline-none transition-all placeholder:text-slate-300 ${isDarkMode ? 'bg-[#1E293B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`} 
                  placeholder="E.g., Quantum Algorithm Analysis" 
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black   text-[#FFD700] mb-2">Execution Protocol <span className="text-red-500">*</span></label>
                <textarea 
                  value={lessonData.description} 
                  onChange={e => setLessonData({...lessonData, description: e.target.value})} 
                  required 
                  className={`w-full px-6 py-4 font-medium border rounded-xl focus:ring-2 focus:ring-[#FFD700] outline-none transition-all resize-none placeholder:text-slate-300 ${isDarkMode ? 'bg-[#1E293B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`} 
                  rows="3" 
                  placeholder="Define operational expectations for this sector."
                ></textarea>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-[10px] font-black   text-[#FFD700] mb-2">Media Origin Vector <span className="text-red-500">*</span></label>
                  <input 
                    type="url" 
                    value={lessonData.videoUrl} 
                    onChange={e => setLessonData({...lessonData, videoUrl: e.target.value})} 
                    required 
                    className={`w-full px-6 py-4 font-bold border rounded-xl focus:ring-2 focus:ring-[#FFD700] outline-none transition-all placeholder:text-slate-300 ${isDarkMode ? 'bg-[#1E293B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`} 
                    placeholder="WSS:// or HTTP://" 
                  />
                </div>
                <div className="w-full sm:w-32 shrink-0">
                  <label className="block text-[10px] font-black   text-[#FFD700] mb-2">Cycle (m) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    min="1" 
                    value={lessonData.duration} 
                    onChange={e => setLessonData({...lessonData, duration: Number(e.target.value)})} 
                    required 
                    className={`w-full px-6 py-4 font-black border rounded-xl focus:ring-2 focus:ring-[#FFD700] outline-none transition-all text-center ${isDarkMode ? 'bg-[#1E293B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`} 
                  />
                </div>
              </div>
              
              <div className={`pt-8 border-t flex gap-4 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                <button 
                  type="button" 
                  onClick={() => setActiveCourseId(null)}
                  className={`flex-1 py-4 px-6 bg-transparent font-black text-[11px] rounded-xl border hover:bg-[#1E293B]/5 hover:text-white transition-all shadow-sm ${isDarkMode ? 'text-slate-200 border-white/10' : 'text-slate-600 border-slate-200'}`}
                >
                  Terminate
                </button>
                <button 
                  type="submit" 
                  className={`flex-1 py-4 px-6 font-semibold rounded-xl border hover:-translate-y-0.5 transition-transform bg-[#E67E22] hover:bg-[#CF711F] shadow-md border-[#E67E22] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                >
                  Compile Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
