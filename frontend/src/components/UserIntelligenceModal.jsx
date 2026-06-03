import React, { useState, useEffect, useCallback } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import api from '../utils/api';
import UserAvatar from './UserAvatar';
import CustomDropdown from './CustomDropdown';
import { Search } from 'lucide-react';
import PremiumModal from './PremiumModal';

export default function UserIntelligenceModal({ userId, isOpen, onClose, onRefreshUsers, globalUsersList = [] }) {
  const isDarkMode = useThemeMode();
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserActivities, setSelectedUserActivities] = useState([]);

  const [selectedUserCourses, setSelectedUserCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [childSearch, setChildSearch] = useState('');
  const [selectedChildId, setSelectedChildId] = useState('');
  const [selectedUserPassword, setSelectedUserPassword] = useState('');
  const [courseToEnroll, setCourseToEnroll] = useState('');
  const [parentToBind, setParentToBind] = useState('');
  const [sponsorToBind, setSponsorToBind] = useState('');
  const [instructorToAssign, setInstructorToAssign] = useState('');

  const fetchUserActivities = useCallback(async (id, role, children) => {
    try {
      const { data } = await api.get(`/activity/all?userId=${id}&limit=100`);
      const userActivity = Array.isArray(data.data) ? data.data : [];
      setSelectedUserActivities(userActivity);

      if (role === 'parent' && children.length > 0) {
      }
    } catch (err) {
      console.error('Failed to fetch user activities', err);
      setSelectedUserActivities([]);
    }
  }, []);

  const fetchUserData = useCallback(async (id, courseList = null) => {
    try {
      const { data } = await api.get(`/admin/users/${id}`);
      const user = data.data;
      setSelectedUser(user);
      setSelectedUserPassword('');

      if (user) {
        await fetchUserActivities(id, user.role, user.children || []);
        if (courseList) {
          const uCourses = courseList.filter((c) => String(c.instructor?.id || c.instructor) === String(id));
          setSelectedUserCourses(uCourses);
        } else {
          setAllCourses(currentCourses => {
            const uCourses = currentCourses.filter((c) => String(c.instructor?.id || c.instructor) === String(id));
            setSelectedUserCourses(uCourses);
            return currentCourses;
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch user data for modal', err);
    }
  }, [fetchUserActivities]);

  useEffect(() => {
    if (!isOpen || !userId) return;
    
    let isMounted = true;
    const fetchRootData = async () => {
      try {
        setLoading(true);
        const coursesRes = await api.get('/admin/courses');
        if (!isMounted) return;
        const fetchedCourses = coursesRes.data.data || [];
        setAllCourses(fetchedCourses);

        await fetchUserData(userId, fetchedCourses);
      } catch (err) {
        console.error('Failed to load root modal data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchRootData();
    return () => { isMounted = false; };
  }, [isOpen, userId, fetchUserData]);


  const filterCandidates = useCallback(() => {
    if (!childSearch.trim()) return [];
    const lowercase = childSearch.toLowerCase();
    return globalUsersList.filter(
      (u) => u.role === 'student' && 
      u.name.toLowerCase().includes(lowercase) && 
      !(selectedUser?.children || []).some(c => c.id === u.id)
    );
  }, [childSearch, globalUsersList, selectedUser]);

  const updateUserStatus = async (status) => {
    if (!selectedUser) return;
    try {
      await api.put(`/admin/users/${selectedUser.id}/status`, { status });
      await fetchUserData(selectedUser.id);
      if (onRefreshUsers) onRefreshUsers();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const saveUserUpdates = async () => {
    if (!selectedUser) return;
    try {
      const payload = {
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        status: selectedUser.status
      };
      if (selectedUserPassword && selectedUserPassword.length >= 6) {
        payload.password = selectedUserPassword;
      }
      await api.put(`/admin/users/${selectedUser.id}`, payload);
      if (onRefreshUsers) onRefreshUsers();
      onClose();
    } catch (err) {
      console.error('Failed to save user updates', err);
    }
  };

  const deleteAdminUser = async () => {
    if (!selectedUser) return;
    if (!window.confirm('Delete user permanently? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${selectedUser.id}`);
      if (onRefreshUsers) onRefreshUsers();
      onClose();
    } catch (err) {
      console.error('Failed to delete user', err);
    }
  };

  const addChildToParent = async (childId) => {
    if (!selectedUser || selectedUser.role !== 'parent' || !childId) return;
    try {
      await api.put(`/admin/users/${selectedUser.id}/link-child`, { childId });
      await fetchUserData(selectedUser.id);
    } catch (err) {
      console.error('Failed to link child', err);
    }
  };

  const removeChildFromParent = async (childId) => {
    if (!selectedUser || selectedUser.role !== 'parent' || !childId) return;
    try {
      await api.put(`/admin/users/${selectedUser.id}/unlink-child`, { childId });
      await fetchUserData(selectedUser.id);
    } catch (err) {
      console.error('Failed to unlink child', err);
    }
  };

  const updateStudentInstructor = async (instructorId) => {
    if (!selectedUser || !instructorId) return;
    try {
      await api.put(`/admin/student/${selectedUser.id}/assign`, { instructorId });
      setInstructorToAssign('');
      await fetchUserData(selectedUser.id);
      if (onRefreshUsers) onRefreshUsers();
    } catch (err) {
      console.error('Failed to assign instructor', err);
    }
  };

  const bindParentToStudent = async (parentId) => {
    if (!selectedUser || !parentId) return;
    try {
      await api.put(`/admin/users/${parentId}/link-child`, { childId: selectedUser.id });
      setParentToBind('');
      await fetchUserData(selectedUser.id);
      if (onRefreshUsers) onRefreshUsers();
    } catch (err) {
      console.error('Failed to link parent to student', err);
    }
  };
  
  const untieParentFromStudent = async (parentId) => {
    if (!selectedUser || !parentId) return;
    try {
      await api.put(`/admin/users/${parentId}/unlink-child`, { childId: selectedUser.id });
      await fetchUserData(selectedUser.id);
      if (onRefreshUsers) onRefreshUsers();
    } catch (err) {
      console.error('Failed to unlink parent from student', err);
    }
  };

  const bindSponsorToStudent = async (sponsorId) => {
    if (!selectedUser || !sponsorId) return;
    try {
      await api.put(`/admin/student/${selectedUser.id}/assign-sponsor`, { sponsorId });
      setSponsorToBind('');
      await fetchUserData(selectedUser.id);
      if (onRefreshUsers) onRefreshUsers();
    } catch (err) {
      console.error('Failed to link sponsor to student', err);
    }
  };

  const untieSponsorFromStudent = async () => {
    if (!selectedUser) return;
    try {
      await api.put(`/admin/student/${selectedUser.id}/assign-sponsor`, { sponsorId: '' });
      await fetchUserData(selectedUser.id);
      if (onRefreshUsers) onRefreshUsers();
    } catch (err) {
      console.error('Failed to unlink sponsor from student', err);
    }
  };

  const manualEnrollment = async (courseId, status = 'active') => {
    if (!selectedUser || selectedUser.role !== 'student' || !courseId) return;
    try {
      await api.post('/admin/enrollments/manual', { studentId: selectedUser.id, courseId, status });
      setCourseToEnroll('');
      await fetchUserData(selectedUser.id);
      if(onRefreshUsers) onRefreshUsers();
    } catch (err) {
      console.error('Failed to set manual enrollment', err);
    }
  };

  const removeEnrollment = async (courseId) => {
    if (!selectedUser || !courseId) return;
    try {
      await api.delete('/admin/enrollments', { data: { studentId: selectedUser.id, courseId } });
      await fetchUserData(selectedUser.id);
      if(onRefreshUsers) onRefreshUsers();
    } catch (err) {
      console.error('Failed to remove enrollment', err);
    }
  };

  const resetUserProgress = async () => {
    if (!selectedUser) return;
    try {
      await api.put(`/admin/users/${selectedUser.id}/reset-progress`);
      await fetchUserData(selectedUser.id);
      if (onRefreshUsers) onRefreshUsers();
    } catch (err) {
      console.error('Failed to reset progress', err);
    }
  };

  const blockService = async () => {
    await updateUserStatus('blocked');
  };

  const toggleInstructorAccess = async () => {
    if (!selectedUser) return;
    const targetStatus = selectedUser.status === 'approved' ? 'rejected' : 'approved';
    await updateUserStatus(targetStatus);
  };

  const getStatusBadgeClasses = (status) => {
    if (status === 'approved') {
      return isDarkMode 
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
        : 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    }
    if (status === 'pending') {
      return isDarkMode 
        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
        : 'bg-amber-50 text-amber-700 border border-amber-200';
    }
    if (status === 'rejected') {
      return isDarkMode 
        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
        : 'bg-rose-50 text-rose-700 border border-rose-200';
    }
    if (status === 'blocked') {
      return isDarkMode 
        ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
        : 'bg-red-50 text-red-700 border border-red-200';
    }
    return isDarkMode 
      ? 'bg-slate-800/60 text-slate-300 border border-slate-700' 
      : 'bg-slate-100 text-slate-600 border border-slate-200';
  };

  const selectedUserCompletion = React.useMemo(() => {
    return selectedUser?.enrolledCourses?.length ? Math.round(selectedUser.enrolledCourses.reduce((acc, ec) => acc + (ec.progress || 0), 0) / selectedUser.enrolledCourses.length) : 0;
  }, [selectedUser]);

  if (!isOpen) return null;

  const getActivityBorderColor = (type) => {
    const t = String(type || '').toLowerCase();
    if (t.includes('join') || t.includes('register') || t.includes('enroll')) return 'border-l-4 border-l-emerald-500';
    if (t.includes('create') || t.includes('publish') || t.includes('add')) return 'border-l-4 border-l-blue-500';
    if (t.includes('login') || t.includes('auth') || t.includes('session')) return 'border-l-4 border-l-amber-500';
    if (t.includes('delete') || t.includes('remove') || t.includes('block') || t.includes('unlink')) return 'border-l-4 border-l-rose-500';
    return 'border-l-4 border-l-[#8B5CF6]';
  };

  const cardStyle = `p-6 rounded-[2.5rem] border backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:scale-[1.01] ${isDarkMode ? 'border-white/5 bg-[#0B1120]/60 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-white/10' : 'border-slate-200/80 bg-white shadow-[0_8px_32px_rgba(31,38,135,0.04)] hover:border-slate-300'}`;

  const modalContent = (
      <PremiumModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[1400px]">
          {loading ? (
             <div className="flex justify-center items-center h-64" onClick={(e) => e.stopPropagation()}>
               <div className={`w-10 h-10 border-4 border-t-[#00D4FF] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
             </div>
          ) : selectedUser ? (
             <div className="flex flex-col w-full max-h-[82vh] min-h-0 pt-3 px-6 pb-6 md:pt-4 md:px-8 md:pb-8 relative">
            {/* Brand Background Decorative Elements */}
            <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-[#00D4FF]/10 to-transparent pointer-events-none z-0"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00D4FF]/20 blur-[80px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#2563EB]/10 blur-[80px] pointer-events-none z-0"></div>

            {/* Sticky Header */}
            <div className="flex justify-between items-center gap-4 mb-3 relative z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center shrink-0 relative">
                  <UserAvatar user={selectedUser} className="w-10 h-10 md:w-12 md:h-12 text-xl shadow-lg border-2 border-white dark:border-[#0B1120] relative z-10" />
                  <div className="absolute inset-0 rounded-full border-2 border-[#00D4FF] scale-110"></div>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-lg md:text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedUser.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-full ${getStatusBadgeClasses(selectedUser.status)}`}>
                      {selectedUser.status || 'unknown'}
                    </span>
                  </div>
                  <p className={`text-[11px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} mt-0.5 capitalize`}>{selectedUser.role || 'Unknown Role'}</p>
                  {selectedUser.learnerGroups && selectedUser.learnerGroups.length > 0 && (
                     <div className="flex flex-wrap gap-1 mt-1">
                        {selectedUser.learnerGroups.map(lg => (
                           <span key={lg.id} className="text-[8px] bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 px-1.5 py-0.5 rounded-full font-bold">
                              {lg.name}
                           </span>
                        ))}
                     </div>
                  )}
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all duration-300 bg-gradient-to-r from-[#00D4FF] to-[#2563EB] text-white hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(0,212,255,0.5)] cursor-pointer"
                style={{ borderRadius: '9999px' }}
              >
                Close Detail
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="relative z-10 overflow-y-auto custom-scrollbar flex-1 w-full min-h-0 pr-1.5 pb-6">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5 shrink-0">
              {/* Relationship Map */}
              <div className={cardStyle}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00D4FF]/5 rounded-bl-full pointer-events-none"></div>
                <h4 className={`text-xs font-black uppercase tracking-wider mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Relationship Map</h4>
                {selectedUser.role === 'student' && (
                  <div className="space-y-4">
                    <div className="pb-2">
                      <p className={`text-[10px] font-black uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Assigned Instructor</p>
                      {selectedUser.assignedInstructor ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white border shadow-[0_4px_12px_rgba(99,102,241,0.2)] hover:scale-[1.02] transition-transform duration-200" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
                          <span>{selectedUser.assignedInstructor.name}</span>
                        </div>
                      ) : (
                        <p className={`text-sm italic font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Unassigned</p>
                      )}
                    </div>
                    <div className={`pt-3 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                      <p className={`text-[10px] font-black uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Change Instructor</p>
                      <div className="flex gap-2">
                        <CustomDropdown
                          value={instructorToAssign}
                          onChange={setInstructorToAssign}
                          placeholder="Select Instructor..."
                          options={globalUsersList.filter(u => u.role === 'instructor').map(i => ({ label: i.name, value: i.id }))}
                          searchable={true}
                          className="flex-1"
                        />
                        <button 
                          onClick={() => updateStudentInstructor(instructorToAssign)} 
                          className="px-4 py-2 text-white text-xs font-black transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] shrink-0 cursor-pointer" 
                          style={{ borderRadius: '9999px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}
                        >
                          Set
                        </button>
                      </div>
                    </div>
                    <div className={`pt-3 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                      <p className={`text-[10px] font-black uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Linked Parents</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(selectedUser.parents || []).length > 0 ?
                          selectedUser.parents.map((parent) => (
                            <div key={parent.id} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white border shadow-[0_4px_12px_rgba(20,184,166,0.2)] hover:scale-[1.02] transition-transform duration-200" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 100%)', borderColor: 'rgba(20, 184, 166, 0.2)' }}>
                              <span>{parent.name}</span>
                              <span role="button" onClick={() => untieParentFromStudent(parent.id)} className="ml-1.5 bg-white/10 hover:bg-white/20 w-4 h-4 inline-flex items-center justify-center rounded-full text-white/80 hover:text-white text-[9px] font-black cursor-pointer transition-colors">×</span>
                            </div>
                          )) : <p className={`text-sm italic font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No parents connected</p>
                        }
                      </div>
                      <div className="flex gap-2">
                        <CustomDropdown
                          value={parentToBind}
                          onChange={setParentToBind}
                          placeholder="Select Parent..."
                          options={globalUsersList.filter(u => u.role === 'parent' && !(selectedUser.parents || []).some(p => String(p.id) === String(u.id))).map(p => ({ label: p.name, value: p.id }))}
                          searchable={true}
                          className="flex-1"
                        />
                        <button 
                          onClick={() => bindParentToStudent(parentToBind)} 
                          className="px-4 py-2 text-white text-xs font-black transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(20,184,166,0.5)] shrink-0 cursor-pointer" 
                          style={{ borderRadius: '9999px', background: 'linear-gradient(135deg, #14b8a6 0%, #10b981 100%)', boxShadow: '0 4px 15px rgba(20, 184, 166, 0.3)' }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    {/* Admin Only - Sponsorship Map */}
                    <div className={`pt-3 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                      <p className={`text-[10px] font-black uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Linked Sponsor (Admin Only)</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(selectedUser.sponsorships || []).length > 0 ?
                          selectedUser.sponsorships.map((sponsorship) => (
                            <div key={sponsorship.id} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white border shadow-[0_4px_12px_rgba(245,158,11,0.2)] hover:scale-[1.02] transition-transform duration-200" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                              <span>{sponsorship.sponsor?.name || 'Anonymous Sponsor'}</span>
                              <span role="button" onClick={() => untieSponsorFromStudent()} className="ml-1.5 bg-white/10 hover:bg-white/20 w-4 h-4 inline-flex items-center justify-center rounded-full text-white/80 hover:text-white text-[9px] font-black cursor-pointer transition-colors">×</span>
                            </div>
                          )) : <p className={`text-sm italic font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No active sponsor</p>
                        }
                      </div>
                      <div className="flex gap-2">
                        <CustomDropdown
                          value={sponsorToBind}
                          onChange={setSponsorToBind}
                          placeholder="Select Sponsor..."
                          options={globalUsersList.filter(u => u.role !== 'student').map(p => ({ label: p.name, value: p.id }))}
                          searchable={true}
                          className="flex-1"
                        />
                        <button 
                          onClick={() => bindSponsorToStudent(sponsorToBind)} 
                          className="px-4 py-2 text-white text-xs font-black transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] shrink-0 cursor-pointer" 
                          style={{ borderRadius: '9999px', background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)' }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {selectedUser.role === 'instructor' && (
                  <div className="space-y-2">
                    <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active Students Mentored</p>
                    <p className="text-3xl font-black text-[#00D4FF]">{selectedUser.assignedStudents?.length || 0}</p>
                  </div>
                )}
                {selectedUser.role === 'parent' && (
                  <div className="space-y-3">
                    <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Watching Learners</p>
                    {(selectedUser.children || []).length > 0 ?
                      selectedUser.children.map((c) => (
                        <div key={c.id} className="flex items-center gap-2">
                           <div className="w-2.5 h-2.5 rounded-full bg-[#00D4FF] animate-pulse"></div>
                           <p className={`text-sm font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{c.name}</p>
                        </div>
                      )) : <p className={`text-sm italic font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No current children linked</p>
                    }
                  </div>
                )}
                {selectedUser.role === 'admin' && (
                  <p className={`text-sm italic font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>System Owner</p>
                )}
              </div>

              {/* Activity Matrix */}
              <div className={cardStyle}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#2563EB]/5 rounded-bl-full pointer-events-none"></div>
                <h4 className={`text-xs font-black uppercase tracking-wider mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Activity Matrix (Recent)</h4>
                <div className="h-[320px] overflow-y-auto space-y-2.5 custom-scrollbar pr-2">
                  {(selectedUserActivities.length > 0) ? selectedUserActivities.map((activity) => {
                    const borderClass = getActivityBorderColor(activity.type || activity.action);
                    return (
                      <div key={activity.id} className={`rounded-2xl border p-3.5 text-xs shadow-inner transition-all duration-300 hover:scale-[1.01] ${borderClass} ${
                        isDarkMode 
                          ? 'border-white/5 bg-[#0B1120] hover:bg-[#0B1120]/80 hover:border-white/10 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]' 
                          : 'border-slate-200/80 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]'
                      }`}>
                        <div className="flex justify-between items-start">
                           <p className={`font-bold leading-relaxed ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{activity.action}</p>
                           {activity.metadata?.ip && <span className={`text-[8px] font-mono tracking-tighter border px-1.5 py-0.5 rounded ${isDarkMode ? 'text-slate-300 bg-[#0B1120] border-white/10' : 'text-slate-500 bg-white border-slate-200'}`}>{activity.metadata.ip}</span>}
                        </div>
                        <p className="text-[#00D4FF] mt-1.5 text-[9px] font-black uppercase">{activity.type || 'action'} • {new Date(activity.createdAt).toLocaleString()} {activity.metadata?.userAgent && (activity.metadata.userAgent.includes('Mobi') ? '📱' : '💻')}</p>
                      </div>
                    );
                  }) : <p className={`text-sm italic font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No recent activity recorded.</p>}
                </div>
              </div>

              {/* Extended Insights */}
              <div className={cardStyle}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00D4FF]/5 rounded-bl-full pointer-events-none"></div>
                <h4 className={`text-xs font-black uppercase tracking-wider mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Extended Insights</h4>
                <div className="flex flex-col gap-4">
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total courses / Active Classes</p>
                    <p className={`text-2xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{(selectedUser.role === 'student' ? (selectedUser.enrolledCourses || []).filter(en => en.status === 'active') : selectedUser.role === 'instructor' ? (selectedUserCourses || []).filter(c => c.status === 'approved') : selectedUserCourses || []).length}</p>
                    <div className="flex flex-col gap-2 max-h-[220px] overflow-auto custom-scrollbar pr-2">
                       {selectedUser.role === 'student' ? (
                          (selectedUser.enrolledCourses || []).filter(en => en.status === 'active').map((en, idx) => {
                             const courseId = en.course?.id || en.course;
                             const courseObj = allCourses.find((c) => String(c.id) === String(courseId)) || en.course;
                             const courseTitle = courseObj?.title || 'Unknown Course';
                             const instructorName = courseObj?.instructor?.name || 'Unknown Inst.';
                             return (
                               <div key={idx} className={`flex justify-between items-center px-3 py-2 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${isDarkMode ? 'bg-[#0F172A]/80 border-white/5 hover:border-white/10 hover:bg-[#1E293B]' : 'bg-slate-100 border-slate-200 hover:border-slate-300 hover:bg-slate-200/50'}`}>
                                  <span className={`text-xs font-black truncate mr-2 ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{courseTitle}</span>
                                  <span className="text-[9px] text-[#00D4FF] font-black uppercase shrink-0">{instructorName}</span>
                               </div>
                             );
                          })
                       ) : (
                          (selectedUser.role === 'instructor' ? (selectedUserCourses || []).filter(c => c.status === 'approved') : selectedUserCourses || []).map((c, idx) => (
                             <div key={idx} className={`flex justify-between items-center px-3 py-2 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${isDarkMode ? 'bg-[#0F172A]/80 border-white/5 hover:border-white/10 hover:bg-[#1E293B]' : 'bg-slate-100 border-slate-200 hover:border-slate-300 hover:bg-slate-200/50'}`}>
                                <span className={`text-xs font-black truncate mr-2 ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{c.title}</span>
                                <span className="text-[9px] font-black shrink-0 text-emerald-400 uppercase">Active</span>
                             </div>
                          ))
                       )}
                    </div>
                  </div>
                  {(selectedUser.role === 'student' || selectedUser.role === 'parent' || selectedUser.role === 'instructor') && (
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Pending approvals</p>
                    <p className="text-2xl font-black text-rose-400 mb-3">{selectedUser.role === 'instructor' ? (selectedUserCourses || []).filter(c => c.status === 'pending').length : (selectedUser.enrolledCourses || []).filter((en) => en.status === 'pending').length}</p>
                    <div className="flex flex-col gap-2 max-h-[220px] overflow-auto custom-scrollbar pr-2">
                       {selectedUser.role === 'student' ? (
                             (selectedUser.enrolledCourses || []).filter(en => en.status === 'pending').map((en, idx) => {
                               const courseId = en.course?.id || en.course;
                               const courseObj = allCourses.find((c) => String(c.id) === String(courseId)) || en.course;
                               const courseTitle = courseObj?.title || 'Unknown Course';
                               const instructorName = courseObj?.instructor?.name || 'Unknown Inst.';
                               return (
                                 <div key={idx} className={`flex justify-between items-center px-3 py-2 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${isDarkMode ? 'bg-rose-950/20 border-rose-500/30 hover:bg-rose-950/40' : 'bg-rose-50 border-rose-200 hover:bg-rose-100/50'}`}>
                                    <span className="text-xs text-rose-400 font-bold truncate mr-2">{courseTitle}</span>
                                    <span className="text-[9px] text-rose-500 font-black uppercase shrink-0">{instructorName}</span>
                                 </div>
                               );
                             })
                         ) : selectedUser.role === 'instructor' ? (
                            (selectedUserCourses || []).filter(c => c.status === 'pending').map((c, idx) => (
                               <div key={idx} className={`flex justify-between items-center px-3 py-2 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${isDarkMode ? 'bg-[#00D4FF]/10 border-[#00D4FF]/30 hover:bg-[#00D4FF]/20' : 'bg-[#e0f7ff] border-[#00D4FF]/20 hover:bg-[#cbefff]'}`}>
                                  <span className="text-xs text-amber-500 font-bold truncate mr-2">{c.title}</span>
                                  <span className="text-[9px] font-black shrink-0 text-amber-500 uppercase">Needs Review</span>
                               </div>
                            ))
                         ) : null}
                    </div>
                  </div>
                  )}

                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Last online</p>
                    <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{selectedUserActivities[0] ? new Date(selectedUserActivities[0].createdAt).toLocaleString() : 'Never logged in'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5 shrink-0">
              {/* Performance / Completion */}
              <div className={cardStyle}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00D4FF]/5 rounded-bl-full pointer-events-none"></div>
                <h4 className={`text-xs font-black uppercase tracking-wider mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Performance Snapshot</h4>
                <div className="mt-8 flex items-center justify-center">
                  <RadialBarChart width={180} height={180} cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={10} data={[{ name: 'Progress', value: selectedUserCompletion || 1, fill: '#00D4FF' }]}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }} clockWise dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]' : 'text-slate-900'}`}>{selectedUserCompletion}%</span>
                  </div>
                </div>
                <p className={`text-center mt-3 text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Global Average Progress</p>
              </div>

              {/* Role-Specific Manipulators */}
              <div className={`${cardStyle} lg:col-span-2`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#2563EB]/5 rounded-bl-full pointer-events-none"></div>
                {(selectedUser.role === 'student') ? (
                  <>
                    <h4 className={`text-xs font-black uppercase tracking-wider mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Student Dossier & Enrollment Analytics</h4>
                    <div className="flex flex-col gap-4 max-h-[300px] overflow-auto custom-scrollbar pr-2">
                      {Object.entries((selectedUser.enrolledCourses || []).reduce((acc, en) => {
                        const courseId = en.course?.id || en.course;
                        const courseObj = allCourses.find((c) => String(c.id) === String(courseId)) || en.course || {};
                        const cat = courseObj.category || 'General';
                        if (!acc[cat]) acc[acc.General ? 'General' : cat] = [];
                        const targetKey = acc[cat] ? cat : 'General';
                        acc[targetKey].push({ en, courseTitle: courseObj.title || 'Unknown Course Data', courseId });
                        return acc;
                      }, {})).map(([category, items]) => (
                        <div key={category} className="mb-4">
                          <h5 className={`text-[10px] uppercase tracking-wider font-black mb-2 ${isDarkMode ? 'text-[#00D4FF]' : 'text-sky-500'}`}>{category} ({items.length})</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {items.map(({ en, courseTitle, courseId }, idx) => (
                              <div key={`${courseId}_${idx}`} className={`rounded-2xl border p-4 flex flex-col gap-2.5 relative group overflow-hidden transition-all duration-300 ${
                                isDarkMode 
                                  ? 'border-white/5 bg-[#0F172A]/80 hover:bg-[#0F172A] hover:border-[#00D4FF]/20 hover:shadow-[0_8px_24px_rgba(0,212,255,0.1)]' 
                                  : 'border-slate-200/80 bg-slate-50 hover:bg-slate-100 hover:border-[#00D4FF]/20 hover:shadow-[0_8px_24px_rgba(31,38,135,0.04)]'
                              }`}>
                                <div className="flex items-start justify-between gap-3">
                                  <p className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{courseTitle}</p>
                                  <button 
                                    onClick={() => removeEnrollment(courseId)} 
                                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-[10px] text-rose-400 font-black px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 hover:scale-105 active:scale-95 cursor-pointer"
                                    style={{ borderRadius: '6px' }}
                                  >
                                    Drop
                                  </button>
                                </div>
                                <div className={`h-2.5 w-full rounded-full overflow-hidden mt-1.5 ${isDarkMode ? 'bg-[#0B1120] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]' : 'bg-slate-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]'}`}>
                                  <div style={{ width: `${en.progress || 0}%`, background: 'linear-gradient(90deg, #00D4FF 0%, #2563EB 100%)' }} className="h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(0,212,255,0.4)]" />
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                  <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Progress: <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>{en.progress || 0}%</span></p>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                    en.status === 'active' 
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                                      : en.status === 'pending'
                                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                      : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                                  }`}>{en.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={`mt-4 flex flex-col gap-3 pt-4 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                      <div className="flex gap-2">
                        <CustomDropdown
                          value={courseToEnroll}
                          onChange={setCourseToEnroll}
                          placeholder="Select course to enroll..."
                          options={allCourses.filter(c => !(selectedUser.enrolledCourses || []).some(ec => String(ec.course?.id || ec.course) === String(c.id))).map(c => ({ 
                            label: c.title, 
                            value: c.id,
                            render: (
                              <div className="flex items-center gap-3 w-full py-0.5">
                                <div className={`w-9 h-9 rounded-md overflow-hidden shrink-0 bg-[#0B1120] border shadow-sm ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                                  <img src={c.thumbnail && c.thumbnail !== 'default-course.jpg' && c.thumbnail !== '' ? c.thumbnail : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=100&q=80'} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=100&q=80' }} />
                                </div>
                                <div className="flex flex-col text-left flex-1 min-w-0">
                                  <span className={`font-bold truncate text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{c.title}</span>
                                  <span className={`text-[9px] capitalize flex items-center gap-1.5 mt-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
                                    <span className="px-1.5 py-0.5 bg-[#00D4FF]/10 text-[#00D4FF] rounded text-[8px] font-black border border-[#00D4FF]/20">{c.category || 'Course'}</span>
                                    <span className="truncate font-medium">{c.level ? `${c.level}` : 'All Levels'} {c.duration ? `• ${c.duration}h` : ''}</span>
                                  </span>
                                </div>
                              </div>
                            )
                          }))}
                          searchable={true}
                          className="flex-1"
                        />
                        <button 
                          onClick={() => manualEnrollment(courseToEnroll, 'active')} 
                          className="px-4 py-2 font-black uppercase bg-blue-600/20 text-[#2563EB] dark:text-blue-300 border border-blue-600/30 hover:bg-blue-600/40 text-[10px] transition-all duration-300 hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                          style={{ borderRadius: '9999px' }}
                        >
                          Force Enroll
                        </button>
                      </div>
                      <div className={`flex flex-wrap gap-2 pt-2 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                        <button 
                          onClick={resetUserProgress} 
                          className="px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border border-[#00D4FF] text-white hover:scale-105 active:scale-95 hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] cursor-pointer"
                          style={{ borderRadius: '9999px' }}
                        >
                          Reset Progress
                        </button>
                        {selectedUser.status === 'blocked' ? (
                          <button 
                            onClick={async () => await updateUserStatus('approved')} 
                            className="px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:scale-105 active:scale-95 cursor-pointer"
                            style={{ borderRadius: '9999px' }}
                          >
                            Unblock Service
                          </button>
                        ) : (
                          <button 
                            onClick={blockService} 
                            className="px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 hover:scale-105 active:scale-95 cursor-pointer"
                            style={{ borderRadius: '9999px' }}
                          >
                            Block Service
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                ) : selectedUser.role === 'instructor' ? (
                  <>
                    <h4 className={`text-xs font-bold mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Instructor Performance</h4>
                    <div className="space-y-4">
                      <div>
                        <p className={`text-[10px] font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Content Portfolio</p>
                        {(selectedUserCourses.length === 0) ? <p className={`text-xs italic ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No created content yet</p> : 
                        <div className="flex flex-wrap gap-2">
                           {selectedUserCourses.map((c) => (
                             <span key={c.id} className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${
                               c.status === 'approved'
                                 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                 : c.status === 'pending'
                                 ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
                                 : 'text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20'
                             }`} style={{ borderRadius: '8px' }}>
                               {c.title} <span className="text-[9px] font-black uppercase ml-1">({c.status || 'unknown'})</span>
                             </span>
                           ))}
                        </div>}
                      </div>

                      <div className={`pt-4 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                        <button 
                          onClick={toggleInstructorAccess} 
                          className={`w-full py-3 text-xs font-black uppercase tracking-wider border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                            selectedUser.status === 'approved' 
                              ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20' 
                              : 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                          style={{ borderRadius: '9999px' }}
                        >
                          {selectedUser.status === 'approved' ? 'Disable System Upload Access' : 'Reactivate Instructor Access'}
                        </button>
                      </div>
                    </div>
                  </>
                ) : selectedUser.role === 'parent' ? (
                  <>
                    <h4 className={`text-xs font-bold mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Guardian Insight Management</h4>
                    
                    <div className="space-y-3 max-h-32 overflow-auto custom-scrollbar">
                      {(selectedUser.children || []).length > 0 ?
                        selectedUser.children.map((c) => (
                          <div key={c.id} className={`flex items-center justify-between px-4 py-2 border rounded-xl transition-all duration-300 hover:scale-[1.01] ${isDarkMode ? 'border-white/5 bg-[#0F172A]/80 hover:border-white/10' : 'border-slate-200 bg-slate-50 hover:border-slate-350'}`}>
                             <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{c.name}</span>
                             <button 
                               onClick={() => removeChildFromParent(c.id)} 
                               className="text-[10px] px-3 py-1.5 font-black uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                               style={{ borderRadius: '9999px' }}
                             >
                               Untie
                             </button>
                          </div>
                        )) : <p className={`text-xs italic ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>No learners monitored</p>
                      }
                    </div>

                    <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                      <p className={`text-[10px] font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Bind New Learner</p>
                      <div className="flex gap-2">
                        <div className="relative w-1/3">
                          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ml-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                          <input 
                            type="text" 
                            placeholder="Search student..." 
                            value={childSearch} 
                            onChange={(e) => setChildSearch(e.target.value)} 
                            className={`w-full !pl-11 !pr-4 !py-2 border text-xs outline-none focus:border-[#00D4FF]/50 transition-all duration-200 ${isDarkMode ? 'border-white/10 bg-[#0B1120] text-white focus:bg-[#0F172A]' : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white'}`}
                            style={{ borderRadius: '9999px' }}
                          />
                        </div>
                        <CustomDropdown
                          value={selectedChildId}
                          onChange={setSelectedChildId}
                          placeholder="Select matching student..."
                          options={filterCandidates().map(child => ({ label: `${child.name} (${child.email})`, value: child.id }))}
                          className="flex-1"
                        />
                        <button 
                          onClick={() => { if(selectedChildId) addChildToParent(selectedChildId); }} 
                          className="px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#2563EB] text-white hover:shadow-lg text-xs font-black transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_4px_15px_rgba(0,212,255,0.4)] shrink-0 cursor-pointer"
                          style={{ borderRadius: '9999px' }}
                        >
                          Bind
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-50">
                     <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>System Admin specific functionality is restricted.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Overrides block */}
            <div className={cardStyle}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00D4FF]/5 rounded-bl-full pointer-events-none"></div>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Quick Admin Overrides</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className={`text-[10px] font-bold mb-1 block ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Name Override</label>
                  <input
                    type="text"
                    value={selectedUser.name || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                    className={`w-full px-4 py-2.5 text-sm border outline-none transition-all duration-200 focus:ring-2 focus:ring-[#00D4FF]/25 focus:border-[#00D4FF] ${isDarkMode ? 'border-white/10 bg-[#0B1120] text-white focus:bg-[#0F172A]' : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white'}`}
                    style={{ borderRadius: '12px' }}
                  />
                </div>
                <div>
                  <label className={`text-[10px] font-bold mb-1 block ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Email Override</label>
                  <input
                    type="email"
                    value={selectedUser.email || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    className={`w-full px-4 py-2.5 text-sm border outline-none transition-all duration-200 focus:ring-2 focus:ring-[#00D4FF]/25 focus:border-[#00D4FF] ${isDarkMode ? 'border-white/10 bg-[#0B1120] text-white focus:bg-[#0F172A]' : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white'}`}
                    style={{ borderRadius: '12px' }}
                  />
                </div>
                <div>
                  <label className={`text-[10px] font-bold mb-1 block ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Role Override</label>
                  <CustomDropdown
                    value={selectedUser.role || ''}
                    onChange={(val) => setSelectedUser({ ...selectedUser, role: val })}
                    options={[
                      { label: 'Student', value: 'student' },
                      { label: 'Instructor', value: 'instructor' },
                      { label: 'Parent', value: 'parent' },
                      { label: 'Admin', value: 'admin' }
                    ]}
                    placeholder="Role Override"
                  />
                </div>
                <div>
                  <label className={`text-[10px] font-bold mb-1 block ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Force Reset Password</label>
                  <input
                    type="text"
                    value={selectedUserPassword}
                    onChange={(e) => setSelectedUserPassword(e.target.value)}
                    placeholder="New password (min 6)"
                    className={`w-full px-4 py-2.5 text-sm border outline-none transition-all duration-200 focus:ring-2 focus:ring-[#00D4FF]/25 focus:border-[#00D4FF] ${isDarkMode ? 'border-white/10 bg-[#0B1120] text-white focus:bg-[#0F172A]' : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white'}`}
                    style={{ borderRadius: '12px' }}
                  />
                </div>
                <div>
                  <label className={`text-[10px] font-bold mb-1 block ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Status Force</label>
                  <CustomDropdown
                    value={selectedUser.status || ''}
                    onChange={(val) => setSelectedUser({ ...selectedUser, status: val })}
                    options={[
                      { label: 'Pending', value: 'pending' },
                      { label: 'Approved', value: 'approved' },
                      { label: 'Rejected', value: 'rejected' },
                      { label: 'Blocked', value: 'blocked' }
                    ]}
                    placeholder="Status Force"
                  />
                </div>
              </div>
              <div className={`mt-5 pt-5 border-t flex justify-between items-center gap-3 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                <button 
                  onClick={saveUserUpdates} 
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 bg-gradient-to-r from-[#00D4FF] to-[#2563EB] hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] text-white hover:scale-105 active:scale-95 hover:shadow-[0_0_25px_rgba(0,212,255,0.5)] cursor-pointer"
                  style={{ borderRadius: '9999px' }}
                >
                  Commit Changes
                </button>
                <button 
                  onClick={deleteAdminUser} 
                  className="px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 hover:scale-105 active:scale-95 cursor-pointer"
                  style={{ borderRadius: '9999px' }}
                >
                  Purge Data
                </button>
              </div>
            </div>

            </div>
            </div>
          ) : (
            <div className={`p-8 text-center bg-black/80 rounded-2xl border mt-20 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`} onClick={(e) => e.stopPropagation()}>
               <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Failed to load user details.</p>
               <button 
                 onClick={onClose} 
                 className="mt-4 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all bg-gradient-to-r from-[#00D4FF] to-[#2563EB] hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] text-white"
               >
                 Close
               </button>
            </div>
          )}
      </PremiumModal>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
