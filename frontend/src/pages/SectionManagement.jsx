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
  const [learnerGroups, setLearnerGroups] = useState([]);
  const [validators, setValidators] = useState({ instructors: [], students: [] });
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', batch: '', course: '', instructor: '' });
  
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

      const groupRes = await api.get('/sections/groups');
      if (groupRes.data?.success) {
        setLearnerGroups(groupRes.data.data);
      } else {
        console.error('Group fetch failed:', groupRes.data);
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
      const res = await api.post('/sections', { ...formData, courseId: formData.course, instructorId: formData.instructor });
      if (res.data?.success) {
         setFormData({ name: '', batch: '', course: '', instructor: '' });
         fetchCoreData();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating section');
    }
  };

  const handleAutoAssign = async () => {
    if (!selectedSection) return;
    try {
      const res = await api.post(`/sections/${selectedSection.id}/auto-assign`);
      alert(res.data.message);
      fetchCoreData();
      const updated = await api.get(`/sections/${selectedSection.id}`);
      setSelectedSection(updated.data.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Error auto-assigning students');
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
                   <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Group A" required className={`w-full border !rounded-full !px-5 !py-3 text-sm focus:outline-none focus:border-[#00D4FF]/50 transition-colors ${isDarkMode ? 'bg-[#0B1120] border-white/5 text-white' : 'bg-white border-slate-100 text-slate-900'}`} />
                 </div>
                 
                 <div>
                   <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Batch (Optional)</label>
                   <input type="text" value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})} placeholder="e.g. 2026" className={`w-full border !rounded-full !px-5 !py-3 text-sm focus:outline-none focus:border-[#00D4FF]/50 transition-colors ${isDarkMode ? 'bg-[#0B1120] border-white/5 text-white' : 'bg-white border-slate-100 text-slate-900'}`} />
                 </div>
                 
                 <div>
                   <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Target Course</label>
                   <div className="relative">
                     <select value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} required className={`w-full border rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:border-[#00D4FF]/50 transition-colors ${isDarkMode ? 'bg-[#0B1120] border-white/5 text-slate-300' : 'bg-white border-slate-100 text-slate-500'}`}>
                       <option value="" disabled>Select a course...</option>
                       {learnerGroups.map(group => {
                         const groupCourses = courses.filter(c => c.mainCategory === group.name);
                         if (groupCourses.length === 0) return null;
                         return (
                           <optgroup key={group.name} label={group.name}>
                             {groupCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                           </optgroup>
                         );
                       })}
                       {(() => {
                         const uncat = courses.filter(c => !learnerGroups.find(g => g.name === c.mainCategory));
                         if (uncat.length === 0) return null;
                         return (
                           <optgroup label="Uncategorized">
                             {uncat.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                           </optgroup>
                         );
                       })()}
                     </select>
                     <BookOpen className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
                   </div>
                 </div>

                 <div>
                   <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Assign Instructor</label>
                   <div className="relative">
                     <select value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:border-[#00D4FF]/50 transition-colors ${isDarkMode ? 'bg-[#0B1120] border-white/5 text-slate-300' : 'bg-white border-slate-100 text-slate-500'}`}>
                       <option value="">No explicit assignment</option>
                       {learnerGroups.map(group => {
                         const groupInstructors = validators.instructors.filter(ins => ins.learnerGroups?.some(g => g.id === group.id));
                         if (groupInstructors.length === 0) return null;
                         return (
                           <optgroup key={group.name} label={group.name}>
                             {groupInstructors.map(ins => <option key={ins.id} value={ins.id}>{ins.name || ins.email}</option>)}
                           </optgroup>
                         );
                       })}
                       {(() => {
                         const uncat = validators.instructors.filter(ins => !ins.learnerGroups || ins.learnerGroups.length === 0);
                         if (uncat.length === 0) return null;
                         return (
                           <optgroup label="Uncategorized">
                             {uncat.map(ins => <option key={ins.id} value={ins.id}>{ins.name || ins.email}</option>)}
                           </optgroup>
                         );
                       })()}
                     </select>
                     <ShieldAlert className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
                   </div>
                 </div>

                 <button type="submit" className={`w-full mt-2 font-semibold py-3 rounded-full border transition-all flex items-center justify-center gap-2 bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border-[#00D4FF] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
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
                     {learnerGroups.map(group => {
                       const groupStudents = validators.students.filter(stu => 
                         !selectedSection.students.find(s => s.id === stu.id) &&
                         stu.learnerGroups?.some(g => g.id === group.id)
                       );
                       if (groupStudents.length === 0) return null;
                       return (
                         <optgroup key={group.name} label={group.name}>
                           {groupStudents.map(stu => (
                             <option key={stu.id} value={stu.id}>{stu.name} - {stu.email}</option>
                           ))}
                         </optgroup>
                       );
                     })}
                     {(() => {
                       const uncat = validators.students.filter(stu => 
                         !selectedSection.students.find(s => s.id === stu.id) &&
                         (!stu.learnerGroups || stu.learnerGroups.length === 0)
                       );
                       if (uncat.length === 0) return null;
                       return (
                         <optgroup label="Uncategorized">
                           {uncat.map(stu => (
                             <option key={stu.id} value={stu.id}>{stu.name} - {stu.email}</option>
                           ))}
                         </optgroup>
                       );
                     })()}
                   </select>
                   <div className="flex gap-2 w-full mt-2">
                     <button type="submit" className={`flex-1 py-2.5 rounded-full border transition-all font-semibold text-sm bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border-[#00D4FF] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                       + Add Manually
                     </button>
                     <button type="button" onClick={handleAutoAssign} className={`flex-1 py-2.5 rounded-full border transition-all font-semibold text-sm bg-[#F97316] hover:bg-[#E66A00] shadow-md border-[#F97316] text-white`}>
                       Auto-Assign Batch
                     </button>
                   </div>
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
           <h3 className={`text-xl font-bold flex items-center gap-2 px-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}><Layers className="w-5 h-5 text-[#00D4FF]" /> Category Groups</h3>
           
           {(() => {
             // Group by the official LearnerGroups fetched from backend
             const groupsToRender = learnerGroups.length > 0 ? learnerGroups : [];
             if (groupsToRender.length === 0) return null;

             return groupsToRender.map(group => {
               // Get sections that belong to this group
               const groupSections = sections.filter(s => s.groupId === group.id);
               
               return (
                 <div key={group.id} className={`bg-[#0B1120]/30 border rounded-3xl p-5 md:p-6 mb-6 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                   <h4 className={`text-xl font-black mb-5 tracking-tight flex items-center gap-3 border-b pb-4 ${isDarkMode ? 'text-[#00D4FF] border-white/5' : 'text-[#0940B5] border-slate-100'}`}>
                     {group.name} Category
                     <span className="text-[10px] font-bold bg-[#F97316]/10 text-[#F97316] px-2 py-0.5 rounded-full border border-[#F97316]/20">{groupSections.length} Sections</span>
                   </h4>

                   {groupSections.length === 0 ? (
                     <div className={`text-sm italic py-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                       No sections in this category yet.
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {groupSections.map(sec => (
                       <div 
                         key={sec.id} 
                         onClick={() => setSelectedSection(sec)}
                         className={`p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${selectedSection?.id === sec.id ? 'bg-[#00D4FF]/10 border-[#00D4FF]/40 shadow-[0_0_20px_rgba(0,138,50,0.1)]' : 'bg-[#0B1120]/60 hover:border-white/10 hover:bg-white/5'} ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}
                       >
                          <div className="flex justify-between items-start mb-3">
                             <div>
                               <h5 className={`font-bold text-base group-hover:text-[#F97316] transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{sec.name}</h5>
                               {sec.course && <p className={`text-xs font-medium truncate mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{sec.course.title}</p>}
                               {sec.batch && <p className="text-[10px] font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full mt-1 inline-block">Batch {sec.batch}</p>}
                               <p className={`text-[10px] font-bold mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
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
                   )}
                 </div>
               )
             });
           })()}

           {learnerGroups.length === 0 && !loading && (
              <div className={`bg-[#0B1120]/30 border rounded-3xl p-16 text-center font-medium italic ${isDarkMode ? 'border-white/10 text-slate-200' : 'border-slate-200 text-slate-600'}`}>
                Error: Failed to load Category Groups. Please try refreshing.
              </div>
           )}
         </div>
      </div>
    </div>
  );
}
