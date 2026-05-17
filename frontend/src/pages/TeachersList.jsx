import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import api from '../utils/api';
import { Check, X, ShieldAlert, BadgeCheck, Users, Search } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';

import { useQuery } from '@tanstack/react-query';

export default function TeachersList() {
  const isDarkMode = useThemeMode();
  const [tab, setTab] = useState('pending'); // 'pending' or 'approved'
  const [expandedId, setExpandedId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  const { data: instructors = [], isLoading: loading, refetch: fetchInstructors } = useQuery({
    queryKey: ['adminInstructors'],
    queryFn: async () => {
      const { data } = await api.get('/admin/instructors', { params: { limit: 200 } });
      return data.success ? data.data : [];
    }
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['adminCoursesList'],
    queryFn: async () => {
      const { data } = await api.get('/admin/courses');
      return data.success ? data.data : [];
    }
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['adminSectionsList'],
    queryFn: async () => {
      const { data } = await api.get('/sections');
      return data.success ? data.data : [];
    }
  });

  const handleAssignCourse = async (instId) => {
    if(!selectedCourse) return;
    try {
      await api.put(`/admin/instructor/${instId}/assign-course`, { courseId: selectedCourse });
      setSelectedCourse('');
      fetchInstructors();
    } catch(err) { console.error('Failed to assign course', err); }
  };

  const handleAssignSection = async (instId) => {
    if(!selectedSection) return;
    try {
      await api.put(`/admin/instructor/${instId}/assign-section`, { sectionId: selectedSection });
      setSelectedSection('');
      fetchInstructors();
    } catch(err) { console.error('Failed to assign section', err); }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/instructor/${id}/approve`);
      fetchInstructors(); // Refresh UI
    } catch (error) {
      console.error('Failed to approve instructor', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/instructor/${id}/reject`);
      fetchInstructors(); // Refresh UI
    } catch (error) {
      console.error('Failed to reject instructor', error);
    }
  };



  const pendingCount = React.useMemo(() => instructors.filter(i => i.status === 'pending').length, [instructors]);
  const approvedCount = React.useMemo(() => instructors.filter(i => i.status === 'approved' || !i.status).length, [instructors]);

  const filteredInstructors = React.useMemo(() => {
    return instructors.filter(i => i.status === tab || (tab === 'approved' && !i.status));
  }, [instructors, tab]);

  return (
    <div className="animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 pt-2 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Users className="w-8 h-8 text-[#00D4FF]" />
            Instructor Management
          </h1>
          <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Approve registrations and manage faculty across all active courses.</p>
        </div>
      </div>

      <div className={`flex gap-4 border-b pb-2 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
        <button 
          onClick={() => setTab('pending')}
          className={`px-4 py-2 font-bold text-sm rounded-t-lg transition ${tab === 'pending' ? 'text-[#F97316] border-b-2 border-[#F97316]' : 'text-slate-200 hover:text-white'}`}
        >
          Pending Approval ({pendingCount})
        </button>
        <button 
          onClick={() => setTab('approved')}
          className={`px-4 py-2 font-bold text-sm rounded-t-lg transition ${tab === 'approved' ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]' : 'text-slate-200 hover:text-white'}`}
        >
          Approved Instructors ({approvedCount})
        </button>
      </div>

      <div className={`rounded-2xl border backdrop-blur-xl shadow-lg overflow-hidden ${isDarkMode ? 'border-white/5 bg-[#0B1120]/5' : 'border-slate-100 bg-slate-50'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-sm font-semibold ${isDarkMode ? 'bg-[#0B1120]/5 text-slate-200' : 'bg-slate-50 text-slate-600'}`}>
                <th className="p-4">Instructor</th>
                <th className="p-4">Email</th>
                <th className="p-4">Assigned Students</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className={`text-sm font-normal ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {loading ? (
                <tr>
                   <td colSpan="5" className="p-12 text-center">
                     <div className="w-8 h-8 border-4 border-[#00D4FF]/30 border-t-[#00D4FF] rounded-full animate-spin mx-auto"></div>
                   </td>
                </tr>
              ) : filteredInstructors.length === 0 ? (
                <tr>
                   <td colSpan="5" className={`p-8 text-center font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No {tab} instructors found.</td>
                </tr>
              ) : filteredInstructors.map(inst => (
                <React.Fragment key={inst.id}>
                <tr className={`border-b hover:bg-white/5/5 transition ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                  <td className={`p-4 flex items-center gap-3 font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <UserAvatar user={inst} className="w-10 h-10 text-sm" />
                    {inst.name}
                  </td>
                  <td className={`p-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{inst.email}</td>
                  <td className="p-4">
                     <span className={`flex items-center gap-2 font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}><Users className={`w-4 h-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} /> {inst.assignedStudents?.length || 0}</span>
                  </td>
                  <td className="p-4">
                     {inst.status === 'pending' ? (
                        <span className="px-3 py-1 bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 font-bold rounded-full text-xs flex items-center gap-1 w-max"><ShieldAlert className="w-3 h-3"/> Pending</span>
                     ) : (
                        <span className="px-3 py-1 bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 font-bold rounded-full text-xs flex items-center gap-1 w-max"><BadgeCheck className="w-3 h-3"/> Approved</span>
                     )}
                  </td>
                  <td className="p-4 flex gap-2">
                    {tab === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(inst.id)} className="p-2 bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 border border-[#00D4FF]/20 rounded-full transition" title="Approve">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleReject(inst.id)} className="p-2 bg-[#E30A17]/10 text-[#E30A17] hover:bg-[#E30A17]/20 border border-[#E30A17]/20 rounded-full transition" title="Reject">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {tab === 'approved' && (
                      <button onClick={() => setExpandedId(expandedId === inst.id ? null : inst.id)} className="px-3 py-1.5 bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 border border-[#00D4FF]/20 rounded-full transition text-xs font-bold whitespace-nowrap">
                        {expandedId === inst.id ? 'Close Detials' : 'View & Assign'}
                      </button>
                    )}
                  </td>
                </tr>
                {expandedId === inst.id && (
                  <tr className={`border-b ${isDarkMode ? 'border-white/5 bg-[#0B1120]/30' : 'border-slate-100 bg-slate-100/50'}`}>
                    <td colSpan="5" className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
                        {/* Students Box */}
                        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'border-white/5 bg-[#0B1120]/50' : 'border-slate-200 bg-white'}`}>
                           <h4 className={`text-xs font-black uppercase mb-3 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                              <Users className="w-4 h-4 text-[#00D4FF]" /> Mentored Students ({inst.assignedStudents?.length || 0})
                           </h4>
                           <div className="max-h-32 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                              {inst.assignedStudents?.length > 0 ? inst.assignedStudents.map(s => (
                                 <div key={s.id} className={`flex items-center gap-3 p-2 rounded-xl border ${isDarkMode ? 'border-white/5 bg-black/40' : 'border-slate-100 bg-slate-50'}`}>
                                    <UserAvatar user={s} className="w-8 h-8 text-[10px]" />
                                    <div className="flex flex-col">
                                       <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{s.name}</span>
                                       <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{s.email}</span>
                                    </div>
                                 </div>
                              )) : <p className={`text-xs italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No students currently mentored.</p>}
                           </div>
                        </div>

                        {/* Courses Box */}
                        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'border-white/5 bg-[#0B1120]/50' : 'border-slate-200 bg-white'}`}>
                           <div>
                              <h4 className={`text-xs font-black uppercase mb-3 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                 <BadgeCheck className="w-4 h-4 text-[#F97316]" /> Managed Courses ({inst.coursesTaught?.length || 0})
                              </h4>
                              <div className="flex flex-wrap gap-2 mb-4">
                                 {inst.coursesTaught?.length > 0 ? inst.coursesTaught.map(c => (
                                    <span key={c.id} className="px-2 py-1 bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 rounded text-[10px] font-bold">
                                       {c.title}
                                    </span>
                                 )) : <span className={`text-[10px] italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No courses yet.</span>}
                              </div>
                           </div>
                           <div className={`pt-3 border-t flex flex-col gap-2 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                              <span className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Assign New Course</span>
                              <div className="flex gap-2">
                                 <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className={`flex-1 text-xs px-3 py-2 border rounded-xl outline-none ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                                    <option value="">Select Course...</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                 </select>
                                 <button onClick={() => handleAssignCourse(inst.id)} disabled={!selectedCourse} className="px-3 py-2 bg-[#F97316] hover:bg-[#ea580c] disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase transition">
                                    Assign
                                 </button>
                              </div>
                           </div>
                        </div>

                        {/* Sections Box */}
                        <div className={`p-4 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'border-white/5 bg-[#0B1120]/50' : 'border-slate-200 bg-white'}`}>
                           <div>
                              <h4 className={`text-xs font-black uppercase mb-3 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                 <ShieldAlert className="w-4 h-4 text-[#00D4FF]" /> Managed Sections ({inst.sectionsTaught?.length || 0})
                              </h4>
                              <div className="flex flex-wrap gap-2 mb-4">
                                 {inst.sectionsTaught?.length > 0 ? inst.sectionsTaught.map(s => (
                                    <span key={s.id} className="px-2 py-1 bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 rounded text-[10px] font-bold">
                                       {s.name} ({s.sectionCode})
                                    </span>
                                 )) : <span className={`text-[10px] italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No sections yet.</span>}
                              </div>
                           </div>
                           <div className={`pt-3 border-t flex flex-col gap-2 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                              <span className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Assign New Section</span>
                              <div className="flex gap-2">
                                 <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className={`flex-1 text-xs px-3 py-2 border rounded-xl outline-none ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                                    <option value="">Select Section...</option>
                                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                 </select>
                                 <button onClick={() => handleAssignSection(inst.id)} disabled={!selectedSection} className="px-3 py-2 bg-[#00D4FF] hover:bg-[#00A3CC] disabled:opacity-50 text-slate-900 rounded-xl text-[10px] font-black uppercase transition">
                                    Assign
                                 </button>
                              </div>
                           </div>
                        </div>

                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
