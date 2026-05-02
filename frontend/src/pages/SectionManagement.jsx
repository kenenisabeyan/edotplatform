import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import api from '../utils/api';
import { Layers, Plus, Link as LinkIcon, Users, UserPlus, BookOpen, Trash2, ShieldAlert, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SectionManagement() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [validators, setValidators] = useState({ instructors: [], students: [] });
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', course: '', instructor: '' });
  
  const [selectedSection, setSelectedSection] = useState(null);
  const [studentToAdd, setStudentToAdd] = useState('');

  useEffect(() => {
    fetchCoreData();
  }, []);

  const fetchCoreData = async () => {
    try {
      setLoading(true);
      const secRes = await api.get('/sections');
      if (secRes.data?.success) setSections(secRes.data.data);

      const courseRes = await api.get('/courses');
      if (courseRes.data?.success || Array.isArray(courseRes.data?.data)) {
        setCourses(courseRes.data.data || []);
      }

      const usersRes = await api.get('/admin/users'); // fallback to admin users route
      if (usersRes.data?.success) {
         const allUsers = usersRes.data.data || [];
         setValidators({
           instructors: allUsers.filter(u => u.role === 'instructor' || u.role === 'admin'),
           students: allUsers.filter(u => u.role === 'student')
         });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/sections', formData);
      if (res.data?.success) {
         setFormData({ name: '', course: '', instructor: '' });
         fetchCoreData();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating section');
    }
  };

  const handleDeleteSection = async (id) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;
    try {
      await api.delete(`/sections/${id}`);
      fetchCoreData();
      if (selectedSection?.id === id) setSelectedSection(null);
    } catch (error) {
       alert(error.response?.data?.message || 'Error deleting section');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!selectedSection || !studentToAdd) return;
    try {
      await api.post(`/sections/${selectedSection.id}/add-student`, { studentId: studentToAdd });
      setStudentToAdd('');
      fetchCoreData(); // refresh
      const updated = await api.get(`/sections/${selectedSection.id}`);
      setSelectedSection(updated.data.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding student');
    }
  };

  const handleRemoveStudent = async (sectionId, studentId) => {
    try {
      await api.delete(`/sections/${sectionId}/students/${studentId}`);
      fetchCoreData();
      if (selectedSection?.id === sectionId) {
         const updated = await api.get(`/sections/${sectionId}`);
         setSelectedSection(updated.data.data);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error removing student');
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
         <Loader className="w-10 h-10 text-[#F97316] animate-spin" />
      </div>
    );
  }

  return (
    <div className={`p-6 md:p-10 max-w-7xl mx-auto ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 pt-2 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
             <Layers className="w-8 h-8 text-[#00D4FF]"/>
             Section Management
          </h1>
          <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Create groupings, assign instructors, and organize students tightly into cohorts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Form & Management */}
         <div className="lg:col-span-1 space-y-8">
            {/* Create Card */}
            <div className={`backdrop-blur-xl border shadow-2xl rounded-[2.5rem] p-6 lg:p-8 relative overflow-hidden ${isDarkMode ? 'bg-[#0B1120]/40 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
               <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-[#00D4FF]/10 rounded-full blur-[40px]"></div>
               <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                 <Layers className="w-5 h-5 text-[#F97316]" /> New Section
               </h3>
               
               <form onSubmit={handleCreateSection} className="space-y-5">
                 <div>
                   <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Section Name</label>
                   <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Batch 1, Group A" required className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00D4FF]/50 transition-colors ${isDarkMode ? 'bg-[#0B1120] border-white/5 text-white' : 'bg-white border-slate-100 text-slate-900'}`} />
                 </div>
                 
                 <div>
                   <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Target Course</label>
                   <div className="relative">
                     <select value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} required className={`w-full border rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:border-[#00D4FF]/50 transition-colors ${isDarkMode ? 'bg-[#0B1120] border-white/5 text-slate-300' : 'bg-white border-slate-100 text-slate-500'}`}>
                       <option value="" disabled>Select a course...</option>
                       {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                     </select>
                     <BookOpen className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
                   </div>
                 </div>

                 <div>
                   <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Assign Instructor</label>
                   <div className="relative">
                     <select value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:border-[#00D4FF]/50 transition-colors ${isDarkMode ? 'bg-[#0B1120] border-white/5 text-slate-300' : 'bg-white border-slate-100 text-slate-500'}`}>
                       <option value="">No explicit assignment</option>
                       {validators.instructors.map(ins => <option key={ins.id} value={ins.id}>{ins.name || ins.email}</option>)}
                     </select>
                     <ShieldAlert className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
                   </div>
                 </div>

                 <button type="submit" className={`w-full mt-2 font-semibold py-3 rounded-xl border transition-all flex items-center justify-center gap-2 bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border-[#00D4FF] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                   <Plus className="w-4 h-4" /> Create Section
                 </button>
               </form>
            </div>

            {/* Selected Section Detail / Enrollment */}
            {selectedSection && (
              <div className={`backdrop-blur-xl border shadow-2xl rounded-[2.5rem] p-6 lg:p-8 animate-fade-in-up ${isDarkMode ? 'bg-[#0B1120]/40 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                 <h3 className={`text-xl font-bold mb-6 flex items-center justify-between ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                   <span className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-[#F97316]" /> Student Roster</span>
                   <span className="text-[10px] bg-emerald-500/100/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">{selectedSection.name}</span>
                 </h3>
                 
                 <form onSubmit={handleAddStudent} className="flex flex-col gap-3 mb-6">
                   <label className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Enroll New Learner</label>
                   <select value={studentToAdd} onChange={e => setStudentToAdd(e.target.value)} required className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F97316]/50 transition-colors appearance-none ${isDarkMode ? 'bg-[#0B1120] border-white/5 text-slate-300' : 'bg-white border-slate-100 text-slate-500'}`}>
                     <option value="" disabled>Search & Select Student...</option>
                     {validators.students.filter(stu => !selectedSection.students.find(s => s.id === stu.id)).map(stu => (
                        <option key={stu.id} value={stu.id}>{stu.name} - {stu.email}</option>
                     ))}
                   </select>
                   <button type="submit" className={`w-full py-2.5 rounded-xl border transition-all font-semibold text-sm bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border-[#00D4FF] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                     + Add to {selectedSection.name}
                   </button>
                 </form>

                 <div className={`max-h-[300px] overflow-y-auto space-y-2 pr-2 scrollbar-hide border-t pt-4 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                   <p className={`text-xs font-bold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{selectedSection.students.length} Learners Enrolled</p>
                   {selectedSection.students.map(student => (
                     <div key={student.id} className={`flex items-center justify-between bg-[#0B1120]/60 border p-3 rounded-xl hover:border-white/10 transition-colors ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-blue-500/100/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">{student.name?.[0]?.toUpperCase()}</div>
                         <div className="flex flex-col">
                           <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{student.name}</span>
                           <span className={`text-[10px] ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{student.email}</span>
                         </div>
                       </div>
                       <button onClick={() => handleRemoveStudent(selectedSection.id, student.id)} className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/100/10 p-2 rounded-lg transition-colors">
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                   ))}
                   {selectedSection.students.length === 0 && (
                     <div className={`text-center text-sm py-4 italic ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>No students linked to this array yet.</div>
                   )}
                 </div>
              </div>
            )}
         </div>

         {/* Sections List */}
         <div className="lg:col-span-2 space-y-6">
           <h3 className={`text-xl font-bold flex items-center gap-2 px-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}><LinkIcon className="w-5 h-5 text-[#00D4FF]" /> Course Mappings</h3>
           
           {courses.map(course => {
             const courseSections = sections.filter(s => s.course?.id === course.id);
             if (courseSections.length === 0) return null;

             return (
               <div key={course.id} className={`bg-[#0B1120]/30 border rounded-3xl p-5 md:p-6 mb-6 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                 <h4 className={`text-lg font-black mb-5 tracking-tight flex items-center gap-3 border-b pb-4 ${isDarkMode ? 'text-white border-white/5' : 'text-slate-900 border-slate-100'}`}>
                   {course.title}
                   <span className="text-[10px] font-bold bg-[#F97316]/10 text-[#F97316] px-2 py-0.5 rounded-full border border-[#F97316]/20">{courseSections.length} Sections</span>
                 </h4>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {courseSections.map(sec => (
                     <div 
                       key={sec.id} 
                       onClick={() => setSelectedSection(sec)}
                       className={`p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${selectedSection?.id === sec.id ? 'bg-[#00D4FF]/10 border-[#00D4FF]/40 shadow-[0_0_20px_rgba(0,138,50,0.1)]' : 'bg-[#0B1120]/60 hover:border-white/10 hover:bg-white/5'} ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}
                     >
                        <div className="flex justify-between items-start mb-3">
                           <div>
                             <h5 className={`font-bold text-base group-hover:text-[#F97316] transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{sec.name}</h5>
                             <p className={`text-[10px] font-bold mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
                               Instructor: {sec.instructor ? sec.instructor.name : <span className="text-rose-400">Unassigned</span>}
                             </p>
                           </div>
                           <button onClick={(e) => { e.stopPropagation(); handleDeleteSection(sec.id); }} className={`hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/100/10 p-1.5 rounded-lg border border-transparent hover:border-rose-500/30 ${isDarkMode ? 'text-slate-300 bg-[#0B1120]/5' : 'text-slate-500 bg-slate-50'}`}>
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                        
                        <div className={`flex items-center gap-2 mt-4 pt-4 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                           <Users className={`w-4 h-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
                           <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{sec.students?.length || 0} Learners Managed</span>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             )
           })}

           {sections.length === 0 && (
              <div className={`bg-[#0B1120]/30 border rounded-3xl p-16 text-center font-medium italic ${isDarkMode ? 'border-white/10 text-slate-200' : 'border-slate-200 text-slate-600'}`}>
                No sections exist in the database. Construct the first cohort via the form.
              </div>
           )}
         </div>
      </div>
    </div>
  );
}
