import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import api from '../utils/api';
import { Check, X, ShieldAlert, BadgeCheck, Users, Search } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';

import { useQuery } from '@tanstack/react-query';

export default function TeachersList() {
  const isDarkMode = useThemeMode();
  const [tab, setTab] = useState('pending'); // 'pending' or 'approved'
  const [selectedInstructorId, setSelectedInstructorId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  const [selectedCourseCat, setSelectedCourseCat] = useState('');
  const [selectedStudentCourseId, setSelectedStudentCourseId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSectionCourseId, setSelectedSectionCourseId] = useState('');

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

  const { data: students = [] } = useQuery({
    queryKey: ['adminStudentsList'],
    queryFn: async () => {
      const { data } = await api.get('/admin/students');
      return data.success ? data.data : [];
    }
  });

  const { data: learnerGroups = [] } = useQuery({
    queryKey: ['adminLearnerGroups'],
    queryFn: async () => {
      const { data } = await api.get('/sections/groups');
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

  const handleAssignStudent = async (instId) => {
    if(!selectedStudent) return;
    try {
      await api.put(`/admin/student/${selectedStudent}/assign`, { instructorId: instId });
      setSelectedStudent('');
      fetchInstructors();
    } catch(err) { console.error('Failed to assign student', err); }
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
          className={`px-4 py-2 font-bold text-sm rounded-t-lg transition ${tab === 'pending' ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]' : 'text-slate-200 hover:text-white'}`}
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
                        <span className="px-3 py-1 bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 font-bold rounded-full text-xs flex items-center gap-1 w-max"><ShieldAlert className="w-3 h-3"/> Pending</span>
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
                      <button onClick={() => setSelectedInstructorId(inst.id)} className="px-3 py-1.5 bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 border border-[#00D4FF]/20 rounded-full transition text-xs font-bold whitespace-nowrap">
                        View & Assign
                      </button>
                    )}
                  </td>
                </tr>
              </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedInstructorId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedInstructorId(null)}></div>
          <div className={`relative w-full max-w-6xl rounded-[2rem] border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#0B1120] border-white/10' : 'bg-white border-slate-200'}`}>
            {(() => {
              const inst = instructors.find(i => i.id === selectedInstructorId);
              if (!inst) return null;
              return (
                <>
                  <div className={`p-8 border-b flex justify-between items-center ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
                     <div className="flex items-center gap-5">
                       <UserAvatar user={inst} className="w-16 h-16 text-2xl shadow-sm" />
                       <div>
                         <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{inst.name}</h2>
                         <p className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{inst.email}</p>
                       </div>
                     </div>
                     <button onClick={() => setSelectedInstructorId(null)} className={`p-3 rounded-full hover:bg-slate-100 transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-900'}`}>
                       <X className="w-6 h-6" />
                     </button>
                  </div>
                  
                  <div className={`p-8 overflow-y-auto custom-scrollbar ${isDarkMode ? 'bg-[#0B1120]' : 'bg-slate-50/50'}`}>
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {(() => {
                           const instructorCourseIds = inst.coursesTaught?.map(c => c.id) || [];
                           const availableStudents = students.filter(s => s.enrollments?.some(en => instructorCourseIds.includes(en.courseId)));
                           const availableSections = sections.filter(s => instructorCourseIds.includes(s.courseId));
                           
                           const groupedStudents = availableStudents.reduce((acc, s) => {
                              const enrolledCourseId = s.enrollments?.find(e => instructorCourseIds.includes(e.courseId))?.courseId;
                              const cTitle = courses.find(c => c.id === enrolledCourseId)?.title || 'Other Courses';
                              if(!acc[cTitle]) acc[cTitle] = [];
                              acc[cTitle].push(s);
                              return acc;
                           }, {});

                           const groupedSections = availableSections.reduce((acc, sec) => {
                              const cTitle = courses.find(c => c.id === sec.courseId)?.title || 'Unknown Course';
                              if(!acc[cTitle]) acc[cTitle] = [];
                              acc[cTitle].push(sec);
                              return acc;
                           }, {});

                           return (
                              <>
                                 {/* Courses Box */}
                        <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${isDarkMode ? 'border-white/5 bg-[#111827]' : 'border-slate-200 bg-white'}`}>
                           <div>
                              <h4 className={`text-sm font-bold uppercase tracking-wider mb-5 flex items-center gap-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                 <BadgeCheck className="w-5 h-5 text-[#00D4FF]" /> Managed Courses ({inst.coursesTaught?.length || 0})
                              </h4>
                              <div className="flex flex-wrap gap-2 mb-6">
                                 {inst.coursesTaught?.length > 0 ? inst.coursesTaught.map(c => (
                                    <span key={c.id} className="px-3 py-1.5 bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 rounded-xl text-xs font-bold">
                                       {c.title}
                                    </span>
                                 )) : <p className={`text-sm italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No courses yet.</p>}
                              </div>
                           </div>
                           <div className={`pt-5 border-t flex flex-col gap-3 ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
                              <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Assign New Course</span>
                              <div className="flex flex-col gap-3">
                                 <select value={selectedCourseCat} onChange={e => { setSelectedCourseCat(e.target.value); setSelectedCourse(''); }} className={`w-full text-sm px-4 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-[#00D4FF]/50 transition-all ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                                    <option value="">1. Select Category...</option>
                                    {learnerGroups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                                    <option value="Uncategorized">Uncategorized</option>
                                 </select>
                                 <div className="flex gap-2 items-center">
                                    <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} disabled={!selectedCourseCat} className={`flex-1 min-w-0 text-sm px-4 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-[#00D4FF]/50 transition-all ${isDarkMode ? 'bg-black/40 border-white/10 text-white disabled:opacity-50' : 'bg-slate-50 border-slate-200 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400'}`}>
                                       <option value="">2. Select Course...</option>
                                       {courses.filter(c => selectedCourseCat === 'Uncategorized' ? (!c.mainCategory || c.mainCategory === 'Uncategorized') : c.mainCategory === selectedCourseCat).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                    </select>
                                    <button onClick={() => handleAssignCourse(inst.id)} disabled={!selectedCourse} className="px-5 py-3 bg-[#00D4FF] hover:bg-[#ea580c] disabled:opacity-50 disabled:hover:translate-y-0 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 rounded-full text-sm font-bold transition-all">
                                       Assign
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Students Box */}
                        <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${isDarkMode ? 'border-white/5 bg-[#111827]' : 'border-slate-200 bg-white'}`}>
                           <div>
                              <h4 className={`text-sm font-bold uppercase tracking-wider mb-5 flex items-center gap-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                 <Users className="w-5 h-5 text-[#00D4FF]" /> Mentored Students ({inst.assignedStudents?.length || 0})
                              </h4>
                              <div className="max-h-40 overflow-y-auto custom-scrollbar flex flex-col gap-3 mb-6 pr-2">
                                 {inst.assignedStudents?.length > 0 ? inst.assignedStudents.map(s => (
                                    <div key={s.id} className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors hover:border-[#00D4FF]/30 ${isDarkMode ? 'border-white/5 bg-black/40' : 'border-slate-100 bg-slate-50/80'}`}>
                                       <UserAvatar user={s} className="w-10 h-10 text-xs" />
                                       <div className="flex flex-col min-w-0">
                                          <span className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{s.name}</span>
                                          <div className="flex items-center gap-2">
                                             <span className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{s.email}</span>
                                             {s.sectionsJoined?.length > 0 && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#8B5CF6]/10 text-[#8B5CF6]">
                                                   {s.sectionsJoined.map(sec => sec.name).join(', ')}
                                                </span>
                                             )}
                                          </div>
                                       </div>
                                    </div>
                                 )) : <p className={`text-sm italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No students currently mentored.</p>}
                              </div>
                           </div>
                           <div className={`pt-5 border-t flex flex-col gap-3 ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
                              <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Assign New Student</span>
                              <div className="flex flex-col gap-3">
                                 <div className="flex gap-2 items-center">
                                    <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} disabled={availableStudents.length === 0} className={`flex-1 min-w-0 text-sm px-4 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-[#00D4FF]/50 transition-all ${isDarkMode ? 'bg-black/40 border-white/10 text-white disabled:opacity-50' : 'bg-slate-50 border-slate-200 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400'}`}>
                                       <option value="">Select Student...</option>
                                       {Object.entries(groupedStudents).map(([cTitle, stus]) => (
                                          <optgroup key={cTitle} label={cTitle}>
                                             {stus.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                          </optgroup>
                                       ))}
                                    </select>
                                    <button onClick={() => handleAssignStudent(inst.id)} disabled={!selectedStudent} className="px-5 py-3 bg-[#00D4FF] hover:bg-[#00b8e6] disabled:opacity-50 disabled:hover:translate-y-0 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 rounded-full text-sm font-bold transition-all">
                                       Assign
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Sections Box */}
                        <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${isDarkMode ? 'border-white/5 bg-[#111827]' : 'border-slate-200 bg-white'}`}>
                           <div>
                              <h4 className={`text-sm font-bold uppercase tracking-wider mb-5 flex items-center gap-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                 <ShieldAlert className="w-5 h-5 text-[#8B5CF6]" /> Managed Sections ({inst.sectionsTaught?.length || 0})
                              </h4>
                              <div className="flex flex-wrap gap-2 mb-6">
                                 {inst.sectionsTaught?.length > 0 ? inst.sectionsTaught.map(s => (
                                    <span key={s.id} className="px-3 py-1.5 bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 rounded-xl text-xs font-bold">
                                       {s.name} ({s.sectionCode})
                                    </span>
                                 )) : <p className={`text-sm italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No sections yet.</p>}
                              </div>
                           </div>
                           <div className={`pt-5 border-t flex flex-col gap-3 ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
                              <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Assign New Section</span>
                              <div className="flex flex-col gap-3">
                                 <div className="flex gap-2 items-center">
                                    <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={availableSections.length === 0} className={`flex-1 min-w-0 text-sm px-4 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 transition-all ${isDarkMode ? 'bg-black/40 border-white/10 text-white disabled:opacity-50' : 'bg-slate-50 border-slate-200 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400'}`}>
                                       <option value="">Select Section...</option>
                                       {Object.entries(groupedSections).map(([cTitle, secs]) => (
                                          <optgroup key={cTitle} label={cTitle}>
                                             {secs.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} {s.group ? `(${s.group.name})` : ''}</option>
                                             ))}
                                          </optgroup>
                                       ))}
                                    </select>
                                    <button onClick={() => handleAssignSection(inst.id)} disabled={!selectedSection} className="px-5 py-3 bg-[#8B5CF6] hover:bg-[#7c3aed] disabled:opacity-50 disabled:hover:translate-y-0 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 rounded-full text-sm font-bold transition-all">
                                       Assign
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                              </>
                           );
                        })()}
                     </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
