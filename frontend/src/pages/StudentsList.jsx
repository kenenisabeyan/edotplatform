import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import api from '../utils/api';
import { Check, X, ShieldAlert, BadgeCheck, UserPlus, GraduationCap, History } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';
import CustomDropdown from '../components/CustomDropdown';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';

export default function StudentsList() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const rolePrefix = isAdmin ? '/admin' : '/instructor';

  const [tab, setTab] = useState('approved'); // Default to approved
  const [selectedStudentHistory, setSelectedStudentHistory] = useState(null);
  
  // Advanced Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('');

  const { data: reportsData = [] } = useQuery({
    queryKey: ['attendanceReports'],
    queryFn: async () => {
       const res = await api.get('/attendance/reports');
       return res.data.data || [];
    }
  });

  const getStudentReports = (studentId) => {
      return reportsData.filter(rep => rep.studentRecords?.some(r => r.studentId === studentId)).map(rep => {
          const rec = rep.studentRecords.find(r => r.studentId === studentId);
          return {
              courseTitle: rep.course?.title || 'Unknown Course',
              term: rep.term,
              attendancePercentage: rec.attendancePercentage,
              remarks: rec.remarks
          };
      });
  };

  const { data = {}, isLoading: loading, refetch: fetchData } = useQuery({
    queryKey: ['adminStudentsAndInstructors', isAdmin, rolePrefix],
    queryFn: async () => {
      const [stuRes, instRes] = await Promise.all([
         api.get(`${rolePrefix}/students`),
         isAdmin ? api.get('/admin/instructors') : Promise.resolve({ data: { success: false } })
      ]);
      return {
        students: stuRes.data.success ? stuRes.data.data : [],
        instructors: instRes.data.success ? instRes.data.data.filter(i => i.status === 'approved' || !i.status) : []
      };
    }
  });

  const students = (data.students || []).filter(stu => stu.id !== user?.id && stu.role === 'student');
  const instructors = data.instructors || [];

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/student/${id}/approve`);
      fetchData(); // Refresh UI
    } catch (error) {
      console.error('Failed to approve student', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/student/${id}/reject`);
      fetchData(); // Refresh UI
    } catch (error) {
      console.error('Failed to reject student', error);
    }
  };

  const handleAssign = async (studentId, instructorId) => {
    if (!instructorId) return;
    try {
       await api.put(`/admin/student/${studentId}/assign`, { instructorId });
       fetchData(); // Refresh UI to show the new assignedInstructor
    } catch (error) {
       console.error('Failed to assign student', error);
    }
  };

  const instructorOptions = React.useMemo(() => {
    return instructors.map(inst => ({
      label: inst.name,
      value: inst.id,
      render: (
        <div className="flex items-center gap-3 w-full py-0.5">
          <div className="w-8 h-8 rounded-full bg-[#00D4FF]/20 text-[#00D4FF] flex items-center justify-center font-bold text-xs shrink-0 border border-[#00D4FF]/30 shadow-sm ">
            {inst.name.charAt(0)}
          </div>
          <div className="flex flex-col text-left flex-1 min-w-0">
            <span className={`font-bold text-xs truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{inst.name}</span>
            <span className={`text-[10px] truncate mt-0.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{inst.email}</span>
          </div>
        </div>
      )
    }));
  }, [instructors, isDarkMode]);

  const pendingCount = React.useMemo(() => students.filter(s => s.status === 'pending').length, [students]);
  const approvedCount = React.useMemo(() => students.filter(s => s.status === 'approved' || !s.status).length, [students]);

  const filteredStudents = React.useMemo(() => {
    return students.filter(s => {
      // Role status match
      const matchesTab = s.status === tab || (tab === 'approved' && !s.status);
      if (!matchesTab) return false;

      // Text search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = s.name?.toLowerCase().includes(query);
        const matchesEmail = s.email?.toLowerCase().includes(query);
        const matchesInst = s.assignedInstructor?.name?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesInst) return false;
      }

      // Batch filter match
      if (batchFilter) {
        if (s.batch !== batchFilter) return false;
      }

      // Section filter match
      if (sectionFilter) {
        if (s.section !== sectionFilter) return false;
      }

      // Instructor filter match
      if (instructorFilter) {
        if (s.assignedInstructor?.id !== instructorFilter) return false;
      }

      return true;
    });
  }, [students, tab, searchQuery, batchFilter, sectionFilter, instructorFilter]);

  return (
    <div className="animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-none w-full">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 pt-2 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <GraduationCap className="w-8 h-8 text-[#00D4FF]" />
            {isAdmin ? 'Student Management' : 'My Students'}
          </h1>
          <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{isAdmin ? 'Approve registrations and assign instructors' : 'View students assigned to your classes'}</p>
        </div>
      </div>

      {isAdmin && (
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
            Approved ({approvedCount})
          </button>
        </div>
      )}

      {/* Modern Advanced Filter Panel */}
      <div className={`p-5 rounded-3xl border backdrop-blur-xl flex flex-col md:flex-row gap-4 items-center ${isDarkMode ? 'bg-[#0B1120]/40 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search student name, email, or instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-5 pr-5 py-2.5 border rounded-full text-xs font-semibold focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none transition-all ${
              isDarkMode 
                ? 'bg-[#0B1120] border-white/10 text-white placeholder-slate-400 focus:border-[#00D4FF]' 
                : 'bg-white border-slate-200 text-slate-800 placeholder-slate-500 focus:border-[#00D4FF]'
            }`}
          />
        </div>
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          {/* Batch Selector */}
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className={`px-4 py-2.5 border rounded-full text-xs font-semibold focus:outline-none cursor-pointer ${
              isDarkMode ? 'bg-[#0B1120] border-white/10 text-slate-200 focus:border-[#00D4FF]' : 'bg-white border-slate-200 text-slate-700 focus:border-[#00D4FF]'
            }`}
          >
            <option value="">All Batches</option>
            <option value="2026">Batch 2026</option>
            <option value="2027">Batch 2027</option>
            <option value="2028">Batch 2028</option>
          </select>

          {/* Section Selector */}
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className={`px-4 py-2.5 border rounded-full text-xs font-semibold focus:outline-none cursor-pointer ${
              isDarkMode ? 'bg-[#0B1120] border-white/10 text-slate-200 focus:border-[#00D4FF]' : 'bg-white border-slate-200 text-slate-700 focus:border-[#00D4FF]'
            }`}
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>

          {/* Instructor Selector */}
          {isAdmin && (
            <select
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
              className={`px-4 py-2.5 border rounded-full text-xs font-semibold focus:outline-none cursor-pointer ${
                isDarkMode ? 'bg-[#0B1120] border-white/10 text-slate-200 focus:border-[#00D4FF]' : 'bg-white border-slate-200 text-slate-700 focus:border-[#00D4FF]'
              }`}
            >
              <option value="">All Instructors</option>
              {instructors.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          )}

          {/* Reset Filters */}
          {(searchQuery || batchFilter || sectionFilter || instructorFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setBatchFilter('');
                setSectionFilter('');
                setInstructorFilter('');
              }}
              className="px-4 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold rounded-full transition-all border border-red-500/20 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className={`rounded-2xl border backdrop-blur-xl shadow-lg overflow-hidden ${isDarkMode ? 'border-white/5 bg-[#0B1120]/5' : 'border-slate-100 bg-slate-50'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-sm font-semibold ${isDarkMode ? 'bg-[#0B1120]/5 text-slate-200' : 'bg-slate-50 text-slate-600'}`}>
                <th className="p-4">Student</th>
                <th className="p-4">Email</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Certificates</th>
                <th className="p-4 text-center">Attendance</th>
                {isAdmin && <th className="p-4">Instructor Assignment</th>}
                {isAdmin && tab === 'pending' && <th className="p-4">Actions</th>}
              </tr>
            </thead>
            <tbody className={`text-sm font-normal ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {loading ? (
                <tr>
                   <td colSpan="7" className="p-12 text-center">
                     <div className="w-8 h-8 border-4 border-[#00D4FF]/30 border-t-[#00D4FF] rounded-full animate-spin mx-auto"></div>
                   </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                   <td colSpan="7" className={`p-8 text-center font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No {tab} students found.</td>
                </tr>
              ) : filteredStudents.map(stu => (
                <tr key={stu.id} className={`border-b hover:bg-white/5/5 transition ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                  <td className={`p-4 flex items-center gap-3 font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <UserAvatar user={stu} className="w-10 h-10 text-sm" />
                    {stu.name}
                  </td>
                  <td className={`p-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{stu.email}</td>
                  <td className="p-4">
                     {stu.status === 'pending' ? (
                        <span className="px-3 py-1 bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 font-bold rounded-full text-xs flex items-center gap-1 w-max"><ShieldAlert className="w-3 h-3"/> Pending</span>
                     ) : (
                        <span className="px-3 py-1 bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 font-bold rounded-full text-xs flex items-center gap-1 w-max"><BadgeCheck className="w-3 h-3"/> Approved</span>
                     )}
                  </td>
                  <td className="p-4 text-center">
                      <div className="flex justify-center items-center">
                        <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full text-xs font-bold shadow-sm ${stu.certificates && stu.certificates.length > 0 ? 'bg-orange-100 text-orange-600 dark:bg-[#00D4FF]/20 dark:text-orange-400 border border-orange-200 dark:border-[#00D4FF]/30' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
                          {stu.certificates ? stu.certificates.length : 0}
                        </span>
                      </div>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => setSelectedStudentHistory({ student: stu, reports: getStudentReports(stu.id) })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${isDarkMode ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20 hover:bg-[#00D4FF]/20' : 'bg-blue-50 text-[#2563EB] border-blue-200 hover:bg-blue-100'}`}
                    >
                      View History
                    </button>
                  </td>
                  {isAdmin && (
                    <td className="p-4">
                      {tab === 'approved' ? (
                        <div className="flex items-center gap-2">
                          <CustomDropdown
                             value={stu.assignedInstructor?.id || ''}
                             onChange={(val) => handleAssign(stu.id, val)}
                             options={instructorOptions}
                             placeholder="Assign Instructor..."
                             searchable={true}
                          />
                        </div>
                      ) : (
                        <span className={`italic text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Approve first to assign</span>
                      )}
                    </td>
                  )}
                  {isAdmin && tab === 'pending' && (
                    <td className="p-4 flex gap-2">
                      <button onClick={() => handleApprove(stu.id)} className="p-2 bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 border border-[#00D4FF]/20 rounded-lg transition" title="Approve">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleReject(stu.id)} className="p-2 bg-[#E30A17]/10 text-[#E30A17] hover:bg-[#E30A17]/20 border border-[#E30A17]/20 rounded-lg transition" title="Reject">
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStudentHistory && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-[#0B1120] border-white/10' : 'bg-white border-slate-200'}`}>
               <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
                  <h3 className={`text-xl font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                     <History className="w-5 h-5 text-[#00D4FF]" />
                     Attendance History - {selectedStudentHistory.student.name}
                  </h3>
                  <button onClick={() => setSelectedStudentHistory(null)} className={`hover:text-red-500 transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                     <X className="w-5 h-5" />
                  </button>
               </div>
               <div className="p-6 max-h-[60vh] overflow-y-auto">
                  {selectedStudentHistory.reports.length === 0 ? (
                     <div className={`p-8 text-center font-bold italic rounded-xl ${isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                        No attendance history on record.
                     </div>
                  ) : (
                     <div className="space-y-4">
                        {selectedStudentHistory.reports.map((rep, idx) => (
                           <div key={idx} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                              <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{rep.courseTitle}</h4>
                                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{rep.term}</p>
                                 </div>
                                 <span className={`px-2.5 py-1 rounded-full text-xs font-black ${rep.attendancePercentage >= 75 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                    {rep.attendancePercentage}%
                                 </span>
                              </div>
                              {rep.remarks && (
                                 <p className={`text-xs italic mt-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>"{rep.remarks}"</p>
                              )}
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
