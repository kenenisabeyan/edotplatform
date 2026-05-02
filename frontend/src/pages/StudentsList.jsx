import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import api from '../utils/api';
import { Check, X, ShieldAlert, BadgeCheck, UserPlus, GraduationCap } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';
import CustomDropdown from '../components/CustomDropdown';
import { useAuth } from '../context/AuthContext';

export default function StudentsList() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const rolePrefix = isAdmin ? '/admin' : '/instructor';

  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('approved'); // Default to approved

  const fetchData = React.useCallback(async () => {
    try {
      const [stuRes, instRes] = await Promise.all([
         api.get(`${rolePrefix}/students`),
         isAdmin ? api.get('/admin/instructors') : Promise.resolve({ data: { success: false } })
      ]);
      if (stuRes.data.success) setStudents(stuRes.data.data);
      if (instRes.data.success) setInstructors(instRes.data.data.filter(i => i.status === 'approved' || !i.status));
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, rolePrefix]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  if (loading) return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div></div>;

  const filteredStudents = students.filter(s => s.status === tab || (tab === 'approved' && !s.status));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-display font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{isAdmin ? 'Student Management' : 'My Students'}</h1>
          <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{isAdmin ? 'Approve registrations and assign instructors' : 'View students assigned to your classes'}</p>
        </div>
      </div>

      {isAdmin && (
        <div className={`flex gap-4 border-b pb-2 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
          <button 
            onClick={() => setTab('pending')}
            className={`px-4 py-2 font-bold text-sm rounded-t-lg transition ${tab === 'pending' ? 'text-[#F97316] border-b-2 border-[#F97316]' : 'text-slate-200 hover:text-white'}`}
          >
            Pending Approval ({students.filter(s => s.status === 'pending').length})
          </button>
          <button 
            onClick={() => setTab('approved')}
            className={`px-4 py-2 font-bold text-sm rounded-t-lg transition ${tab === 'approved' ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]' : 'text-slate-200 hover:text-white'}`}
          >
            Approved ({students.filter(s => s.status === 'approved' || !s.status).length})
          </button>
        </div>
      )}

      <div className={`rounded-2xl border backdrop-blur-xl shadow-lg overflow-hidden ${isDarkMode ? 'border-white/5 bg-[#1E293B]/5' : 'border-slate-100 bg-slate-50'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-sm font-semibold ${isDarkMode ? 'bg-[#1E293B]/5 text-slate-200' : 'bg-slate-50 text-slate-600'}`}>
                <th className="p-4">Student</th>
                <th className="p-4">Email</th>
                <th className="p-4">Status</th>
                {isAdmin && <th className="p-4">Instructor Assignment</th>}
                {isAdmin && tab === 'pending' && <th className="p-4">Actions</th>}
              </tr>
            </thead>
            <tbody className={`text-sm font-normal ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {filteredStudents.length === 0 ? (
                <tr>
                   <td colSpan="5" className={`p-8 text-center font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No {tab} students found.</td>
                </tr>
              ) : filteredStudents.map(stu => (
                <tr key={stu.id} className={`border-b hover:bg-[#1E293B]/5 transition ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
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
