import React, { useEffect, useState, useCallback } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AgendaCreationModal from '../components/AgendaCreationModal';
import CustomDropdown from '../components/CustomDropdown';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Users, BookOpen, Clock, Settings, LogOut, CheckCircle2, XCircle, UserCog, AlertTriangle, ShieldCheck, Check, Activity, MessageSquare, UserPlus, Eye, ShieldOff, ArrowRightCircle, UserPlus as UserPlusIcon, Search, Bell, Layers, Library } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
const edotLogo = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/e69zbyhv3obsuf4uknyy';
import ActivityFeed from '../components/ActivityFeed';
import AgendaWidget from '../components/AgendaWidget';
import ProfileView from './ProfileView';

export default function AdminDashboard() {
  const isDarkMode = useThemeMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserPassword, setSelectedUserPassword] = useState('');
  const [manageOpen, setManageOpen] = useState(false);
  const [selectedUserActivities, setSelectedUserActivities] = useState([]);
  const [selectedUserCourses, setSelectedUserCourses] = useState([]);
  const [recentFamilyActivity, setRecentFamilyActivity] = useState([]);
  const [childSearch, setChildSearch] = useState('');
  const [selectedChildId, setSelectedChildId] = useState('');
  const [agendaEvents, setAgendaEvents] = useState([]);
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      setStats(data.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/analytics/detailed');
      setAnalytics(data.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsersList(data.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  }, []);

  const fetchPendingCourses = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/courses/pending');
      setPendingCourses(data.data);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    }
  }, []);

  const fetchPendingEnrollments = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/enrollments/pending');
      setPendingEnrollments(data.data);
    } catch (err) {
      console.error('Failed to fetch pending enrollments', err);
    }
  }, []);

  const fetchAllCourses = useCallback(async () => {
    try {
      const { data } = await api.get('/courses?limit=100');
      setAllCourses(data.courses || []);
    } catch (err) {
      console.error('Failed to fetch all courses', err);
    }
  }, []);

  const fetchAgendaEvents = useCallback(async () => {
    try {
      const { data } = await api.get('/calendar');
      setAgendaEvents(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error('Failed to fetch agenda events', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadAll = async () => {
      try {
        await Promise.all([fetchUsers(), fetchPendingCourses(), fetchPendingEnrollments(), fetchStats(), fetchAnalytics(), fetchAllCourses()]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAll();

    return () => {
      isMounted = false;
    };
  }, [fetchUsers, fetchPendingCourses, fetchPendingEnrollments, fetchStats, fetchAnalytics, fetchAllCourses, fetchAgendaEvents]);

  useEffect(() => {
    fetchAgendaEvents();
  }, [fetchAgendaEvents]);

  const updateRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      fetchUsers();
    } catch (err) {
      console.error('Failed to update role', err);
    }
  };

  const updateUserStatus = async (userId, status) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status });
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user status', err);
    }
  };

  const assignInstructor = async (studentId, instructorId) => {
    if (!instructorId) return;
    try {
      await api.put(`/admin/student/${studentId}/assign`, { instructorId });
      fetchUsers();
    } catch (err) {
      console.error('Failed to assign instructor', err);
    }
  };

  const fetchUserActivities = useCallback(async (userId, role = '', children = []) => {
    try {
      const { data } = await api.get('/activity/all');
      const allActivities = Array.isArray(data.data) ? data.data : [];
      const userActivity = allActivities.filter((a) => {
        const ownerId = a.user?.id || a.user;
        return String(ownerId) === String(userId);
      }).slice(0, 40);
      setSelectedUserActivities(userActivity);

      if (role === 'parent' && children.length > 0) {
        const childIds = children.map((c) => String(c.id || c));
        const familyActivity = allActivities.filter((a) => childIds.includes(String(a.user?.id || a.user))).slice(0, 40);
        setRecentFamilyActivity(familyActivity);
      } else {
        setRecentFamilyActivity([]);
      }
    } catch (err) {
      console.error('Failed to fetch user activities', err);
      setSelectedUserActivities([]);
      setRecentFamilyActivity([]);
    }
  }, []);

  const openManagePanel = async (userId) => {
    try {
      const { data } = await api.get(`/admin/users/${userId}`);
      const user = data.data;
      setSelectedUser(user);
      setSelectedUserPassword('');
      setManageOpen(true);
      setChildSearch('');
      setSelectedChildId('');

      if (user) {
        await fetchUserActivities(userId, user.role, user.children || []);
        const userCourses = allCourses.filter((c) => String(c.instructor?.id || c.instructor) === String(userId));
        setSelectedUserCourses(userCourses);
      }
    } catch (err) {
      console.error('Failed to open manage panel', err);
    }
  };

  const closeManagePanel = () => {
    setSelectedUser(null);
    setManageOpen(false);
    setChildSearch('');
    setSelectedChildId('');
  };

  const saveUserUpdates = async () => {
    if (!selectedUser) return;
    try {
      const payload = {
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        bio: selectedUser.bio,
        paymentStatus: selectedUser.paymentStatus,
        outstandingBalance: selectedUser.outstandingBalance,
        status: selectedUser.status
      };
      if (selectedUserPassword && selectedUserPassword.length >= 6) {
        payload.password = selectedUserPassword;
      }
      await api.put(`/admin/users/${selectedUser.id}`, payload);
      await fetchUsers();
      setManageOpen(false);
    } catch (err) {
      console.error('Failed to save user updates', err);
    }
  };

  const deleteAdminUser = async (userId) => {
    if (!window.confirm('This will permanently delete user and all associations. Continue?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      await fetchUsers();
      if (selectedUser && selectedUser.id === userId) closeManagePanel();
    } catch (err) {
      console.error('Failed to delete user', err);
    }
  };

  const addChildToParent = async (childId) => {
    if (!selectedUser || selectedUser.role !== 'parent' || !childId) return;
    try {
      await api.put(`/admin/users/${selectedUser.id}/link-child`, { childId });
      const { data } = await api.get(`/admin/users/${selectedUser.id}`);
      setSelectedUser(data.data);
    } catch (err) {
      console.error('Failed to link child', err);
    }
  };

  const removeChildFromParent = async (childId) => {
    if (!selectedUser || selectedUser.role !== 'parent' || !childId) return;
    try {
      await api.put(`/admin/users/${selectedUser.id}/unlink-child`, { childId });
      const { data } = await api.get(`/admin/users/${selectedUser.id}`);
      setSelectedUser(data.data);
    } catch (err) {
      console.error('Failed to unlink child', err);
    }
  };

  const manualEnrollment = async (courseId, status = 'active') => {
    if (!selectedUser || selectedUser.role !== 'student' || !courseId) return;
    try {
      await api.post('/admin/enrollments/manual', { studentId: selectedUser.id, courseId, status });
      const { data } = await api.get(`/admin/users/${selectedUser.id}`);
      setSelectedUser(data.data);
      fetchUsers();
    } catch (err) {
      console.error('Failed to set manual enrollment', err);
    }
  };

  const removeEnrollment = async (courseId) => {
    if (!selectedUser || !courseId) return;
    try {
      await api.delete('/admin/enrollments', { data: { studentId: selectedUser.id, courseId } });
      const { data } = await api.get(`/admin/users/${selectedUser.id}`);
      setSelectedUser(data.data);
      fetchUsers();
    } catch (err) {
      console.error('Failed to remove enrollment', err);
    }
  };

  const resetUserProgress = async () => {
    if (!selectedUser) return;
    try {
      await api.put(`/admin/users/${selectedUser.id}/reset-progress`);
      const { data } = await api.get(`/admin/users/${selectedUser.id}`);
      setSelectedUser(data.data);
      await fetchUserActivities(selectedUser.id, selectedUser.role, data.data.children || []);
      fetchUsers();
    } catch (err) {
      console.error('Failed to reset progress', err);
    }
  };

  const blockService = async () => {
    if (!selectedUser) return;
    await updateUserStatus(selectedUser.id, 'blocked');
    await openManagePanel(selectedUser.id);
  };

  const toggleInstructorAccess = async () => {
    if (!selectedUser) return;
    const targetStatus = selectedUser.status === 'approved' ? 'rejected' : 'approved';
    await updateUserStatus(selectedUser.id, targetStatus);
    const { data } = await api.get(`/admin/users/${selectedUser.id}`);
    setSelectedUser(data.data);
  };

  const filterCandidates = () => {
    if (!childSearch.trim()) return [];
    const lowercase = childSearch.toLowerCase();
    return usersList.filter((u) => u.role === 'student' && u.name.toLowerCase().includes(lowercase) && !(selectedUser?.children || []).some(c => c.id === u.id));
  };

  const updateCourseStatus = async (courseId, status) => {
    try {
      await api.put(`/admin/courses/${courseId}/status`, { status });
      fetchPendingCourses();
    } catch (err) {
      console.error('Failed to update course', err);
    }
  };

  const handleEnrollmentApproval = async (enrollmentId, status) => {
    try {
      await api.put(`/admin/enrollments/${enrollmentId}/status`, { status });
      fetchPendingEnrollments();
      fetchUsers();
    } catch (err) {
      console.error('Failed to update enrollment', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleAgendaCreated = (evt) => {
    setAgendaEvents((prev) => [...prev, evt].sort((a, b) => new Date(a.date) - new Date(b.date)));
  };

  const deleteAgenda = async (agendaId) => {
    try {
      await api.delete(`/calendar/${agendaId}`);
      setAgendaEvents((prev) => prev.filter((item) => item.id !== agendaId));
    } catch (err) {
      console.error('Failed to delete agenda', err);
    }
  };

  const getStatusBadgeClasses = (status) => {
    if (status === 'approved') return 'bg-emerald-500/100/20 text-emerald-300 border border-emerald-300';
    if (status === 'pending') return 'bg-amber-500/100/20 text-amber-300 border border-amber-300';
    if (status === 'rejected') return 'bg-rose-500/100/20 text-rose-300 border border-rose-300';
    if (status === 'blocked') return 'bg-[#F97316]/20 text-[#F97316] border border-[#F97316]';
    return 'bg-[#11151F]/40 backdrop-blur-xl0/20 text-slate-200 border border-slate-400';
  };

  const selectedUserCompletion = selectedUser?.enrolledCourses?.length ?
    Math.round(selectedUser.enrolledCourses.reduce((acc, ec) => acc + (ec.progress || 0), 0) / selectedUser.enrolledCourses.length) : 0;

  const instructorsCount = usersList.filter(u => u.role === 'instructor').length;

  const instructorOptions = React.useMemo(() => {
    return usersList.filter(user => user.role === 'instructor').map(inst => ({
      label: inst.name,
      value: inst.id,
      render: (
        <div className="flex items-center gap-3 w-full py-0.5">
          <div className="w-8 h-8 rounded-full bg-[#E67E22]/20 text-[#E67E22] flex items-center justify-center font-bold text-xs shrink-0 border border-[#E67E22]/30 shadow-sm ">
              {inst.name ? inst.name.charAt(0) : '?'}
          </div>
          <div className="flex flex-col text-left flex-1 min-w-0">
            <span className={`font-bold text-xs truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{inst.name}</span>
            <span className={`text-[10px] truncate mt-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{inst.email}</span>
          </div>
        </div>
      )
    }));
  }, [usersList]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className={`w-10 h-10 border-4 border-t-red-500 rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview': {
        const revenueData = analytics?.revenueData || [];
        const userDistributionData = [
          { name: 'Students', value: stats?.totalStudents || 0, color: '#3b82f6' },
          { name: 'Instructors', value: stats?.totalInstructors || 0, color: '#a855f7' },
          { name: 'Admins', value: (user?.role === 'admin' ? 1 : 0), color: '#ef4444' }, // Just an estimate fallback if explicit admin count wasn't fetched
        ];
        
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Admin Overview</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden group ${isDarkMode ? 'bg-[#13161B] border-white/10' : 'bg-white border-slate-200'}`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
                    <h3 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{usersList.length}</h3>
                  </div>
                  <div className={`w-8 h-8 rounded shrink-0 border flex items-center justify-center bg-transparent ${isDarkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <Users className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border border-rose-200 shadow-sm relative overflow-hidden group hover:border-rose-300 ${isDarkMode ? 'bg-[#13161B]' : 'bg-white'}`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Pending Users</p>
                    <h3 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats?.pendingUsers || 0}</h3>
                  </div>
                  <div className={`w-8 h-8 rounded shrink-0 border flex items-center justify-center bg-transparent ${isDarkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <UserPlus className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden group ${isDarkMode ? 'bg-[#13161B] border-white/10' : 'bg-white border-slate-200'}`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Instructors</p>
                    <h3 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{instructorsCount}</h3>
                  </div>
                  <div className={`w-8 h-8 rounded shrink-0 border flex items-center justify-center bg-transparent ${isDarkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <UserCog className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden group ${isDarkMode ? 'bg-[#13161B] border-white/10' : 'bg-white border-slate-200'}`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Pending Approvals</p>
                    <h3 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{pendingCourses.length}</h3>
                  </div>
                  <div className={`w-8 h-8 rounded shrink-0 border flex items-center justify-center bg-transparent ${isDarkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-[#13161B] border-white/10' : 'bg-white border-slate-200'}`}>
                <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Revenue Overview (YTD)</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value}`} dx={-10} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`$${value}`, 'Revenue']}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-[#13161B] border-white/10' : 'bg-white border-slate-200'}`}>
                <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>User Distribution</h3>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {userDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className={`p-6 lg:p-8 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-[#13161B] border-white/10' : 'bg-white border-slate-200'}`}>
               <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Quick Actions</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <button 
                  onClick={() => setActiveTab('users')} 
                  className={`flex items-center gap-3 p-4 rounded-xl border hover:border-blue-300 hover:bg-blue-500/10 hover:text-blue-700 transition-colors text-left group ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}
                 >
                   <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                     <Users className="w-5 h-5" />
                   </div>
                   <div>
                     <span className="block font-semibold">Manage Users</span>
                     <span className={`text-sm group-hover:text-blue-600 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{stats?.pendingUsers > 0 ? <span className="text-rose-500 font-bold">{stats.pendingUsers} awaiting approval</span> : 'Change roles, verify status'}</span>
                   </div>
                 </button>
                 <button 
                  onClick={() => setActiveTab('courses')} 
                  className={`flex items-center gap-3 p-4 rounded-xl border hover:border-amber-300 hover:bg-amber-500/10 hover:text-amber-700 transition-colors text-left group ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}
                 >
                   <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                     <BookOpen className="w-5 h-5" />
                   </div>
                   <div>
                     <span className="block font-semibold">Review Courses</span>
                     <span className={`text-sm group-hover:text-amber-600 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{pendingCourses.length} awaiting approval</span>
                   </div>
                 </button>
               </div>
            </div>

            <div className={`p-6 lg:p-8 rounded-2xl border shadow-sm mt-8 ${isDarkMode ? 'bg-[#13161B] border-white/10' : 'bg-white border-slate-200'}`}>
               <div className="flex justify-between items-center mb-6">
                 <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Intervention Overview</h3>
                 <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-md  ">Live Support Monitor</span>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 <div className={`p-4 rounded-xl border bg-transparent flex items-center gap-5 hover:shadow-sm transition-shadow ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                   <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                     <MessageSquare className="w-6 h-6"/>
                   </div>
                   <div>
                     <p className={`text-[13px] font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Active Parent Chats</p>
                     <h4 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>12</h4>
                   </div>
                 </div>
                 <div className={`p-4 rounded-xl border bg-rose-500/10 flex items-center gap-5 hover:shadow-sm transition-shadow ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                   <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                     <AlertTriangle className="w-6 h-6"/>
                   </div>
                   <div>
                     <p className="text-[13px] text-rose-500 font-bold   mb-1">Pending Flags</p>
                     <h4 className="text-3xl font-black text-rose-900">3</h4>
                   </div>
                 </div>
                 <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-500/10 flex items-center gap-5 hover:shadow-sm transition-shadow">
                   <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                     <CheckCircle2 className="w-6 h-6"/>
                   </div>
                   <div>
                     <p className="text-[13px] text-emerald-600 font-bold   mb-1">Resolved Cases</p>
                     <h4 className="text-3xl font-black text-emerald-900">45</h4>
                   </div>
                 </div>
               </div>
            </div>

            <div className="mt-8">
               <AgendaWidget 
                 events={agendaEvents} 
                 userRole="admin" 
                 isAdmin={true} 
                 onDelete={deleteAgenda} 
                 onCreateClick={() => setShowAgendaModal(true)} 
               />
            </div>

            <AgendaCreationModal
              isOpen={showAgendaModal}
              onClose={() => setShowAgendaModal(false)}
              onAgendaCreated={(evt) => { handleAgendaCreated(evt); setShowAgendaModal(false); }}
            />

          </div>
        );
      }
      case 'users':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className={`text-2xl font-display font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>User Management</h2>
              <div className={`px-4 py-2 rounded-lg border text-sm font-medium shadow-sm flex items-center gap-2 ${isDarkMode ? 'bg-[#13161B] border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-500'}`}>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Super Admin Access
              </div>
            </div>
            
            <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDarkMode ? 'bg-[#13161B] border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className={`bg-transparent border-b text-sm font-semibold ${isDarkMode ? 'border-white/10 text-slate-300' : 'border-slate-200 text-slate-500'}`}>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Assign Instructor</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-sm font-normal">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-transparent/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full backdrop-blur-xl flex flex-shrink-0 items-center justify-center font-bold text-xs ${isDarkMode ? 'bg-[#11151F]/5 text-slate-300' : 'bg-slate-50 text-slate-500'}`}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{u.name}</span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{u.email}</td>
                        <td className={`px-6 py-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{new Date(u.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td className="px-6 py-4">
                          {u.status === 'pending' ? (
                            <div className="flex gap-2 relative z-10 w-max">
                               <button onClick={() => updateUserStatus(u.id, 'approved')} className="text-xs font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors shadow-sm">Approve</button>
                               <button onClick={() => updateUserStatus(u.id, 'rejected')} className="text-xs font-bold bg-rose-500/10 text-rose-600 hover:bg-rose-100 hover:text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors shadow-sm">Reject</button>
                            </div>
                          ) : (
                            <span className={`inline-flex w-max items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold   border ${
                              u.status === 'approved' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200' : 
                              u.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                              'bg-transparent text-slate-200 border-white/10'
                            }`}>
                              {u.status === 'approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : u.status === 'rejected' ? <XCircle className="w-3.5 h-3.5" /> : null}
                              {u.status}
                            </span>
                          )}
                        </td>
                          {u.id === user?.id ? (
                            <div className="opacity-50 cursor-not-allowed">
                               <CustomDropdown value={u.role} onChange={() => {}} options={[{ label: u.role, value: u.role }]} />
                            </div>
                          ) : (
                            <CustomDropdown 
                              value={u.role} 
                              onChange={(val) => updateRole(u.id, val)}
                              options={[
                                { label: 'Student', value: 'student' },
                                { label: 'Instructor', value: 'instructor' },
                                { label: 'Admin', value: 'admin' }
                              ]}
                              className="w-32"
                            />
                          )}
                        <td className="px-6 py-4">
                           {u.role === 'student' ? (
                              <CustomDropdown 
                                value={u.assignedInstructor?.id || u.assignedInstructor || ''}
                                onChange={(val) => assignInstructor(u.id, val)}
                                options={instructorOptions}
                                placeholder="Select Inst..."
                                searchable={true}
                                className="w-44"
                              />
                           ) : (
                             <span className={`text-sm italic ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>N/A</span>
                           )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            className={`px-3 py-1.5 rounded-lg border text-sm font-semibold flex items-center gap-1 bg-[#E67E22] hover:bg-[#CF711F] shadow-md border-[#E67E22] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                            onClick={() => openManagePanel(u.id)}
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'courses':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-display font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Course Approvals</h2>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full  ">
                {pendingCourses.length} Pending
              </span>
            </div>

            {pendingCourses.length === 0 ? (
               <div className={`p-12 text-center rounded-2xl border shadow-sm flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#13161B] border-white/10' : 'bg-white border-slate-200'}`}>
                 <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                   <CheckCircle2 className="w-10 h-10" />
                 </div>
                 <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>All Caught Up!</h3>
                 <p className={`max-w-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>There are no pending courses awaiting your review. Check back later.</p>
               </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                  {pendingCourses.map(c => (
                    <div key={c.id} className={`rounded-2xl border shadow-sm overflow-hidden flex flex-col md:flex-row group ${isDarkMode ? 'bg-[#13161B] border-white/10' : 'bg-white border-slate-200'}`}>
                      
                      <div className={`w-full md:w-64 h-48 md:h-auto shrink-0 relative backdrop-blur-xl ${isDarkMode ? 'bg-[#11151F]/5' : 'bg-slate-50'}`}>
                        <img 
                          src={c.thumbnail === 'default-course.jpg' ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80' : c.thumbnail} 
                          alt={c.title} 
                          className="w-full h-full object-cover" 
                        />
                        <div className={`absolute top-3 left-3 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold shadow-sm ${isDarkMode ? 'bg-[#13161B]/90 text-slate-200' : 'bg-white/90 text-slate-600'}`}>
                          {c.category}
                        </div>
                      </div>
                      
                      <div className="p-6 md:p-8 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <h3 className={`text-xl font-bold leading-snug ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{c.title}</h3>
                          <span className="shrink-0 flex items-center gap-1.5 bg-amber-500/10 text-amber-700 px-3 py-1 rounded-full text-xs font-bold   border border-amber-200">
                             <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        </div>
                        
                        <p className={`text-sm mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                          <span className="flex items-center gap-1"><UserCog className="w-4 h-4" /> Instructor: <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{c.instructor?.name || 'Unknown'}</span></span>
                          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-500'}>•</span>
                          <span>{c.duration} hours</span>
                          <span className={isDarkMode ? 'text-slate-300' : 'text-slate-500'}>•</span>
                          <span>{c.lessons?.length || 0} lessons</span>
                        </p>
                        
                        <p className={`mb-6 flex-1 line-clamp-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{c.description}</p>
                        
                        <div className={`flex flex-col sm:flex-row gap-3 pt-4 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                           <button 
                            onClick={() => updateCourseStatus(c.id, 'approved')} 
                            className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 font-semibold rounded-xl hover:bg-emerald-700 hover:-translate-y-0.5 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                           >
                             <Check className="w-5 h-5" /> Approve & Publish
                           </button>
                           <button 
                            onClick={() => updateCourseStatus(c.id, 'rejected')} 
                            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 text-red-600 font-semibold rounded-xl border border-red-200 hover:bg-red-50 hover:-translate-y-0.5 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode ? 'bg-[#13161B]' : 'bg-white'}`}
                           >
                             <XCircle className="w-5 h-5" /> Reject
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            )}

            <div className={`mt-8 p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-[#13161B] border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Enrollment Approval Queue</h3>
                <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{pendingEnrollments.length} pending</span>
              </div>
              {!pendingEnrollments.length ? (
                <p className={isDarkMode ? 'text-slate-300' : 'text-slate-500'}>No pending enrollment requests.</p>
              ) : (
                <div className="space-y-3">
                  {pendingEnrollments.map((req) => (
                    <div key={req.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border rounded-lg ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                      <div>
                        <p><span className="font-semibold">Student:</span> {req.studentName} ({req.studentEmail})</p>
                        <p><span className="font-semibold">Course:</span> {req.courseTitle}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Requested at: {new Date(req.requestedAt).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEnrollmentApproval(req.id, 'active')} className={`px-3 py-1.5 bg-emerald-600 rounded-lg text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Approve</button>
                        <button onClick={() => handleEnrollmentApproval(req.id, 'rejected')} className={`px-3 py-1.5 bg-rose-500/100 rounded-lg text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 'logs':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className={`text-2xl font-display font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>System Logs</h2>
            <div className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-[#13161B] border-white/10' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-center mb-6">
                  <span className={`font-semibold flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}><Activity className="w-5 h-5" /> All Platform Activity</span>
                  <button className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors bg-[#E67E22] hover:bg-[#CF711F] shadow-md border border-[#E67E22] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Export CSV</button>
                </div>
                <ActivityFeed isAdmin={true} limit={20} />
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
      : 'bg-transparent text-slate-400 hover:bg-[#11151F] hover:text-white'
    }
  `;

  return (
    <div className={`min-h-screen bg-[#0d0f12] flex flex-col md:flex-row font-sans ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
      {/* Sidebar Layout */}
      <aside className={`w-full md:w-64 bg-[#0d0f12] shrink-0 flex flex-col md:h-screen border-r sticky top-0 font-sans ${isDarkMode ? 'text-white border-white/5' : 'text-slate-900 border-slate-100'}`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
           <img src={edotLogo} alt="EDOT Logo" className="h-8 w-auto rounded opacity-90" />
        </div>
        
        <div className="p-6">
           <p className="text-xs font-bold text-slate-500   mb-4">Menu</p>
           <nav className="space-y-2">
             <button onClick={() => setActiveTab('overview')} className={navItemClass('overview')}>
               <ShieldCheck className="w-5 h-5 shrink-0" /> Overview
             </button>
             <button onClick={() => setActiveTab('users')} className={navItemClass('users')}>
               <Users className="w-5 h-5 shrink-0" /> Manage Users
               {stats?.pendingUsers > 0 && (
                 <span className={`ml-auto bg-rose-500/100 text-xs font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                   {stats?.pendingUsers}
                 </span>
               )}
             </button>
             <button onClick={() => setActiveTab('courses')} className={navItemClass('courses')}>
               <BookOpen className="w-5 h-5 shrink-0" /> Course Approvals
               {pendingCourses.length > 0 && (
                 <span className={`ml-auto bg-amber-500/100 text-xs font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                   {pendingCourses.length}
                 </span>
               )}
             </button>
             <button onClick={() => navigate('/dashboard/my-courses')} className={navItemClass('manage_courses')}>
               <Layers className="w-5 h-5 shrink-0" /> Manage Courses
             </button>
             <button onClick={() => navigate('/dashboard/library')} className={navItemClass('library')}>
               <Library className="w-5 h-5 shrink-0" /> Digital Library
             </button>
             <button onClick={() => setActiveTab('logs')} className={navItemClass('logs')}>
               <Activity className="w-5 h-5 shrink-0" /> System Logs
             </button>
           </nav>
           <p className="text-xs font-bold text-slate-500   mt-8 mb-4">Preference</p>
           <nav className="space-y-1">
             <button onClick={() => setActiveTab('settings')} className={navItemClass('settings')}>
               <Settings className="w-4 h-4 shrink-0" /> Settings
             </button>
           </nav>
        </div>
        
        <div className="p-6 mt-auto">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:text-red-400 hover:bg-red-400/10 border border-transparent transition-colors font-medium text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
          >
            <LogOut className="w-4 h-4 shrink-0" /> Logout
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
                className={`w-full pl-10 pr-20 py-2.5 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-white/10 transition-all font-medium placeholder:text-slate-500 shadow-sm ${isDarkMode ? 'bg-[#13161B] border-white/5 text-white' : 'bg-white border-slate-100 text-slate-900'}`} />
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
                   {user?.name?.charAt(0) || 'A'}
                 </div>
                 <div className="text-left hidden sm:block">
                   <div className={`text-sm font-bold leading-none mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'Administrator'}</div>
                   <div className={`text-[11px] font-medium leading-none capitalize ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{user?.role || 'Administrator'}</div>
                 </div>
              </div>
            </div>
          </header>

          {renderContent()}
        </div>

        <AnimatePresence>
          {manageOpen && selectedUser && (
            <motion.div
              key="intel-hub-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-start pt-10 overflow-auto px-4"
              onClick={closeManagePanel}
            >
              <motion.div
                initial={{ x: 450, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 450, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 30 }}
                className={`relative w-full max-w-6xl rounded-3xl border border-[#00D4FF] p-5 shadow-2xl backdrop-blur-2xl ${isDarkMode ? 'bg-[#0B0E14]/90' : 'bg-white/95'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border border-[#00D4FF] bg-gradient-to-br from-slate-700 via-slate-800 to-slate-600 overflow-hidden shadow-lg">
                      <img
                        src={selectedUser.avatar?.startsWith('http') ? selectedUser.avatar : selectedUser.avatar ? `/uploads/${selectedUser.avatar}` : 'https://via.placeholder.com/150'}
                        alt={selectedUser.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedUser.name}</h3>
                      <p className="text-sm font-semibold   text-indigo-200">{selectedUser.role || 'Unknown Role'}</p>
                      <span className={`inline-flex items-center px-3 py-1.5 mt-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(selectedUser.status)}`}>
                        {selectedUser.status || 'unknown'}
                      </span>
                    </div>
                  </div>
                  <button onClick={closeManagePanel} className={`text-sm hover:text-white ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Close</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                  <div className={`p-4 rounded-2xl border bg-black/40 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                    <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Relationship Map</h4>
                    {selectedUser.role === 'student' && (
                      <div className="space-y-2">
                        <p className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Assigned Instructor</p>
                        {selectedUser.assignedInstructor ? (
                          <button onClick={() => openManagePanel(selectedUser.assignedInstructor.id)} className="text-sm font-semibold text-emerald-200 hover:text-emerald-100 transition-colors underline decoration-dashed">
                            {selectedUser.assignedInstructor.name}
                          </button>
                        ) : (
                          <p className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Unassigned</p>
                        )}

                        <p className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Linked Parents</p>
                        <div className="flex flex-wrap gap-2">
                          {(selectedUser.parents || []).length > 0 ?
                            selectedUser.parents.map((parent) => (
                              <button
                                key={parent.id}
                                onClick={() => openManagePanel(parent.id)}
                                className="px-2 py-1 text-xs font-semibold text-[#0B0E14] bg-[#00D4FF] rounded-full hover:bg-cyan-400 transition-colors"
                              >
                                {parent.name}
                              </button>
                            )) : <p className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No parents connected</p>
                          }
                        </div>
                      </div>
                    )}
                    {selectedUser.role === 'instructor' && (
                      <div className="space-y-2">
                        <p className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Active Students</p>
                        <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedUser.assignedStudents?.length || 0}</p>
                      </div>
                    )}
                    {selectedUser.role === 'parent' && (
                      <div className="space-y-2">
                        <p className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Watching Learners</p>
                        {(selectedUser.children || []).length > 0 ?
                          selectedUser.children.map((c) => (
                            <p key={c.id} className="text-sm text-emerald-200">{c.name}</p>
                          )) : <p className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No current children linked</p>
                        }
                      </div>
                    )}
                  </div>

                  <div className={`p-4 rounded-2xl border bg-black/40 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                    <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Activity Matrix (Recent)</h4>
                    <div className="max-h-48 overflow-auto space-y-2">
                      {(selectedUserActivities.length > 0) ? selectedUserActivities.map((activity) => (
                        <div key={activity.id} className="rounded-lg border border-slate-700 bg-slate-900/70 p-2 text-xs">
                          <div className="flex justify-between items-start">
                             <p className={isDarkMode ? 'text-slate-200' : 'text-slate-600'}>{activity.action}</p>
                             {activity.metadata?.ip && <span className={`text-[9px] font-mono tracking-tighter bg-black/50 px-1 rounded ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{activity.metadata.ip}</span>}
                          </div>
                          <p className={`mt-0.5 text-[11px] ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{activity.type || 'action'} • {new Date(activity.createdAt).toLocaleString()} {activity.metadata?.userAgent?.includes('Mobi') ? '📱' : '💻'}</p>
                        </div>
                      )) : <p className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No recent activity recorded.</p>}
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border bg-black/40 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                    <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Extended Insights</h4>
                    <div className="flex flex-col gap-4">
                      <div>
                        <p className={`text-[10px] font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Total courses / Active Classes</p>
                        <p className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{(selectedUser.role === 'student' ? (selectedUser.enrolledCourses || []).filter(en => en.status === 'active') : selectedUser.role === 'instructor' ? (selectedUser.taughtCourses || []).filter(c => c.status === 'approved') : []).length}</p>
                        <div className="flex flex-col gap-1 max-h-24 overflow-auto custom-scrollbar pr-2">
                           {selectedUser.role === 'student' ? (
                              (selectedUser.enrolledCourses || []).filter(en => en.status === 'active').map((en, idx) => (
                                 <div key={idx} className={`flex justify-between items-center bg-black/40 px-2 py-1.5 rounded-lg border ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                                    <span className={`text-xs font-medium truncate mr-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{en.course?.title || 'Unknown Course'}</span>
                                    <span className="text-[9px] text-emerald-400 font-bold shrink-0">Active</span>
                                 </div>
                              ))
                           ) : (selectedUser.role === 'instructor') ? (
                              (selectedUser.taughtCourses || []).filter(c => c.status === 'approved').map((c, idx) => (
                                 <div key={idx} className="flex justify-between items-center bg-black/40 px-2 py-1.5 rounded-lg border border-emerald-500/10">
                                    <span className={`text-xs font-medium truncate mr-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{c.title}</span>
                                    <span className="text-[9px] font-bold shrink-0 text-emerald-400">Active</span>
                                 </div>
                              ))
                           ) : null}
                        </div>
                      </div>
                      
                      {(selectedUser.role === 'student' || selectedUser.role === 'parent' || selectedUser.role === 'instructor') && (
                      <div>
                        <p className={`text-[10px] font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Pending approvals</p>
                        <p className="text-xl font-bold text-rose-300 mb-2">{selectedUser.role === 'instructor' ? (selectedUser.taughtCourses || []).filter(c => c.status === 'pending').length : (selectedUser.enrolledCourses || []).filter((en) => en.status === 'pending').length}</p>
                        <div className="flex flex-col gap-1 max-h-24 overflow-auto custom-scrollbar pr-2">
                           {selectedUser.role === 'student' ? (
                               (selectedUser.enrolledCourses || []).filter(en => en.status === 'pending').map((en, idx) => (
                                 <div key={idx} className="flex justify-between items-center bg-rose-500/100/10 px-2 py-1.5 rounded-lg border border-rose-500/20">
                                    <span className="text-xs text-rose-200 font-medium truncate mr-2">{en.course?.title || 'Unknown Course'}</span>
                                    <span className="text-[9px] text-rose-400 font-bold shrink-0">Pending</span>
                                 </div>
                               ))
                           ) : selectedUser.role === 'instructor' ? (
                              (selectedUser.taughtCourses || []).filter(c => c.status === 'pending').map((c, idx) => (
                                 <div key={idx} className="flex justify-between items-center bg-amber-500/100/10 px-2 py-1.5 rounded-lg border border-amber-500/20">
                                    <span className="text-xs text-amber-200 font-medium truncate mr-2">{c.title}</span>
                                    <span className="text-[9px] font-bold shrink-0 text-amber-400">Needs Review</span>
                                 </div>
                              ))
                           ) : null}
                        </div>
                      </div>
                      )}

                      <div>
                        <p className={`text-[10px] font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Last activity</p>
                        <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{selectedUserActivities[0] ? new Date(selectedUserActivities[0].createdAt).toLocaleString() : 'Never logged in'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl border bg-black/40 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                    <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Performance Snapshot</h4>
                    <div className="flex items-center justify-center mb-3">
                      <RadialBarChart width={200} height={200} cx="50%" cy="50%" innerRadius="62%" outerRadius="100%" barSize={12} data={[{ name: 'Progress', value: selectedUserCompletion, fill: '#00D4FF' }]}>
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar background clockWise dataKey="value" cornerRadius={10} />
                      </RadialBarChart>
                    </div>
                    <p className="text-center text-sm text-emerald-200 font-semibold">Average progress: {selectedUserCompletion}%</p>
                  </div>

                  <div className={`p-4 rounded-2xl border bg-black/40 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                    {(selectedUser.role === 'student') ? (
                      <>
                        <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Student Dossier</h4>
                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-auto">
                          {(selectedUser.enrolledCourses || []).map((en, idx) => {
                            const courseId = en.course?.id || en.course;
                            const courseTitle = en.course?.title || (allCourses.find((c) => c.id === courseId)?.title) || 'Unknown';
                            return (
                              <div key={`${courseId}_${idx}`} className="rounded-lg border border-slate-700 bg-slate-900/70 p-2 flex flex-col gap-2">
                                <div className="flex items-start justify-between gap-3">
                                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{courseTitle}</p>
                                  <button onClick={() => removeEnrollment(courseId)} className="text-[11px] text-rose-300 px-2 py-1 rounded bg-slate-700 hover:bg-slate-600">Remove</button>
                                </div>
                                <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                                  <div style={{ width: `${en.progress || 0}%`, backgroundColor: '#00D4FF' }} className="h-full rounded-full transition-all duration-700" aria-valuenow={en.progress || 0} aria-valuemin="0" aria-valuemax="100" />
                                </div>
                                <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Progress: {en.progress || 0}% • {en.status}</p>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button onClick={() => manualEnrollment(allCourses[0]?.id || '', 'active')} className={`px-3 py-2 bg-blue-600 rounded-lg text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Force Enroll</button>
                          <button onClick={resetUserProgress} className={`px-3 py-2 rounded-lg text-sm bg-[#E67E22] hover:bg-[#CF711F] shadow-md border border-[#E67E22] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Reset Progress</button>
                          {selectedUser.status === 'blocked' ? (
                            <button onClick={async () => { await updateUserStatus(selectedUser.id, 'approved'); await openManagePanel(selectedUser.id); }} className={`px-3 py-2 bg-emerald-600 rounded-lg text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Unblock Service</button>
                          ) : (
                            <button onClick={blockService} className={`px-3 py-2 rounded-lg text-sm bg-[#E67E22] hover:bg-[#CF711F] shadow-md border border-[#E67E22] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Block Service</button>
                          )}
                        </div>
                      </>
                    ) : selectedUser.role === 'instructor' ? (
                      <>
                        <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Instructor Performance</h4>
                        <div className="space-y-2">
                          <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Content Portfolio: {selectedUserCourses.length} courses</p>
                          {(selectedUserCourses.length === 0) ? <p className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No created content yet</p> : selectedUserCourses.map((c) => (
                            <div key={c.id} className="text-xs text-emerald-200 border border-slate-700 p-2 rounded-lg">{c.title} — {(c.status || 'unknown')}</div>
                          ))}
                          <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Student Reach: {selectedUser.assignedStudents?.length || 0}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Admin Feedback Log</p>
                          {(selectedUser.adminFeedback || []).length > 0 ? selectedUser.adminFeedback.map((f, index) => (
                            <p key={index} className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>• {f}</p>
                          )) : <p className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No feedback yet</p>}
                          <button onClick={toggleInstructorAccess} className={`px-3 py-2 rounded-lg text-sm bg-[#E67E22] hover:bg-[#CF711F] shadow-md border border-[#E67E22] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedUser.status === 'approved' ? 'Disable Upload/Edit' : 'Reactivate Instructor'}</button>
                        </div>
                      </>
                    ) : selectedUser.role === 'parent' ? (
                      <>
                        <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Guardian Insight</h4>
                        <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Linked Learners: {((selectedUser.children || []).length)}</p>
                        <div className="space-y-2">
                          {(selectedUser.children || []).length > 0 ?
                            selectedUser.children.map((c) => (
                              <div key={c.id} className="flex items-center justify-between px-2 py-1 bg-slate-800 rounded-lg">
                                <span className="text-xs text-emerald-200">{c.name}</span>
                                <button onClick={() => removeChildFromParent(c.id)} className="text-[10px] px-2 py-1 rounded bg-rose-600 hover:bg-rose-500/100">Remove</button>
                              </div>
                            )) : <p className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No current children linked</p>
                          }
                        </div>
                        <div className="mt-2">
                          <h5 className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Add/Remove Child</h5>
                          <div className="flex gap-2 mt-1">
                            <CustomDropdown 
                              value={selectedChildId} 
                              onChange={setSelectedChildId} 
                              options={filterCandidates().map(child => ({ 
                                label: child.name, 
                                value: child.id,
                                render: (
                                  <div className="flex items-center gap-3 w-full py-0.5">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/100/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-500/30 shadow-sm ">
                                        {child.name ? child.name.charAt(0) : '?'}
                                    </div>
                                    <div className="flex flex-col text-left flex-1 min-w-0">
                                      <span className={`font-bold text-xs truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{child.name}</span>
                                      <span className={`text-[10px] truncate mt-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{child.email}</span>
                                    </div>
                                  </div>
                                )
                              }))}
                              placeholder="Select student"
                              searchable={true}
                              className="flex-1"
                            />
                            <button onClick={() => { if (selectedChildId) addChildToParent(selectedChildId); }} className={`px-2 py-1 bg-blue-600 rounded-lg text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Add</button>
                          </div>
                        </div>
                        <div className="mt-2">
                          <h5 className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Family Activity</h5>
                          <div className="max-h-28 overflow-auto space-y-1 mt-1">
                            {(recentFamilyActivity.length > 0) ? recentFamilyActivity.map((act) => (
                              <p key={act.id} className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{new Date(act.createdAt).toLocaleString()} — {act.action}</p>
                            )) : <p className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No family insights yet</p>}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>General admin user info and can be managed in the profile panel below.</p>
                    )}
                  </div>
                </div>

                <div className={`mt-6 p-4 rounded-2xl border bg-black/40 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Quick Admin Overrides</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                    <div>
                      <label className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Email</label>
                      <input
                        type="email"
                        value={selectedUser.email || ''}
                        onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                        className={`w-full px-3 py-2 text-sm rounded-lg border border-slate-600 bg-black/60 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Role</label>
                      <CustomDropdown
                        value={selectedUser.role || ''}
                        onChange={(val) => setSelectedUser({ ...selectedUser, role: val })}
                        options={[
                          { label: 'Student', value: 'student' },
                          { label: 'Instructor', value: 'instructor' },
                          { label: 'Parent', value: 'parent' },
                          { label: 'Admin', value: 'admin' }
                        ]}
                      />
                    </div>
                    <div>
                      <label className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Password (min 6 chars)</label>
                      <input
                        type="password"
                        value={selectedUserPassword}
                        onChange={(e) => setSelectedUserPassword(e.target.value)}
                        placeholder="New password"
                        className={`w-full px-3 py-2 text-sm rounded-lg border border-slate-600 bg-black/60 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                      />
                    </div>
                    <div>
                      <label className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Account Status</label>
                      <CustomDropdown
                        value={selectedUser.status || ''}
                        onChange={(val) => setSelectedUser({ ...selectedUser, status: val })}
                        options={[
                          { label: 'Pending', value: 'pending' },
                          { label: 'Approved', value: 'approved' },
                          { label: 'Rejected', value: 'rejected' },
                          { label: 'Blocked', value: 'blocked' }
                        ]}
                      />
                    </div>
                  </div>
                </div>

                <div className={`mt-5 p-4 rounded-2xl border bg-black/40 grid grid-cols-1 md:grid-cols-2 gap-3 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  <button onClick={saveUserUpdates} className={`px-4 py-2 rounded-lg font-semibold text-sm bg-[#E67E22] hover:bg-[#CF711F] shadow-md border border-[#E67E22] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Save changes</button>
                  <button onClick={() => deleteAdminUser(selectedUser.id)} className={`px-4 py-2 rounded-lg bg-rose-500/100 font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Delete user</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
