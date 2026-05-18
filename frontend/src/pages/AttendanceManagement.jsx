import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Save, UserCheck, ShieldAlert, GraduationCap, CheckCircle2, XCircle, Clock, Download, FileText, History } from 'lucide-react';
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
  const [adminStudentEditMode, setAdminStudentEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('daily');
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (activeTab === 'history' && selectedSection) {
       const fetchHistory = async () => {
          setLoadingHistory(true);
          try {
             const targetSection = sections.find(s => s.id === selectedSection);
             const { data } = await api.get(`/attendance/section/${targetSection.id}`);
             setHistoryRecords(data.data || []);
          } catch(err) {
             console.error('Failed to fetch history', err);
          } finally {
             setLoadingHistory(false);
          }
       };
       fetchHistory();
    }
  }, [activeTab, selectedSection, sections, refreshKey]);

  const exportHistoryCSV = () => {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Date,Course,Section,Name,Role,Status\n";
      const targetCourseObj = courses.find(c => c.id === selectedCourse);
      const courseName = targetCourseObj ? targetCourseObj.title : 'Course';
      const targetSectionObj = sections.find(s => s.id === selectedSection);
      const sectionName = targetSectionObj ? targetSectionObj.name : 'Section';

      historyRecords.forEach(att => {
          const dateStr = new Date(att.date).toLocaleDateString();
          const recs = att.records || [];
          recs.forEach(r => {
             const userName = r.user?.name || 'Unknown';
             const role = r.role || 'Unknown';
             const status = r.status || 'Unknown';
             csvContent += `"${dateStr}","${courseName}","${sectionName}","${userName}","${role}","${status}"\n`;
          });
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Attendance_${courseName}_${sectionName}.csv`.replace(/\s+/g, '_'));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

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

  const renderUserCards = (usersArray, listRole, isReadOnly = false) => {
     if (!usersArray || usersArray.length === 0) {
         return <div className={`py-4 px-2 italic text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>No {listRole}s found for this course section.</div>
     }
     
     return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
           {usersArray.map(userItem => {
              const currentRecord = attendanceRecords.find(r => r.userId === userItem.userId);
              const currentStatus = currentRecord ? currentRecord.status : 'present';

              return (
                 <div key={userItem.userId} className={`group flex flex-col border p-5 rounded-[2rem] backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl ${isDarkMode ? 'bg-gradient-to-br from-[#0B1120]/60 to-[#0f172a]/60 border-white/5' : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'} ${
                    currentStatus === 'present' ? 'border-b-4 border-b-[#00D4FF] shadow-[0_10px_30px_rgba(0,212,255,0.08)] hover:shadow-[0_15px_40px_rgba(0,212,255,0.15)]' : 
                    currentStatus === 'late' ? 'border-b-4 border-b-[#F97316] shadow-[0_10px_30px_rgba(249,115,22,0.08)] hover:shadow-[0_15px_40px_rgba(249,115,22,0.15)]' : 
                    'border-b-4 border-b-[#E30A17] shadow-[0_10px_30px_rgba(227,10,23,0.08)] hover:shadow-[0_15px_40px_rgba(227,10,23,0.15)]'
                 }`}>
                    <div className="flex items-center gap-4 mb-5">
                       <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-inner
                          ${listRole === 'Instructor' ? 'bg-gradient-to-tr from-[#00D4FF]/20 to-[#2563EB]/20 text-[#00D4FF] border border-[#00D4FF]/40' : 'bg-gradient-to-tr from-[#0B1120]/10 to-[#1e293b]/10 text-slate-400 border border-slate-400/20'}
                       `}>
                          {userItem.name.charAt(0).toUpperCase()}
                          {/* Animated status dot on avatar */}
                          <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 ${isDarkMode ? 'border-[#0B1120]' : 'border-white'} ${
                             currentStatus === 'present' ? 'bg-[#00D4FF] shadow-[0_0_8px_rgba(0,212,255,0.8)]' :
                             currentStatus === 'late' ? 'bg-[#F97316] shadow-[0_0_8px_rgba(249,115,22,0.8)]' :
                             'bg-[#E30A17] shadow-[0_0_8px_rgba(227,10,23,0.8)]'
                          }`}></span>
                       </div>
                       <div className="flex-1 overflow-hidden">
                          <p className={`font-extrabold truncate text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{userItem.name}</p>
                          <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{userItem.role}</p>
                       </div>
                    </div>
                    
                    <div className={`flex rounded-2xl p-1.5 gap-1.5 w-full mt-auto border transition-colors ${isDarkMode ? 'bg-black/50 border-white/5' : 'bg-slate-100/80 border-slate-200'} ${isReadOnly ? 'opacity-60 pointer-events-none' : ''}`}>
                        <label className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
                           currentStatus === 'present' ? 'bg-[#00D4FF]/20 text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.2)]' : (isDarkMode ? 'text-slate-400 hover:bg-white/5 hover:text-slate-300' : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-800')
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
                           <span className="text-[11px] font-black uppercase tracking-wider">Present</span>
                        </label>

                        <label className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
                           currentStatus === 'late' ? 'bg-[#F97316]/20 text-[#F97316] shadow-[0_0_15px_rgba(249,115,22,0.2)]' : (isDarkMode ? 'text-slate-400 hover:bg-white/5 hover:text-slate-300' : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-800')
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
                           <span className="text-[11px] font-black uppercase tracking-wider">Late</span>
                        </label>

                        <label className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
                           currentStatus === 'absent' ? 'bg-[#E30A17]/20 text-[#E30A17] shadow-[0_0_15px_rgba(227,10,23,0.2)]' : (isDarkMode ? 'text-slate-400 hover:bg-white/5 hover:text-slate-300' : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-800')
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
                           <span className="text-[11px] font-black uppercase tracking-wider">Absent</span>
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

      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 mt-4 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
             <div className="p-2.5 bg-gradient-to-tr from-[#00D4FF]/20 to-[#2563EB]/20 rounded-2xl border border-[#00D4FF]/30">
               <UserCheck className="w-8 h-8 text-[#00D4FF] drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]"/>
             </div>
             Roster Status
          </h1>
          <p className={`text-sm mt-3 font-medium flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
             <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse"></span>
             Dynamically register course attendance for students & instructors.
          </p>
        </div>
        
        {message && (
          <div className="px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#00D4FF]/10 to-[#2563EB]/10 border border-[#00D4FF]/30 text-[#00D4FF] shadow-[0_0_20px_rgba(0,212,255,0.15)] animate-in slide-in-from-right flex items-center gap-2">
             <CheckCircle2 className="w-5 h-5" />
             {message}
          </div>
        )}
      </div>

      <div className={`p-8 !rounded-[2.5rem] border shadow-2xl flex flex-col md:flex-row gap-8 relative overflow-hidden transition-all duration-500 ${isDarkMode ? 'bg-[#0B1120]/80 border-white/10 hover:border-[#00D4FF]/30 hover:shadow-[0_0_40px_rgba(0,212,255,0.05)]' : 'bg-white border-slate-200 hover:border-[#2563EB]/30 hover:shadow-xl'}`}>
         {/* Background ambient glows */}
         <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#00D4FF]/10 blur-[100px] rounded-full pointer-events-none"></div>
         <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#2563EB]/10 blur-[100px] rounded-full pointer-events-none"></div>
         
         <div className="w-full md:w-2/5 relative z-10">
            <label className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
               <ShieldAlert className="w-4 h-4 text-[#00D4FF]" /> Target Course
            </label>
            <div className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00D4FF] to-[#2563EB] rounded-2xl opacity-0 group-hover:opacity-30 transition duration-300 blur-sm pointer-events-none"></div>
               <div className="relative">
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
                     placeholder="-- Select a Scope --"
                     searchable={true}
                  />
               </div>
            </div>
         </div>
         
         <div className="w-full md:w-[30%] relative z-10">
            <label className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
               <GraduationCap className="w-4 h-4 text-[#00D4FF]" /> Designated Section
            </label>
            <div className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00D4FF] to-[#2563EB] rounded-2xl opacity-0 group-hover:opacity-30 transition duration-300 blur-sm pointer-events-none"></div>
               <div className="relative">
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
                     placeholder="-- Cohort Group --"
                     searchable={false}
                     disabled={!selectedCourse || sections.length === 0}
                  />
               </div>
            </div>
         </div>

         <div className="w-full md:w-[30%] relative z-10">
            <label className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
               <Calendar className="w-4 h-4 text-[#00D4FF]" /> Roll Call Date
            </label>
            <div className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00D4FF] to-[#2563EB] rounded-full opacity-0 group-hover:opacity-30 transition duration-300 blur-sm pointer-events-none"></div>
               <div className="relative">
                 <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={activeTab === 'history'}
                    className={`w-full !pl-14 pr-4 py-3.5 border !rounded-full text-sm font-bold focus:outline-none focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 transition-all shadow-sm ${activeTab === 'history' ? 'opacity-50 cursor-not-allowed' : ''} ${isDarkMode ? 'bg-black/60 border-white/10 text-white hover:bg-black/80' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'}`}
                 />
                 <Calendar className={`absolute left-5 top-4 w-4 h-4 ${activeTab === 'history' ? 'text-slate-500' : 'text-[#00D4FF]'}`} />
               </div>
            </div>
         </div>
      </div>

      {/* Tabs */}
      {selectedCourse && selectedSection && (
        <div className="flex justify-center -mt-4 mb-4 relative z-20">
          <div className={`flex p-1.5 rounded-full border shadow-sm backdrop-blur-xl ${isDarkMode ? 'bg-[#0B1120]/80 border-white/10' : 'bg-white/80 border-slate-200'}`}>
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all duration-300 ${activeTab === 'daily' ? 'bg-gradient-to-r from-[#00D4FF] to-[#2563EB] text-white shadow-[0_0_15px_rgba(0,212,255,0.4)]' : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <FileText className="w-4 h-4" /> Daily Roster
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all duration-300 ${activeTab === 'history' ? 'bg-gradient-to-r from-[#00D4FF] to-[#2563EB] text-white shadow-[0_0_15px_rgba(0,212,255,0.4)]' : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <History className="w-4 h-4" /> Attendance History
            </button>
          </div>
        </div>
      )}

      {!selectedCourse || !selectedSection ? (
         <div className="flex-1 flex flex-col items-center justify-center py-28 relative animate-in fade-in duration-700">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#00D4FF]/10 to-[#2563EB]/10 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="relative z-10 w-28 h-28 mb-8 flex items-center justify-center rounded-[2rem] bg-gradient-to-tr from-[#00D4FF]/10 to-[#2563EB]/10 border border-[#00D4FF]/20 shadow-[0_0_50px_rgba(0,212,255,0.15)] animate-pulse">
               <UserCheck className={`w-12 h-12 drop-shadow-lg ${isDarkMode ? 'text-[#00D4FF]' : 'text-[#2563EB]'}`} />
            </div>
            <h3 className={`text-4xl font-black font-display tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Awaiting Scope</h3>
            <p className={`text-center max-w-md font-medium text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Initialize the environment by connecting a specific course and section to load the interactive user roster.</p>
         </div>
      ) : activeTab === 'history' ? (
         <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-4">
               <h2 className={`text-2xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <History className="w-6 h-6 text-[#00D4FF]" /> Log History
               </h2>
               <button 
                  onClick={exportHistoryCSV}
                  disabled={historyRecords.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 border shadow-md hover:shadow-lg bg-gradient-to-r from-[#00D4FF] to-[#2563EB] text-white border-white/20 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
               >
                  <Download className="w-4 h-4" /> Export CSV Data
               </button>
            </div>
            {loadingHistory ? (
               <div className="flex justify-center py-20">
                  <div className={`w-12 h-12 border-4 border-t-[#00D4FF] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
               </div>
            ) : historyRecords.length === 0 ? (
               <div className={`p-12 text-center font-bold italic rounded-3xl border ${isDarkMode ? 'bg-[#0B1120]/40 text-slate-400 border-white/5' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  No historical attendance logs found for this section.
               </div>
            ) : (
               <div className="space-y-6">
                  {historyRecords.map(record => (
                     <div key={record.id} className={`p-6 rounded-[2rem] border shadow-lg ${isDarkMode ? 'bg-[#0B1120]/80 border-white/10' : 'bg-white border-slate-200'}`}>
                        <h3 className={`text-lg font-black mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                           <Calendar className="w-5 h-5 text-[#00D4FF]" /> 
                           {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           {(record.records || []).map((userRec, idx) => (
                              <div key={idx} className={`flex items-center gap-3 p-3 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                 <div className={`w-2.5 h-2.5 rounded-full ${userRec.status === 'present' ? 'bg-[#00D4FF] shadow-[0_0_8px_rgba(0,212,255,0.8)]' : userRec.status === 'late' ? 'bg-[#F97316] shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-[#E30A17] shadow-[0_0_8px_rgba(227,10,23,0.8)]'}`}></div>
                                 <div className="flex-1 overflow-hidden">
                                    <p className={`font-bold text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{userRec.user?.name || 'Unknown User'}</p>
                                    <p className={`text-[10px] uppercase font-black tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{userRec.status}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      ) : loading ? (
         <div className="flex-1 flex justify-center items-center py-20">
            <div className={`w-12 h-12 border-4 border-t-[#00D4FF] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
         </div>
      ) : attendanceRecords.length === 0 ? (
         <div className="flex-1 flex flex-col items-center justify-center py-28 relative animate-in fade-in duration-700">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#E30A17]/10 to-[#F97316]/10 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="relative z-10 w-28 h-28 mb-8 flex items-center justify-center rounded-[2rem] bg-gradient-to-tr from-[#E30A17]/10 to-[#F97316]/10 border border-[#E30A17]/20 shadow-[0_0_50px_rgba(227,10,23,0.15)] animate-pulse">
               <UserCheck className={`w-12 h-12 drop-shadow-lg ${isDarkMode ? 'text-[#E30A17]' : 'text-[#E30A17]'}`} />
            </div>
            <h3 className={`text-4xl font-black font-display tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Empty Roster</h3>
            <p className={`text-center max-w-md font-medium text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>There are currently no users enrolled in this section for the selected date.</p>
         </div>
      ) : (
         <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-700 pb-32">
            
            {/* Instructors Row */}
            {user?.role === 'admin' && (
               <div>
                  <h2 className={`text-xl font-display font-black mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                     <ShieldAlert className="w-5 h-5 text-[#00D4FF]" />
                     Instructors Roster
                     <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${isDarkMode ? 'bg-[#0B1120]/20 text-white' : 'bg-slate-100 text-slate-900'}`}>{instructorsList.length}</span>
                  </h2>
                  {renderUserCards(instructorsList, 'Instructor', false)}
               </div>
            )}

            {/* Students Row */}
            <div>
               <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                     <GraduationCap className="w-5 h-5 text-[#00D4FF]" />
                     Students Roster
                     <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-[#0B1120]/20 text-white' : 'bg-slate-100 text-slate-900'}`}>{studentsList.length}</span>
                  </h2>
                  {user?.role === 'admin' && (
                     <button 
                        onClick={() => setAdminStudentEditMode(!adminStudentEditMode)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${adminStudentEditMode ? 'bg-gradient-to-r from-[#00D4FF]/20 to-[#2563EB]/20 text-[#00D4FF] border-[#00D4FF]/30 shadow-[0_0_15px_rgba(0,212,255,0.15)]' : (isDarkMode ? 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900')}`}
                     >
                        {adminStudentEditMode ? 'Lock Student Roster' : 'Unlock for Editing'}
                     </button>
                  )}
               </div>
               {renderUserCards(studentsList, 'Student', user?.role === 'admin' && !adminStudentEditMode)}
            </div>

            {/* Action Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10">
               <div className={`p-2 rounded-full border shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl flex items-center gap-2 md:gap-4 ${isDarkMode ? 'bg-[#0B1120]/90 border-white/20' : 'bg-white/90 border-slate-300'}`}>
                  <button 
                     onClick={() => setAttendanceRecords(prev => prev.map(r => ({...r, status: 'present'})))}
                     className={`px-4 py-2 rounded-full font-bold text-xs transition-colors whitespace-nowrap ${isDarkMode ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                  >
                     Mark All Present
                  </button>
                  <div className={`w-px h-6 opacity-30 hidden md:block ${isDarkMode ? 'bg-white' : 'bg-black'}`}></div>
                  <div className={`px-2 font-bold text-sm hidden md:block whitespace-nowrap ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                     Ready to sync {attendanceRecords.length} records
                  </div>
                  <button 
                     onClick={handleSave}
                     disabled={saving}
                     className={`group relative overflow-hidden px-8 py-3.5 rounded-full font-black tracking-wide transition-all disabled:opacity-50 flex items-center gap-3 bg-gradient-to-r from-[#00D4FF] to-[#2563EB] text-white shadow-lg border border-white/20 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]`}
                  >
                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                     {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10"></div> : <Save className="w-5 h-5 relative z-10 drop-shadow-md" />}
                     <span className="relative z-10 drop-shadow-md">{saving ? 'Syncing...' : (user?.role === 'admin' ? 'Commit Instructors Log' : 'Commit Daily Log')}</span>
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
