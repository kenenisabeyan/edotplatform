import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import api from '../utils/api';
import { Check, X, ShieldAlert, BadgeCheck, UserPlus, GraduationCap } from 'lucide-react';
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

  const students = data.students || [];
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
  }, [instructors]);



  const pendingCount = React.useMemo(() => students.filter(s => s.status === 'pending').length, [students]);
  const approvedCount = React.useMemo(() => students.filter(s => s.status === 'approved' || !s.status).length, [students]);

  const filteredStudents = React.useMemo(() => {
    return students.filter(s => s.status === tab || (tab === 'approved' && !s.status));
  }, [students, tab]);

  return (
    <div className="animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-7xl mx-auto w-full">
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
            className={`px-4 py-2 font-bold text-sm rounded-t-lg transition ${tab === 'pending' ? 'text-[#F97316] border-b-2 border-[#F97316]' : 'text-slate-200 hover:text-white'}`}
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

      <div className={`rounded-2xl border backdrop-blur-xl shadow-lg overflow-hidden ${isDarkMode ? 'border-white/5 bg-[#0B1120]/5' : 'border-slate-100 bg-slate-50'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-sm font-semibold ${isDarkMode ? 'bg-[#0B1120]/5 text-slate-200' : 'bg-slate-50 text-slate-600'}`}>
                <th className="p-4">Student</th>
                <th className="p-4">Email</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Certificates</th>
                {isAdmin && <th className="p-4">Instructor Assignment</th>}
                {isAdmin && tab === 'pending' && <th className="p-4">Actions</th>}
              </tr>
            </thead>
            <tbody className={`text-sm font-normal ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {loading ? (
                <tr>
                   <td colSpan="5" className="p-12 text-center">
                     <div className="w-8 h-8 border-4 border-[#00D4FF]/30 border-t-[#00D4FF] rounded-full animate-spin mx-auto"></div>
                   </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                   <td colSpan="5" className={`p-8 text-center font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No {tab} students found.</td>
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
                        <span className="px-3 py-1 bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 font-bold rounded-full text-xs flex items-center gap-1 w-max"><ShieldAlert className="w-3 h-3"/> Pending</span>
                     ) : (
                        <span className="px-3 py-1 bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 font-bold rounded-full text-xs flex items-center gap-1 w-max"><BadgeCheck className="w-3 h-3"/> Approved</span>
                     )}
                  </td>
                  <td className="p-4 text-center">
                      <div className="flex justify-center items-center">
                        <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full text-xs font-bold shadow-sm ${stu.certificates && stu.certificates.length > 0 ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
                          {stu.certificates ? stu.certificates.length : 0}
                        </span>
                      </div>
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
    </div>
  );
}
