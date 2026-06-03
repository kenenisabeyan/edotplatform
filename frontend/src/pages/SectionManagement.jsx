import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import api from '../utils/api';
import { Layers, Plus, Link as LinkIcon, Users, UserPlus, BookOpen, Trash2, ShieldAlert, Loader, ChevronDown, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function SectionManagement() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [learnerGroups, setLearnerGroups] = useState([]);
  const [validators, setValidators] = useState({ instructors: [], students: [] });
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', batch: '', category: '', course: '', instructor: '' });
  
  const [selectedSection, setSelectedSection] = useState(null);
  const [studentToAdd, setStudentToAdd] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  useEffect(() => {
    fetchCoreData();
  }, []);

  const fetchCoreData = async () => {
    try {
      setLoading(true);
      const isAdmin = user?.role === 'admin';

      const secRes = await api.get('/sections');
      if (secRes.data?.success) setSections(secRes.data.data);

      const courseEndpoint = isAdmin ? '/admin/courses' : '/instructor/courses';
      const courseRes = await api.get(courseEndpoint);
      if (courseRes.data?.success || Array.isArray(courseRes.data?.data)) {
        setCourses(courseRes.data.data || []);
      }

      const groupRes = await api.get('/sections/groups');
      if (groupRes.data?.success) {
        setLearnerGroups(groupRes.data.data);
      } else {
        console.error('Group fetch failed:', groupRes.data);
      }

      if (isAdmin) {
         const [instRes, stuRes] = await Promise.all([
           api.get('/admin/instructors'),
           api.get('/admin/students')
         ]);
         
         setValidators({
           instructors: instRes.data?.data || [],
           students: stuRes.data?.data || []
         });
      } else {
         const stuRes = await api.get('/instructor/students');
         setValidators({
           instructors: [user],
           students: stuRes.data?.data || []
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
         toast.success('Section created successfully!');
         setFormData({ name: '', batch: '', category: '', course: '', instructor: '' });
         fetchCoreData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating section');
    }
  };

  const handleAutoAssign = async () => {
    if (!selectedSection) return;
    try {
      const res = await api.post(`/sections/${selectedSection.id}/auto-assign`);
      toast.success(res.data.message || 'Students auto-assigned successfully');
      fetchCoreData();
      const updated = await api.get(`/sections/${selectedSection.id}`);
      setSelectedSection(updated.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error auto-assigning students');
    }
  };

  const handleDeleteSection = async (id) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;
    try {
      await api.delete(`/sections/${id}`);
      toast.success('Section deleted successfully');
      fetchCoreData();
      if (selectedSection?.id === id) setSelectedSection(null);
    } catch (error) {
       toast.error(error.response?.data?.message || 'Error deleting section');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!selectedSection || !studentToAdd) return;
    try {
      await api.post(`/sections/${selectedSection.id}/add-student`, { studentId: studentToAdd });
      toast.success('Student added successfully');
      setStudentToAdd('');
      fetchCoreData(); // refresh
      const updated = await api.get(`/sections/${selectedSection.id}`);
      setSelectedSection(updated.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding student');
    }
  };

  const handleRemoveStudent = async (sectionId, studentId) => {
    try {
      await api.delete(`/sections/${sectionId}/students/${studentId}`);
      toast.success('Student removed successfully');
      fetchCoreData();
      if (selectedSection?.id === sectionId) {
         const updated = await api.get(`/sections/${sectionId}`);
         setSelectedSection(updated.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error removing student');
    }
  };

  const exportAllSectionsCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `"Category","Section Name","Course","Batch","Instructor","Enrolled Students"\n`;
    sections.forEach(sec => {
       const category = sec.course?.mainCategory || 'Uncategorized';
       const course = sec.course?.title || 'Unknown';
       const instructor = sec.instructor?.name || 'Unassigned';
       const enrolled = sec.students?.length || 0;
       csvContent += `"${category}","${sec.name}","${course}","${sec.batch || ''}","${instructor}","${enrolled}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "All_Sections.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSectionRosterCSV = () => {
    if (!selectedSection) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `"Section","Course","Batch","Instructor"\n`;
    csvContent += `"${selectedSection.name}","${selectedSection.course?.title || 'Unknown'}","${selectedSection.batch || ''}","${selectedSection.instructor?.name || 'Unassigned'}"\n\n`;
    csvContent += `"Student Name","Email"\n`;
    (selectedSection.students || []).forEach(s => {
        csvContent += `"${s.name}","${s.email}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedSection.name.replace(/\s+/g, '_')}_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
         <Loader className="w-10 h-10 text-[#00D4FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className={`p-6 md:p-10 max-w-none w-full ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 pt-2 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
             <Layers className="w-8 h-8 text-[#00D4FF]"/>
             Section Management
          </h1>
          <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Create groupings, assign instructors, and organize students tightly into cohorts.</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
           <button 
             onClick={exportAllSectionsCSV}
             className={`px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all duration-300 border shadow-sm hover:-translate-y-0.5 hover:shadow-md ${isDarkMode ? 'bg-[#0f172a] text-[#00D4FF] border-[#00D4FF]/30 hover:border-[#00D4FF]' : 'bg-white text-[#2563EB] border-blue-200 hover:border-blue-400'}`}
           >
             Extract All Sections
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Form & Management */}
         {user?.role !== 'student' && (
           <div className="lg:col-span-1 space-y-8">
             {/* Create Card */}
             <div className={`border rounded-[2.5rem] p-8 lg:p-10 relative overflow-hidden transition-all shadow-xl hover:shadow-2xl ${isDarkMode ? 'bg-[#0B1120]/80 border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-[#00D4FF]/30'}`}>
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#00D4FF]/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen"></div>
                <h3 className={`text-2xl font-black mb-8 flex items-center gap-3 relative z-10 ${isDarkMode ? 'text-white' : 'text-[#0B1221]'}`}>
                  <Layers className="w-6 h-6 text-[#00D4FF] drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]" /> New Section
                </h3>
                
                <form onSubmit={handleCreateSection} className="space-y-5">
                  <div>
                    <label className={`block text-[11px] font-bold mb-2 uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Section Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Group A" required className={`w-full border rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/20 focus:border-[#00D4FF]/50 transition-all ${isDarkMode ? 'bg-[#151e32]/50 border-white/5 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'}`} />
                  </div>
                  
                  <div>
                    <label className={`block text-[11px] font-bold mb-2 uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Batch (Optional)</label>
                    <input type="text" value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})} placeholder="e.g. 2026" className={`w-full border rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/20 focus:border-[#00D4FF]/50 transition-all ${isDarkMode ? 'bg-[#151e32]/50 border-white/5 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'}`} />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-2 uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Target Category</label>
                    <div className="relative">
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value, course: ''})} className={`w-full border rounded-xl px-4 py-3.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/20 focus:border-[#00D4FF]/50 transition-all cursor-pointer ${isDarkMode ? 'bg-[#151e32]/50 border-white/5 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                        <option value="">Select a category...</option>
                        {learnerGroups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                        <option value="Uncategorized">Uncategorized</option>
                      </select>
                      <ChevronDown className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-[11px] font-bold mb-2 uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Target Course</label>
                    <div className="relative">
                      <select value={formData.course} onChange={e => {
                         const selectedCourseId = e.target.value;
                         const targetCourse = courses.find(c => c.id === selectedCourseId);
                         setFormData({
                             ...formData, 
                             course: selectedCourseId, 
                             instructor: targetCourse?.instructorId || formData.instructor
                         });
                      }} required className={`w-full border rounded-xl px-4 py-3.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/20 focus:border-[#00D4FF]/50 transition-all cursor-pointer ${isDarkMode ? 'bg-[#151e32]/50 border-white/5 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                        <option value="" disabled>Select a course...</option>
                        {(() => {
                           const targetCat = formData.category;
                           let filtered = [];
                           if (targetCat) {
                             filtered = courses.filter(c => targetCat === 'Uncategorized' ? !learnerGroups.find(g => g.name === c.mainCategory) : c.mainCategory === targetCat);
                           }
                           
                           const displayCourses = targetCat ? filtered : courses;
                           
                           const grouped = displayCourses.reduce((acc, c) => {
                             const cat = c.mainCategory || 'Uncategorized';
                             if (!acc[cat]) acc[cat] = [];
                             acc[cat].push(c);
                             return acc;
                           }, {});
                           
                           if (Object.keys(grouped).length === 0) return <option disabled>No courses available</option>;

                           return Object.entries(grouped).map(([cat, cats]) => (
                             <optgroup key={cat} label={`${cat} Category`}>
                               {cats.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                             </optgroup>
                           ));
                        })()}
                      </select>
                      <ChevronDown className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-2 uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Assign Instructor</label>
                    <div className="relative">
                      <select value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} className={`w-full border rounded-xl px-4 py-3.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/20 focus:border-[#00D4FF]/50 transition-all cursor-pointer ${isDarkMode ? 'bg-[#151e32]/50 border-white/5 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                        <option value="">Select an instructor...</option>
                        {(() => {
                           const displayInstructors = validators.instructors;
                           const grouped = displayInstructors.reduce((acc, ins) => {
                             const cat = ins.department || 'Uncategorized';
                             if (!acc[cat]) acc[cat] = [];
                             acc[cat].push(ins);
                             return acc;
                           }, {});
                           
                           if (Object.keys(grouped).length === 0) return <option disabled>No instructors available</option>;
                           
                           return Object.entries(grouped).map(([cat, instructors]) => (
                             <optgroup key={cat} label={`${cat} Category`}>
                               {instructors.map(ins => <option key={ins.id} value={ins.id}>{ins.name || ins.email}</option>)}
                             </optgroup>
                           ));
                        })()}
                      </select>
                      <ChevronDown className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                    </div>
                  </div>

                  <button type="submit" className={`w-full mt-6 group relative overflow-hidden px-6 py-4 rounded-full font-black text-sm shadow-lg transition-all hover:scale-105 border border-white/20 bg-gradient-to-r from-[#00D4FF] to-[#2563EB] text-white hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]`}>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                    <span className="relative z-10 drop-shadow-md flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Create Section</span>
                  </button>
                </form>
             </div>

             {/* Student Roster Modal extracted from here */}
           </div>
         )}

         {/* Sections List */}
         <div className={`${user?.role !== 'student' ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
           <h3 className={`text-xl font-bold flex items-center gap-2 px-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}><Layers className="w-5 h-5 text-[#00D4FF]" /> Category Groups</h3>
           
           {(() => {
             // Group by the official LearnerGroups fetched from backend
             const groupsToRender = learnerGroups.length > 0 ? learnerGroups : [];
             if (groupsToRender.length === 0) return null;

             return groupsToRender.map((group, idx) => {
               // Get sections that belong to this group
               const groupSections = sections.filter(s => s.groupId === group.id);
               const isExpanded = expandedGroups[group.id];
               
               return (
                 <div key={group.id} className="mb-4">
                    <div 
                      onClick={() => toggleGroup(group.id)}
                      className={`flex items-center justify-between p-4 md:p-5 rounded-[1.25rem] cursor-pointer transition-all duration-300 border ${isDarkMode ? 'bg-[#0B1120]/65 border-white/5 hover:border-[#00D4FF]/30 hover:bg-[#0B1120] hover:shadow-[0_8px_30px_rgba(0,212,255,0.05)]' : 'bg-white border-slate-200 hover:border-slate-350 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 shrink-0 flex items-center justify-center font-black rounded-xl text-lg shadow-sm border ${isDarkMode ? 'bg-[#151e32] text-[#00D4FF] border-[#00D4FF]/20' : 'bg-slate-50 text-[#00B2D6] border-slate-200/80'}`}>
                          {idx + 1}
                        </div>
                        <h4 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                          {group.name} Category
                        </h4>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${isDarkMode ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20' : 'bg-[#00B2D6]/10 text-[#00B2D6] border-[#00B2D6]/20'}`}>
                          {groupSections.length} Sections
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm border transition-all duration-300 ${isDarkMode ? 'bg-[#151e32] text-[#00D4FF] border-white/5' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </div>

                   {isExpanded && (
                     <div className={`mt-2 p-5 md:p-6 rounded-3xl border animate-fade-in-up ${isDarkMode ? 'bg-[#0B1120]/30 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
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
                             className={`p-6 rounded-[1.5rem] border transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[220px] ${
                               selectedSection?.id === sec.id 
                               ? (isDarkMode ? 'bg-gradient-to-br from-[#0B1120] to-[#00D4FF]/10 border-[#00D4FF]/50 shadow-[0_0_30px_rgba(0,212,255,0.15)] ring-1 ring-[#00D4FF]/50' : 'bg-gradient-to-br from-white to-[#00D4FF]/5 border-[#00D4FF]/50 shadow-lg ring-1 ring-[#00D4FF]/50') 
                               : (isDarkMode ? 'bg-[#0B1120]/80 border-[#F97316]/30 hover:border-[#00D4FF]/50 hover:bg-[#0B1120]' : 'bg-white border-[#F97316]/30 hover:border-[#00D4FF]/50 hover:shadow-xl shadow-sm')
                             }`}
                           >
                              {/* Selection Indicator Strip */}
                              <div className={`absolute top-0 left-0 w-1.5 h-full transition-all duration-300 ${selectedSection?.id === sec.id ? 'bg-[#00D4FF]' : 'bg-[#F97316] group-hover:bg-[#00D4FF]'}`}></div>

                              <div className="flex justify-between items-start relative z-10 pl-2">
                                 <div className="flex-1 pr-4">
                                   {sec.course && (
                                     <div className={`text-[10px] font-bold px-2.5 py-1 rounded-md mb-3 inline-block border ${isDarkMode ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                       {sec.course.title}
                                     </div>
                                   )}
                                   <h5 className={`font-black text-lg leading-snug mb-1 transition-colors ${selectedSection?.id === sec.id ? 'text-[#00D4FF]' : 'text-[#F97316] group-hover:text-[#00D4FF]'}`}>
                                     {sec.name}
                                   </h5>
                                   <div className="flex items-center gap-2 mt-2">
                                     {sec.batch && (
                                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-600'}`}>
                                         Batch {sec.batch}
                                       </span>
                                     )}
                                   </div>
                                 </div>
                                 
                                 {user?.role !== 'student' && (
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); handleDeleteSection(sec.id); }} 
                                     className={`shrink-0 transition-all p-2 rounded-xl border ${isDarkMode ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border-rose-500/20' : 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border-rose-100'} opacity-0 group-hover:opacity-100 shadow-sm`}
                                     title="Delete Section"
                                   >
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                 )}
                              </div>
                              
                              <div className="mt-6 pt-5 border-t pl-2 relative z-10 flex flex-col gap-3" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                 <div className="flex items-center gap-2">
                                   <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isDarkMode ? 'bg-[#151e32] text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                      {sec.instructor ? sec.instructor.name?.[0]?.toUpperCase() : '?'}
                                   </div>
                                   <p className={`text-[11px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                     {sec.instructor ? sec.instructor.name : <span className="text-rose-400 italic">Unassigned Instructor</span>}
                                   </p>
                                 </div>

                                 <div className="flex items-center justify-between mt-1">
                                    <div className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                       <Users className={`w-4 h-4 ${selectedSection?.id === sec.id ? 'text-[#00D4FF]' : 'text-[#F97316] group-hover:text-[#00D4FF]'}`} />
                                       <span className="text-xs font-bold">{sec.students?.length || 0} Enrolled</span>
                                    </div>
                                    <div className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${selectedSection?.id === sec.id ? 'text-[#00D4FF]' : 'text-[#F97316] group-hover:text-[#00D4FF]'}`}>
                                       {user?.role === 'student' ? 'View' : 'Manage'} <ChevronRight className="w-3 h-3" />
                                    </div>
                                 </div>
                              </div>
                           </div>
                         ))}
                         </div>
                       )}
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

      {/* Selected Section Detail / Enrollment Modal */}
      {selectedSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedSection(null)}>
          <div onClick={(e) => e.stopPropagation()} className={`relative w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col border rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-500 ${isDarkMode ? 'bg-[#0B1120] border-white/10' : 'bg-white border-slate-200'}`}>
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D4FF]/10 blur-[80px] rounded-full pointer-events-none mix-blend-screen"></div>
            
            <button 
              onClick={() => setSelectedSection(null)}
              className={`absolute top-6 right-6 p-2 rounded-full transition-colors z-20 ${isDarkMode ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-8 gap-4 pr-12">
               <h3 className={`text-xl font-bold flex flex-col gap-1 ${isDarkMode ? 'text-white' : 'text-[#0B1221]'}`}>
                 <span className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-[#00D4FF]" /> Student Roster</span>
               </h3>
               <div className="flex flex-wrap items-center gap-3">
                 <span className={`text-[10px] px-3 py-1.5 rounded border text-center font-bold max-w-full truncate ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                   {selectedSection.name}
                 </span>
                 <button 
                   onClick={exportSectionRosterCSV}
                   className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all duration-300 border hover:-translate-y-0.5 ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:border-indigo-400/50' : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:border-indigo-400'}`}
                 >
                   Extract Roster
                 </button>
               </div>
            </div>
            
            {user?.role !== 'student' && (
              <form onSubmit={handleAddStudent} className="flex flex-col gap-4 mb-8">
                <div>
                  <label className={`block text-[11px] font-bold mb-2 uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Enroll New Learner</label>
                  <div className="relative">
                    <select value={studentToAdd} onChange={e => setStudentToAdd(e.target.value)} required className={`w-full border rounded-xl px-4 py-3.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/20 focus:border-[#00D4FF]/50 transition-all cursor-pointer ${isDarkMode ? 'bg-[#151e32]/50 border-white/5 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                      <option value="" disabled>Search & Select Student...</option>
                      {validators.students.filter(stu => !selectedSection.students.find(s => s.id === stu.id)).map(stu => (
                         <option key={stu.id} value={stu.id}>{stu.name} - {stu.email}</option>
                      ))}
                    </select>
                    <ChevronDown className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                  </div>
                </div>
  
                <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                  <button type="submit" className={`flex-1 py-3 rounded-full font-bold text-[13px] bg-[#00D4FF] hover:bg-[#00BCE6] shadow-sm text-[#0B1221] transition-all`}>
                    + Add Manually
                  </button>
                  <button type="button" onClick={handleAutoAssign} className={`flex-1 py-3 rounded-full font-bold text-[13px] bg-[#F97316] hover:bg-[#EA580C] shadow-sm text-white transition-all`}>
                    Auto-Assign Batch
                  </button>
                </div>
              </form>
            )}

            <div className={`max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-hide border-t pt-6 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
              <p className={`text-[11px] font-bold uppercase tracking-wide mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedSection.students.length} Learners Enrolled</p>
              {selectedSection.students.map(student => (
                <div key={student.id} className={`flex items-center justify-between border p-3 rounded-2xl transition-colors ${isDarkMode ? 'bg-[#151e32]/30 border-white/5 hover:border-white/10' : 'bg-white border-slate-100 hover:shadow-sm'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-[13px] border ${isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                       {student.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[13px] font-bold ${isDarkMode ? 'text-white' : 'text-[#0B1221]'}`}>{student.name}</span>
                      <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{student.email}</span>
                    </div>
                  </div>
                  {user?.role !== 'student' && (
                    <button onClick={() => handleRemoveStudent(selectedSection.id, student.id)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'text-rose-500 hover:bg-rose-500/10' : 'text-rose-400 hover:bg-rose-50 hover:text-rose-600'}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {selectedSection.students.length === 0 && (
                <div className={`text-center text-sm py-8 font-bold italic rounded-3xl border ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>No students linked to this cohort yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
