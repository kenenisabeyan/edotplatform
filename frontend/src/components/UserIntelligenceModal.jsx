import React, { useState, useEffect, useCallback } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import api from '../utils/api';
import UserAvatar from './UserAvatar';
import CustomDropdown from './CustomDropdown';

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
  const [instructorToAssign, setInstructorToAssign] = useState('');

  const fetchUserActivities = useCallback(async (id, role, children) => {
    try {
      const { data } = await api.get('/activity/all');
      const allActivities = Array.isArray(data.data) ? data.data : [];
      const userActivity = allActivities.filter((a) => String(a.user?.id || a.user) === String(id)).slice(0, 40);
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


  const filterCandidates = () => {
    if (!childSearch.trim()) return [];
    const lowercase = childSearch.toLowerCase();
    return globalUsersList.filter(
      (u) => u.role === 'student' && 
      u.name.toLowerCase().includes(lowercase) && 
      !(selectedUser?.children || []).some(c => c.id === u.id)
    );
  };

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
      await fetchUserData(selectedUser.id);
    } catch (err) {
      console.error('Failed to link parent to student', err);
    }
  };
  
  const untieParentFromStudent = async (parentId) => {
    if (!selectedUser || !parentId) return;
    try {
      await api.put(`/admin/users/${parentId}/unlink-child`, { childId: selectedUser.id });
      await fetchUserData(selectedUser.id);
    } catch (err) {
      console.error('Failed to unlink parent from student', err);
    }
  };

  const manualEnrollment = async (courseId, status = 'active') => {
    if (!selectedUser || selectedUser.role !== 'student' || !courseId) return;
    try {
      await api.post('/admin/enrollments/manual', { studentId: selectedUser.id, courseId, status });
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
    if (status === 'approved') return 'bg-emerald-500/100/20 text-emerald-300 border border-emerald-300';
    if (status === 'pending') return 'bg-amber-500/100/20 text-amber-300 border border-amber-300';
    if (status === 'rejected') return 'bg-rose-500/100/20 text-rose-300 border border-rose-300';
    if (status === 'blocked') return 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]';
    return 'bg-[#11151F]/40 backdrop-blur-xl0/20 text-slate-200 border border-slate-400';
  };

  const selectedUserCompletion = selectedUser?.enrolledCourses?.length ?
    Math.round(selectedUser.enrolledCourses.reduce((acc, ec) => acc + (ec.progress || 0), 0) / selectedUser.enrolledCourses.length) : 0;

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="intel-hub-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex justify-center items-start pt-10 overflow-hidden px-4 pb-10"
          onClick={onClose}
        >
          {loading ? (
             <div className="flex justify-center items-center h-64 mt-20" onClick={(e) => e.stopPropagation()}>
               <div className={`w-10 h-10 border-4 border-t-[#FFD700] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
             </div>
          ) : selectedUser ? (
            <motion.div
              initial={{ x: 450, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 450, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 30 }}
              className={`relative w-full max-w-6xl rounded-3xl border border-[#FFD700] p-5 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl max-h-[85vh] overflow-y-auto custom-scrollbar ${isDarkMode ? 'bg-[#11151F]/40' : 'bg-slate-50'}`}
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex justify-between items-start gap-4 mb-6">
              <div className="flex items-center gap-5">
                <div className="flex items-center justify-center shrink-0">
                  <UserAvatar user={selectedUser} className="w-16 h-16 md:w-20 md:h-20 text-3xl shadow-lg border-2 border-[#FFD700]" />
                </div>
                <div>
                  <h3 className={`text-2xl md:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedUser.name}</h3>
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{selectedUser.role || 'Unknown Role'}</p>
                  <span className={`inline-flex items-center px-3 py-1 mt-2 text-[10px] font-bold   rounded-full ${getStatusBadgeClasses(selectedUser.status)}`}>
                    {selectedUser.status || 'unknown'}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-[#E67E22] hover:bg-[#CF711F] shadow-md border border-[#E67E22] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Close Detial</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5 shrink-0">
              {/* Relationship Map */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'border-white/5 bg-[#11151F]/5' : 'border-slate-100 bg-slate-50'}`}>
                <h4 className={`text-xs font-bold mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Relationship Map</h4>
                {selectedUser.role === 'student' && (
                  <div className="space-y-4">
                    <div className="pb-2">
                      <p className={`text-[10px] font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Assigned Instructor</p>
                      {selectedUser.assignedInstructor ? (
                        <span className="text-sm font-semibold text-emerald-300">
                          {selectedUser.assignedInstructor.name}
                        </span>
                      ) : (
                        <p className={`text-sm italic ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Unassigned</p>
                      )}
                    </div>
                    <div className={`pt-2 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                      <p className={`text-[10px] font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Change Instructor</p>
                      <div className="flex gap-2">
                        <CustomDropdown
                          value={instructorToAssign}
                          onChange={setInstructorToAssign}
                          placeholder="Select Instructor..."
                          options={globalUsersList.filter(u => u.role === 'instructor').map(i => ({ label: i.name, value: i.id }))}
                          searchable={true}
                          className="flex-1"
                        />
                        <button onClick={() => updateStudentInstructor(instructorToAssign)} className={`px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500/100 rounded-xl text-[10px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Set</button>
                      </div>
                    </div>
                    <div className={`pt-3 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                      <p className={`text-[10px] font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Linked Parents</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(selectedUser.parents || []).length > 0 ?
                          selectedUser.parents.map((parent) => (
                            <div key={parent.id} className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-[#0B0E14] bg-[#FFD700] rounded-lg shadow-sm">
                              <span>{parent.name}</span>
                              <button onClick={() => untieParentFromStudent(parent.id)} className="ml-1 text-[#0B0E14]/60 hover:text-red-700 text-[10px]  font-black transition-colors">X</button>
                            </div>
                          )) : <p className={`text-sm italic ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>No parents connected</p>
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
                        <button onClick={() => bindParentToStudent(parentToBind)} className={`px-3 py-1.5 bg-blue-600 hover:bg-blue-500/100 rounded-xl text-[10px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Add</button>
                      </div>
                    </div>
                  </div>
                )}
                {selectedUser.role === 'instructor' && (
                  <div className="space-y-2">
                    <p className={`text-[10px] font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Active Students Mentored</p>
                    <p className="text-2xl font-black text-emerald-300">{selectedUser.assignedStudents?.length || 0}</p>
                  </div>
                )}
                {selectedUser.role === 'parent' && (
                  <div className="space-y-3">
                    <p className={`text-[10px] font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Watching Learners</p>
                    {(selectedUser.children || []).length > 0 ?
                      selectedUser.children.map((c) => (
                        <div key={c.id} className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                           <p className="text-sm font-bold text-emerald-200">{c.name}</p>
                        </div>
                      )) : <p className={`text-sm italic ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>No current children linked</p>
                    }
                  </div>
                )}
                {selectedUser.role === 'admin' && (
                  <p className={`text-sm italic ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>System Owner</p>
                )}
              </div>

              {/* Activity Matrix */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'border-white/5 bg-[#11151F]/5' : 'border-slate-100 bg-slate-50'}`}>
                <h4 className={`text-xs font-bold mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Activity Matrix (Recent)</h4>
                <div className="max-h-48 overflow-auto space-y-2 custom-scrollbar pr-2">
                  {(selectedUserActivities.length > 0) ? selectedUserActivities.map((activity) => (
                    <div key={activity.id} className="rounded-xl border border-slate-800 bg-black/40 p-3 text-xs shadow-inner">
                      <div className="flex justify-between items-start">
                         <p className={`font-medium leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{activity.action}</p>
                         {activity.metadata?.ip && <span className={`text-[9px] font-mono tracking-tighter border px-1.5 py-0.5 rounded ${isDarkMode ? 'text-slate-300 bg-[#11151F]/5 border-white/10' : 'text-slate-500 bg-slate-50 border-slate-200'}`}>{activity.metadata.ip}</span>}
                      </div>
                      <p className="text-[#FFD700]/70 mt-1.5 text-[10px] font-bold  ">{activity.type || 'action'} • {new Date(activity.createdAt).toLocaleString()} {activity.metadata?.userAgent && (activity.metadata.userAgent.includes('Mobi') ? '📱' : '💻')}</p>
                    </div>
                  )) : <p className={`text-sm italic ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>No recent activity recorded.</p>}
                </div>
              </div>

              {/* Extended Insights */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'border-white/5 bg-[#11151F]/5' : 'border-slate-100 bg-slate-50'}`}>
                <h4 className={`text-xs font-bold mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Extended Insights</h4>
                <div className="flex flex-col gap-4">
                  <div>
                    <p className={`text-[10px] font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Total courses / Active Classes</p>
                    <p className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{(selectedUser.role === 'student' ? (selectedUser.enrolledCourses || []).filter(en => en.status === 'active') : selectedUser.role === 'instructor' ? (selectedUserCourses || []).filter(c => c.status === 'approved') : selectedUserCourses || []).length}</p>
                    <div className="flex flex-col gap-1 max-h-24 overflow-auto custom-scrollbar pr-2">
                       {selectedUser.role === 'student' ? (
                          (selectedUser.enrolledCourses || []).filter(en => en.status === 'active').map((en, idx) => {
                             const courseId = en.course?.id || en.course;
                             const courseObj = allCourses.find((c) => String(c.id) === String(courseId)) || en.course;
                             const courseTitle = courseObj?.title || 'Unknown Course';
                             const instructorName = courseObj?.instructor?.name || 'Unknown Inst.';
                             return (
                               <div key={idx} className={`flex justify-between items-center bg-black/40 px-2 py-1.5 rounded-lg border ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                                  <span className={`text-xs font-medium truncate mr-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{courseTitle}</span>
                                  <span className="text-[9px] text-emerald-400 font-bold shrink-0">{instructorName}</span>
                               </div>
                             );
                          })
                       ) : (
                          (selectedUser.role === 'instructor' ? (selectedUserCourses || []).filter(c => c.status === 'approved') : selectedUserCourses || []).map((c, idx) => (
                             <div key={idx} className="flex justify-between items-center bg-black/40 px-2 py-1.5 rounded-lg border border-emerald-500/10">
                                <span className={`text-xs font-medium truncate mr-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{c.title}</span>
                                <span className="text-[9px] font-bold shrink-0 text-emerald-400">Active</span>
                             </div>
                          ))
                       )}
                    </div>
                  </div>
                  {(selectedUser.role === 'student' || selectedUser.role === 'parent' || selectedUser.role === 'instructor') && (
                  <div>
                    <p className={`text-[10px] font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Pending approvals</p>
                    <p className="text-xl font-bold text-rose-300 mb-2">{selectedUser.role === 'instructor' ? (selectedUserCourses || []).filter(c => c.status === 'pending').length : (selectedUser.enrolledCourses || []).filter((en) => en.status === 'pending').length}</p>
                    <div className="flex flex-col gap-1 max-h-24 overflow-auto custom-scrollbar pr-2">
                       {selectedUser.role === 'student' ? (
                           (selectedUser.enrolledCourses || []).filter(en => en.status === 'pending').map((en, idx) => {
                             const courseId = en.course?.id || en.course;
                             const courseObj = allCourses.find((c) => String(c.id) === String(courseId)) || en.course;
                             const courseTitle = courseObj?.title || 'Unknown Course';
                             const instructorName = courseObj?.instructor?.name || 'Unknown Inst.';
                             return (
                               <div key={idx} className="flex justify-between items-center bg-rose-500/100/10 px-2 py-1.5 rounded-lg border border-rose-500/20">
                                  <span className="text-xs text-rose-200 font-medium truncate mr-2">{courseTitle}</span>
                                  <span className="text-[9px] text-rose-400 font-bold shrink-0">{instructorName}</span>
                               </div>
                             );
                           })
                       ) : selectedUser.role === 'instructor' ? (
                          (selectedUserCourses || []).filter(c => c.status === 'pending').map((c, idx) => (
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
                    <p className={`text-[10px] font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Last online</p>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{selectedUserActivities[0] ? new Date(selectedUserActivities[0].createdAt).toLocaleString() : 'Never logged in'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5 shrink-0">
              {/* Performance / Completion */}
              <div className={`p-5 rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden ${isDarkMode ? 'border-white/5 bg-[#11151F]/5' : 'border-slate-100 bg-slate-50'}`}>
                <h4 className={`absolute top-5 left-5 text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Performance Snapshot</h4>
                <div className="mt-8 flex items-center justify-center">
                  <RadialBarChart width={180} height={180} cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={10} data={[{ name: 'Progress', value: selectedUserCompletion || 1, fill: '#008A32' }]}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background={{ fill: '#ffffff10' }} clockWise dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedUserCompletion}%</span>
                  </div>
                </div>
                <p className={`text-center mt-3 text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Global Average Progress</p>
              </div>

              {/* Role-Specific Manipulators */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'border-white/5 bg-[#11151F]/5' : 'border-slate-100 bg-slate-50'}`}>
                {(selectedUser.role === 'student') ? (
                  <>
                    <h4 className={`text-xs font-bold mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Student Dossier</h4>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-auto custom-scrollbar pr-2">
                      {(selectedUser.enrolledCourses || []).map((en, idx) => {
                        const courseId = en.course?.id || en.course;
                        const courseTitle = en.course?.title || (allCourses.find((c) => c.id === courseId)?.title) || 'Unknown Course Data';
                        return (
                          <div key={`${courseId}_${idx}`} className="rounded-xl border border-slate-800 bg-black/40 p-3 flex flex-col gap-2 relative group overflow-hidden">
                            <div className="flex items-start justify-between gap-3">
                              <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{courseTitle}</p>
                              <button onClick={() => removeEnrollment(courseId)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-rose-300 font-bold   px-2 py-1 rounded bg-rose-500/100/10 hover:bg-rose-500/100/20">Drop</button>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
                              <div style={{ width: `${en.progress || 0}%`, backgroundColor: '#008A32' }} className="h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(0,138,50,0.8)]" />
                            </div>
                            <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Progress: <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>{en.progress || 0}%</span> • {en.status}</p>
                          </div>
                        );
                      })}
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
                                <div className={`w-9 h-9 rounded-md overflow-hidden shrink-0 bg-slate-800 border shadow-sm ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                                  <img src={c.thumbnail && c.thumbnail !== 'default-course.jpg' && c.thumbnail !== '' ? c.thumbnail : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=100&q=80'} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=100&q=80' }} />
                                </div>
                                <div className="flex flex-col text-left flex-1 min-w-0">
                                  <span className={`font-bold truncate text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{c.title}</span>
                                  <span className={`text-[9px] capitalize flex items-center gap-1.5 mt-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
                                    <span className="px-1.5 py-0.5 bg-[#FFD700]/10 text-[#FFD700] rounded text-[8px] font-black   border border-[#FFD700]/20">{c.category || 'Course'}</span>
                                    <span className="truncate font-medium">{c.level ? `${c.level}` : 'All Levels'} {c.duration ? `• ${c.duration}h` : ''}</span>
                                  </span>
                                </div>
                              </div>
                            )
                          }))}
                          searchable={true}
                          className="flex-1"
                        />
                        <button onClick={() => manualEnrollment(courseToEnroll, 'active')} className="px-4 py-2 font-bold   bg-blue-600/20 text-blue-300 border border-blue-600/30 hover:bg-blue-600/40 rounded-xl text-[10px] transition-colors shrink-0">Force Enroll</button>
                      </div>
                      <div className={`flex flex-wrap gap-2 pt-2 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                        <button onClick={resetUserProgress} className={`px-4 py-2 font-semibold border rounded-xl transition-colors bg-[#E67E22] hover:bg-[#CF711F] shadow-md border-[#E67E22] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Reset Progress</button>
                        {selectedUser.status === 'blocked' ? (
                          <button onClick={async () => await updateUserStatus('approved')} className="px-4 py-2 font-bold   bg-emerald-500/100/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/100/40 rounded-xl text-[10px] transition-colors">Unblock Service</button>
                        ) : (
                          <button onClick={blockService} className={`px-4 py-2 font-semibold border rounded-xl transition-colors bg-[#E67E22] hover:bg-[#CF711F] shadow-md border-[#E67E22] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Block Service</button>
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
                             <span key={c.id} className="text-[11px] font-bold text-emerald-300 bg-emerald-500/100/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">{c.title} — {(c.status || 'unknown')}</span>
                           ))}
                        </div>}
                      </div>

                      <div className={`pt-4 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                        <button onClick={toggleInstructorAccess} className={`w-full py-3 rounded-xl text-xs font-bold   border transition-colors ${selectedUser.status === 'approved' ? 'bg-amber-500/100/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/100/20' : 'bg-emerald-500/100/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/100/20'}`}>
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
                          <div key={c.id} className={`flex items-center justify-between px-4 py-2 bg-black/40 border rounded-xl ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                             <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{c.name}</span>
                             <button onClick={() => removeChildFromParent(c.id)} className="text-[10px] px-3 py-1.5 rounded-md font-bold   bg-rose-600/20 text-rose-300 hover:bg-rose-600/40 transition-colors">Untie</button>
                          </div>
                        )) : <p className={`text-xs italic ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>No learners monitored</p>
                      }
                    </div>

                    <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                      <p className={`text-[10px] font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Bind New Learner</p>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Search student..." 
                          value={childSearch} 
                          onChange={(e) => setChildSearch(e.target.value)} 
                          className={`w-1/3 px-3 py-2 rounded-xl bg-black/60 border text-xs outline-none focus:border-[#FFD700]/50 ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
                        />
                        <CustomDropdown
                          value={selectedChildId}
                          onChange={setSelectedChildId}
                          placeholder="Select matching student..."
                          options={filterCandidates().map(child => ({ label: `${child.name} (${child.email})`, value: child.id }))}
                          className="flex-1"
                        />
                        <button onClick={() => { if(selectedChildId) addChildToParent(selectedChildId); }} className={`px-4 py-2 bg-blue-600 hover:bg-blue-500/100 rounded-xl text-xs font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Bind</button>
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
            <div className={`p-5 rounded-2xl border shrink-0 ${isDarkMode ? 'border-white/5 bg-[#11151F]/5' : 'border-slate-100 bg-slate-50'}`}>
              <h4 className={`text-xs font-bold mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Quick Admin Overrides</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className={`text-[10px] font-bold mb-1 block ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Email Override</label>
                  <input
                    type="email"
                    value={selectedUser.email || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-black/60 focus:border-[#FFD700] outline-none transition-colors ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
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
                    className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-black/60 focus:border-[#FFD700] outline-none transition-colors ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
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
                <button onClick={saveUserUpdates} className={`px-6 py-2.5 rounded-xl font-semibold transition-colors bg-[#E67E22] hover:bg-[#CF711F] shadow-md border border-[#E67E22] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Commit Changes</button>
                <button onClick={deleteAdminUser} className={`px-6 py-2.5 rounded-xl font-semibold transition-colors bg-[#E67E22] hover:bg-[#CF711F] shadow-md border border-[#E67E22] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Purge Data</button>
              </div>
            </div>

          </motion.div>
          ) : (
            <div className={`p-8 text-center bg-black/80 rounded-2xl border mt-20 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`} onClick={(e) => e.stopPropagation()}>
               <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Failed to load user details.</p>
               <button onClick={onClose} className={`mt-4 px-4 py-2 rounded-lg text-sm bg-[#E67E22] hover:bg-[#CF711F] shadow-md border border-[#E67E22] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Close</button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
