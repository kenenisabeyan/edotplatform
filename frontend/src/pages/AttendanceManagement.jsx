import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Save, UserCheck, ShieldAlert, GraduationCap, CheckCircle2, XCircle, Clock } from 'lucide-react';
import CustomDropdown from '../components/CustomDropdown';
import AttendanceAnalytics from '../components/AttendanceAnalytics';

export default function AttendanceManagement() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  
  const [date, setDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [studentsList, setStudentsList] = useState([]);
  const [instructorsList, setInstructorsList] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const endpoint = user?.role === 'admin' ? '/admin/courses' : '/instructor/courses';
        const { data } = await api.get(endpoint);
        setCourses(data.data || []);
      } catch (err) {
        console.error('Failed to fetch courses', err);
      }
    };
    if (user) fetchCourses();
  }, [user]);

  useEffect(() => {
    setSelectedSection('');
    setSections([]);
    if (!selectedCourse) return;
    const fetchSections = async () => {
      try {
        const { data } = await api.get(`/sections?courseId=${selectedCourse}`);
        setSections(data.data || []);
      } catch (err) {
        console.error('Failed to fetch sections', err);
      }
    };
    fetchSections();
  }, [selectedCourse]);

  useEffect(() => {
    if (!selectedCourse || !selectedSection || !date) {
       setAttendanceRecords([]);
       setStudentsList([]);
       setInstructorsList([]);
       return;
    }
    
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const targetSection = sections.find(s => s.id === selectedSection);
        if (!targetSection) {
            setLoading(false);
            return;
        }

        const sectionName = targetSection.name;
        const [usersRes, attendanceRes] = await Promise.all([
          api.get(`/attendance/users?courseId=${selectedCourse}&section=${sectionName}`),
          api.get(`/attendance?courseId=${selectedCourse}&section=${sectionName}&date=${date}`)
        ]);

        const fetchedStudents = usersRes.data?.students || [];
        const fetchedInstructors = usersRes.data?.instructors || [];
        
        setStudentsList(fetchedStudents);
        setInstructorsList(fetchedInstructors);

        const existingDoc = attendanceRes.data?.data;
        
        let initialRecords = [];
        
        if (existingDoc && existingDoc.records && existingDoc.records.length > 0) {
            initialRecords = existingDoc.records.map(r => ({
               userId: r.user?.id || r.user,
               name: r.user?.name || 'Unknown',
               role: r.role,
               status: r.status // 'present', 'absent', 'late'
            }));
        } else {
            initialRecords = [
               ...fetchedInstructors.map(i => ({ userId: i.userId, name: i.name, role: i.role, status: 'present' })),
               ...fetchedStudents.map(s => ({ userId: s.userId, name: s.name, role: s.role, status: 'present' }))
            ];
        }
        
        setAttendanceRecords(initialRecords);

      } catch (err) {
        console.error('Failed to resolve dynamic attendance payload', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [selectedCourse, selectedSection, date, sections, refreshKey]);

  const handleStatusChange = (userId, newStatus) => {
    setAttendanceRecords(prev => prev.map(record => 
       record.userId === userId ? { ...record, status: newStatus } : record
    ));
  };

  const handleSave = async () => {
    if (!selectedCourse || !selectedSection || !date || attendanceRecords.length === 0) return;
    setSaving(true);
    setMessage('');
    
    try {
      const targetSection = sections.find(s => s.id === selectedSection);
      
      await api.post('/attendance', {
         courseId: selectedCourse,
         section: targetSection.name,
         date: new Date(date),
         records: attendanceRecords
      });

      setMessage('Attendance successfully synced to the system!');
      setRefreshKey(prev => prev + 1);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to commit attendance records.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const renderUserCards = (usersArray, listRole) => {
     if (!usersArray || usersArray.length === 0) {
         return <div className={`py-4 px-2 italic text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>No {listRole}s found for this course section.</div>
     }
     
     return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {usersArray.map(userItem => {
              const currentRecord = attendanceRecords.find(r => r.userId === userItem.userId);
              const currentStatus = currentRecord ? currentRecord.status : 'present';

              return (
                 <div key={userItem.userId} className={`flex flex-col border p-4 rounded-3xl backdrop-blur-md transition-all duration-300 shadow-md ${isDarkMode ? 'bg-[#0B1120]/5 border-white/5' : 'bg-white border-slate-200'} ${
                    currentStatus === 'present' ? 'border-b-4 border-b-[#00D4FF]' : 
                    currentStatus === 'late' ? 'border-b-4 border-b-[#F97316]' : 
                    'border-b-4 border-b-[#E30A17]'
                 }`}>
                    <div className="flex items-center gap-3 mb-4">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm
                          ${listRole === 'Instructor' ? 'bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/30' : 'bg-[#0B1120]/10 text-white border border-white/20'}
                       `}>
                          {userItem.name.charAt(0).toUpperCase()}
                       </div>
                       <div>
                          <p className={`font-bold truncate pr-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{userItem.name}</p>
                          <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{userItem.role}</p>
                       </div>
                    </div>
                    
                    <div className={`flex rounded-xl p-1 gap-1 w-full mt-auto border ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        <label className={`flex-1 flex justify-center items-center gap-1.5 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                           currentStatus === 'present' ? 'bg-[#00D4FF]/20 text-[#00D4FF] shadow-[0_0_10px_rgba(0,138,50,0.3)]' : (isDarkMode ? 'text-slate-300 hover:bg-white/5/5 hover:text-slate-300' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700')
                        }`}>
                           <input 
                              type="radio" 
                              name={`status-${userItem.userId}`} 
                              value="present" 
                              className="hidden"
                              checked={currentStatus === 'present'} 
                              onChange={() => handleStatusChange(userItem.userId, 'present')} 
                           />
                           <CheckCircle2 className="w-4 h-4" />
                           <span className="text-xs font-black ">Present</span>
                        </label>

                        <label className={`flex-1 flex justify-center items-center gap-1.5 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                           currentStatus === 'late' ? 'bg-[#F97316]/20 text-[#F97316] shadow-[0_0_10px_rgba(249,115,22,0.3)]' : (isDarkMode ? 'text-slate-300 hover:bg-white/5/5 hover:text-slate-300' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700')
                        }`}>
                           <input 
                              type="radio" 
                              name={`status-${userItem.userId}`} 
                              value="late" 
                              className="hidden"
                              checked={currentStatus === 'late'} 
                              onChange={() => handleStatusChange(userItem.userId, 'late')} 
                           />
                           <Clock className="w-4 h-4" />
                           <span className="text-xs font-black ">Late</span>
                        </label>

                        <label className={`flex-1 flex justify-center items-center gap-1.5 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                           currentStatus === 'absent' ? 'bg-[#E30A17]/20 text-[#E30A17] shadow-[0_0_10px_rgba(227,10,23,0.3)]' : (isDarkMode ? 'text-slate-300 hover:bg-white/5/5 hover:text-slate-300' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700')
                        }`}>
                           <input 
                              type="radio" 
                              name={`status-${userItem.userId}`} 
                              value="absent" 
                              className="hidden"
                              checked={currentStatus === 'absent'} 
                              onChange={() => handleStatusChange(userItem.userId, 'absent')} 
                           />
                           <XCircle className="w-4 h-4" />
                           <span className="text-xs font-black ">Absent</span>
                        </label>
                    </div>
                 </div>
              );
           })}
        </div>
     );
  };

  return (
    <div className="animate-in fade-in flex flex-col space-y-8 min-h-screen p-6 md:p-10 max-w-7xl mx-auto w-full">
      
      {/* Analytics Dashboard */}
      {user && (user.role === 'admin' || user.role === 'instructor') && (
        <AttendanceAnalytics />
      )}

      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 pt-2 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
             <UserCheck className="w-8 h-8 text-[#00D4FF]"/>
             Roster Status
          </h1>
          <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Dynamically register course attendance for students & instructors.</p>
        </div>
        
        {message && (
          <div className="px-6 py-2.5 rounded-2xl font-bold text-sm bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#00D4FF] shadow-lg animate-in slide-in-from-right">
             {message}
          </div>
        )}
      </div>

      <div className={`backdrop-blur-xl p-8 rounded-3xl border shadow-2xl flex flex-col md:flex-row gap-6 mt-4 relative overflow-hidden ${isDarkMode ? 'bg-[#0B1120]/70 border-white/10' : 'bg-white border-slate-200'}`}>
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#F97316]/5 blur-[120px] rounded-full pointer-events-none"></div>
         
         <div className="w-full md:w-[40%]">
            <label className={`block text-xs font-bold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Target Course</label>
            <CustomDropdown
               value={selectedCourse}
               onChange={setSelectedCourse}
               options={courses.map(c => ({ 
                 label: c.title, 
                 value: c.id,
                 render: (
                    <div className="flex items-center gap-3 w-full py-1">
                       <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{c.title}</span>
                    </div>
                 )
               }))}
               placeholder="-- Choose a course --"
               searchable={true}
            />
         </div>
         
         <div className="w-full md:w-[30%]">
            <label className={`block text-xs font-bold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Designated Section</label>
            <CustomDropdown
               value={selectedSection}
               onChange={setSelectedSection}
               options={sections.map(s => ({
                 label: s.name,
                 value: s.id,
                 render: (
                    <div className="py-1">
                       <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{s.name}</span>
                    </div>
                 )
               }))}
               placeholder="-- Group --"
               searchable={false}
               disabled={!selectedCourse || sections.length === 0}
            />
         </div>

         <div className="w-full md:w-[30%]">
            <label className={`block text-xs font-bold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Roll Call Date</label>
            <div className="relative">
              <input 
                 type="date" 
                 value={date}
                 onChange={(e) => setDate(e.target.value)}
                 className={`w-full pl-12 pr-4 py-3 border rounded-xl text-sm font-bold focus:outline-none focus:border-[#F97316] transition-colors ${isDarkMode ? 'bg-black/40 border-white/10 text-white hover:bg-black/60' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'}`}
              />
              <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-[#F97316]" />
            </div>
         </div>
      </div>

      {!selectedCourse || !selectedSection ? (
         <div className="flex-1 flex flex-col items-center justify-center opacity-40 py-24">
            <UserCheck className={`w-20 h-20 mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
            <h3 className={`text-2xl font-bold font-display ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Awaiting Scope</h3>
            <p className={`mt-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Connect a course and section to load the user roster</p>
         </div>
      ) : loading ? (
         <div className="flex-1 flex justify-center items-center py-20">
            <div className={`w-12 h-12 border-4 border-t-[#F97316] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
         </div>
      ) : attendanceRecords.length === 0 ? (
         <div className="flex-1 flex flex-col items-center justify-center opacity-40 py-24">
            <UserCheck className={`w-20 h-20 mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
            <h3 className={`text-2xl font-bold font-display ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Empty Roster</h3>
            <p className={`mt-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>There are currently no users enrolled in this section.</p>
         </div>
      ) : (
         <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-700 pb-12">
            
            {/* Instructors Row */}
            <div>
               <h2 className={`text-xl font-display font-black mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <ShieldAlert className="w-5 h-5 text-[#00D4FF]" />
                  Instructors Roster
                  <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${isDarkMode ? 'bg-[#0B1120]/20 text-white' : 'bg-slate-100 text-slate-900'}`}>{instructorsList.length}</span>
               </h2>
               {renderUserCards(instructorsList, 'Instructor')}
            </div>

            {/* Students Row */}
            <div>
               <h2 className={`text-xl font-display font-black mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <GraduationCap className="w-5 h-5 text-[#00D4FF]" />
                  Students Roster
                  <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${isDarkMode ? 'bg-[#0B1120]/20 text-white' : 'bg-slate-100 text-slate-900'}`}>{studentsList.length}</span>
               </h2>
               {renderUserCards(studentsList, 'Student')}
            </div>

            {/* Action Bar */}
            <div className="sticky bottom-6 flex justify-end z-40">
               <button 
                  onClick={handleSave}
                  disabled={saving}
                  className={`hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] hover:-translate-y-1 px-10 py-4 rounded-full font-semibold transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-3 bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border border-[#00D4FF] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
               >
                  {saving ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
                  {saving ? 'Syncing...' : 'Commit Daily Log'}
               </button>
            </div>
         </div>
      )}
    </div>
  );
}
