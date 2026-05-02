import React, { useEffect, useState, useCallback } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import api from '../utils/api';
import { BookOpen, Search, Download, Plus, Trash2, FileText, Loader2, AlertCircle, Globe, Lock, GitMerge, Shield, FileSignature, ChevronRight, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Markdown from 'markdown-to-jsx';
import 'github-markdown-css';
import CustomDropdown from '../components/CustomDropdown';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

export default function LibraryView() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourseId, setFilterCourseId] = useState(location.state?.courseId || null);

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', author: '', category: 'General', file: null, container: 'download', download_permission: false, courseId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [activeContainer, setActiveContainer] = useState('download'); // download, secure, wiki
  const [secureResource, setSecureResource] = useState(null);
  const [wikiMarkdown] = useState('');

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewDecision, setReviewDecision] = useState('approved');
  const [globalTasks, setGlobalTasks] = useState([]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/library');
      setResources(data.data || []);
    } catch (err) {
      console.error('Failed to fetch library resources', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      let endpoint = '/courses';
      if (user?.role === 'admin') endpoint = '/admin/courses';
      else if (user?.role === 'instructor') endpoint = '/instructor/courses';
      
      const { data } = await api.get(endpoint);
      setCourses(data.data || []);
    } catch (error) {
      console.error('Failed to fetch courses', error);
    }
  };

  const fetchEnrollmentRequests = async () => {
    try {
      const { data } = await api.get('/enrollments/pending');
      setEnrollmentRequests(data.data || []);
    } catch (error) {
      console.error('Failed to fetch enrollment requests', error);
    }
  };

  useEffect(() => {
    fetchResources();
    fetchCourses();
    fetchEnrollmentRequests();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setUploadData({ ...uploadData, file: e.target.files[0] });
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.title || !uploadData.author || !uploadData.file) return;

    setSubmitting(true);
    setUploadError('');

    try {
      const fileData = new FormData();
      fileData.append('image', uploadData.file); // The server endpoint typically expects "image" or "document" depending on the general upload middleware
      
      const uploadRes = await api.post('/upload', fileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (!uploadRes.data.success) throw new Error('File upload failed on server');
      
      const fileUrl = uploadRes.data.filePath;

      await api.post('/library', {
        title: uploadData.title,
        author: uploadData.author,
        category: uploadData.category,
        container: uploadData.container || 'download',
        courseId: uploadData.courseId || 'general',
        fileUrl: fileUrl,
        status: user?.role === 'admin' ? 'approved' : 'pending',
        isLive: user?.role === 'admin',
        download_permission: uploadData.download_permission,
        wikiMarkdown: uploadData.container === 'wiki' ? wikiMarkdown : ''
      });

      setUploadData({ title: '', author: '', category: 'General', file: null });
      setShowUploadForm(false);
      fetchResources();

    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || 'Error uploading file');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCourseApproval = async (courseId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
      await api.put(`/admin/courses/${courseId}/status`, { status: newStatus });
      setCourses(courses.map(c => c.id === courseId ? { ...c, status: newStatus } : c));
    } catch (err) {
      console.error('Failed to change course status', err);
    }
  };


  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this resource?')) {
      try {
        await api.delete(`/library/${id}`);
        fetchResources();
      } catch (err) {
        console.error('Failed to delete resource', err);
        alert(err.response?.data?.message || 'Error deleting file.');
      }
    }
  };

  const canUpload = user?.role === 'admin' || user?.role === 'instructor';

  const pendingQueue = resources.filter((r) => r.status === 'pending');
  const studentEnrolledCourses = user?.enrolledCourses || [];
  const isBlocked = user?.status === 'blocked';

  const visibleResources = resources.filter((r) => {
    if (user?.role === 'student') {
      return r.status === 'approved' && studentEnrolledCourses.includes(r.courseId);
    }
    if (user?.role === 'parent') {
      return true;
    }
    if (user?.role === 'instructor') {
      return r.uploadedBy === user?.id || r.status === 'approved';
    }
    return true;
  });

  const filteredResources = visibleResources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = filterCourseId ? r.courseId === filterCourseId : true;
    return matchesSearch && matchesCourse;
  });



  const setRoleGlobalTasks = useCallback(() => {
    const tasks = [];
    if (user?.role === 'admin') {
      tasks.push({id:1, title:'Review pending uploads', status:'urgent'});
      tasks.push({id:2, title:'Confirm new course creation approvals', status:'open'});
    }
    if (user?.role === 'instructor') {
      tasks.push({id:3, title:'Submit content for review', status:'due soon'});
      tasks.push({id:4, title:'Grade pending student quizzes', status:'open'});
    }
    if (user?.role === 'student') {
      tasks.push({id:5, title:'Complete next module assignment', status:'upcoming'});
      tasks.push({id:6, title:'Prepare for next quiz', status:'upcoming'});
    }
    if (user?.role === 'parent') {
      tasks.push({id:7, title:'Review child progress report', status:'open'});
      tasks.push({id:8, title:'Check schedule for next week', status:'open'});
    }
    setGlobalTasks(tasks);
  }, [user]);

  useEffect(() => {
    setRoleGlobalTasks();
  }, [setRoleGlobalTasks]);

  const handleSubmitForReview = async (resource) => {
    const patchedResources = resources.map((r) => 
      r.id === resource.id ? { ...r, status: 'pending', adminComments: '' } : r
    );
    setResources(patchedResources);
    if (user?.role === 'instructor') {
      window.alert('Resource submitted to admin for review.');
    }
    setActiveContainer('download');
  };

  const approveEnrollment = async (requestId) => {
    try {
      await api.patch(`/enrollments/${requestId}/approve`);
      setEnrollmentRequests(enrollmentRequests.filter((r) => r.id !== requestId));
      setGlobalTasks((prev) => prev.filter((t) => t.title !== 'Review pending uploads'));
    } catch (err) {
      console.error(err);
    }
  };

  const rejectEnrollment = async (requestId) => {
    try {
      await api.patch(`/enrollments/${requestId}/reject`);
      setEnrollmentRequests(enrollmentRequests.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error(err);
    }
  };



  const toggleDownloadPermission = (resourceId) => {
    setResources((current) => current.map((item) => item.id === resourceId ? {
      ...item,
      download_permission: !item.download_permission
    } : item));
  };


  const openReviewModal = (resource) => {
    setReviewTarget(resource);
    setReviewComment(resource.adminComments || '');
    setReviewModalOpen(true);
    setReviewDecision('approved');
  };

  const handleReviewSubmit = () => {
    if (!reviewTarget) return;
    const updatedResources = resources.map((r) => {
      if (r.id === reviewTarget.id) {
        return {
          ...r,
          status: reviewDecision === 'approved' ? 'approved' : 'rejected',
          adminComments: reviewComment,
        };
      }
      return r;
    });
    setResources(updatedResources);
    setReviewModalOpen(false);
  };

  const selectSecureResource = (resource) => {
    setSecureResource(resource);
  };


  if (loading && resources.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={`w-10 h-10 border-4 border-t-[#FFD700] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className={`min-h-screen flex items-center justify-center backdrop-blur-2xl p-4 ${isDarkMode ? 'bg-[#1E293B]/90' : 'bg-white/95'}`}>
        <div className={`max-w-lg w-full border border-[#FFD700] backdrop-blur-xl p-8 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-[#1E293B]/10' : 'bg-slate-50'}`}>
          <h2 className="text-2xl font-bold text-[#FFD700] mb-3">Account Suspended</h2>
          <p className="text-sm text-slate-100 mb-4">Your account has been temporarily blocked by the administration. Access to Library, Wiki, and Video Player content is disabled.</p>
          <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>If this is a mistake, contact support or your account administrator for reactivation.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto flex flex-col space-y-8 pb-10"
    >
      
      {/* Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 rounded-3xl p-6 md:p-8 bg-gradient-to-br from-white/5 to-transparent border backdrop-blur-xl shadow-2xl relative overflow-hidden ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#00D4FF]/10 via-transparent to-[#F97316]/10 opacity-30 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className={`text-3xl font-display font-bold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Digital Library</h1>
          <p className={`font-medium text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Explore books, research papers, and documents.</p>
        </div>
        <div className="flex flex-col items-end gap-2 w-full md:w-auto relative z-10">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className={`w-5 h-5 absolute left-4 top-3.5 group-focus-within:text-[#FFD700] transition-colors ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 border backdrop-blur-md rounded-xl outline-none focus:border-[#FFD700]/50 focus:ring-1 focus:ring-[#FFD700]/50 transition-all font-semibold placeholder:text-slate-300 shadow-inner ${isDarkMode ? 'border-white/10 bg-[#1E293B]/80 text-white' : 'border-slate-200 bg-white/90 text-slate-900'}`}
              />
            </div>
            {canUpload && !showUploadForm && (
              <button 
                onClick={() => setShowUploadForm(true)}
                className="flex items-center gap-2 bg-[#FFD700] hover:bg-[#EAB308] text-[#0f172a] px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] shrink-0 hover:scale-105"
              >
                <Plus className="w-5 h-5" /> Upload File
              </button>
            )}
          </div>
          {filterCourseId && (
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm backdrop-blur-md">
              Filtered by specific course
              <button onClick={() => setFilterCourseId(null)} className="hover:text-white bg-cyan-500/20 p-1 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>

      {/* Admin Master Architect Dashboard */}
      {user?.role === 'admin' && (
        <div className={`rounded-3xl border p-4 mt-4 shadow-xl ${isDarkMode ? 'border-white/10 bg-[#1E293B]/90' : 'border-slate-200 bg-white/95'}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Admin Master Controller</h3>
            <span className="text-xs py-1 px-3 rounded-lg bg-[#E30A17]/20 text-[#E30A17]">Pending Verifications</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className={`rounded-2xl border p-3 ${isDarkMode ? 'border-white/10 bg-[#1E293B]' : 'border-slate-200 bg-white'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Enrollment Requests</h4>
              {enrollmentRequests.length === 0 ? (
                <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>No pending enrollments.</p>
              ) : enrollmentRequests.map((req) => (
                <div key={req.id} className={`mb-2 p-2 rounded-lg ${isDarkMode ? 'bg-[#1E293B]/5' : 'bg-slate-50'}`}>
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{req.courseTitle}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Student: {req.studentName}</p>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => approveEnrollment(req.id)} className={`px-2 py-1 text-xs rounded-lg bg-[#E67E22] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Approve</button>
                    <button onClick={() => rejectEnrollment(req.id)} className={`px-2 py-1 text-xs rounded-lg bg-[#E30A17] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Reject</button>
                  </div>
                </div>
              ))}
            </div>

            <div className={`rounded-2xl border p-3 ${isDarkMode ? 'border-white/10 bg-[#1E293B]' : 'border-slate-200 bg-white'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Course Approval & Template</h4>
              {courses.length === 0 ? (
                <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>No courses found.</p>
              ) : courses.map((course) => (
                <div key={course.id} className={`mb-2 p-2 rounded-lg border ${isDarkMode ? 'bg-[#1E293B]/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                  <p className={`text-sm font-semibold flex items-center justify-between ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {course.title}
                    <span className={`text-[10px] font-bold   px-2 py-0.5 rounded-md ${course.status === 'approved' ? 'bg-[#E67E22]/20 text-[#E67E22]' : 'bg-[#FFD700]/20 text-[#FFD700]'}`}>
                      {course.status || 'draft'}
                    </span>
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={() => toggleCourseApproval(course.id, course.status)} 
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border hover:-translate-y-0.5 transition-transform ${course.status === 'approved' ? 'bg-[#E30A17]/10 border-[#E30A17]/30 text-[#E30A17]' : 'bg-[#E67E22]/10 border-[#E67E22]/30 text-[#E67E22]'}`}
                    >
                      {course.status === 'approved' ? 'Revoke Approval' : 'Approve Course'}
                    </button>
                    <button 
                      onClick={() => navigate(`/dashboard/builder/${course.id}`)} 
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border hover:border-[#FFD700]/50 hover:text-[#FFD700] transition-colors ${isDarkMode ? 'bg-[#1E293B]/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    >
                      Edit Curriculum
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Global Download Permissions</h4>
            {resources.slice(0, 3).map((res) => (
              <div key={res.id} className={`mb-2 flex items-center justify-between p-2 rounded-lg ${isDarkMode ? 'bg-[#1E293B]/5' : 'bg-slate-50'}`}>
                <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{res.title}</span>
                <button onClick={() => toggleDownloadPermission(res.id)} className={`px-2 py-1 text-xs rounded-lg ${res.download_permission ? 'bg-[#E67E22] ' : 'bg-[#E30A17] '} ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {res.download_permission ? 'Allowed' : 'Blocked'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Three-Container Navigation */}
      <div className={`flex items-center overflow-x-auto scrollbar-hide gap-3 border rounded-2xl p-2 w-max shadow-sm backdrop-blur-md ${isDarkMode ? 'bg-[#1E293B]/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
        {['download', 'secure', 'wiki'].map((key) => (
          <button
            key={key}
            onClick={() => setActiveContainer(key)}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 shrink-0 ${activeContainer === key ? 'bg-[#FFD700] text-[#0f172a] shadow-[0_0_15px_rgba(255,215,0,0.3)]' : 'text-slate-300 hover:bg-[#1E293B]/10 hover:text-white'}`}
          >
            {key === 'download' ? 'Download Vault' : key === 'secure' ? 'Secure Viewer' : 'EDOT Wiki'}
          </button>
        ))}
      </div>

      {/* Upload Form Engine */}
      {showUploadForm && (
        <div className={`rounded-3xl border backdrop-blur-xl p-6 shadow-sm relative overflow-hidden ${isDarkMode ? 'border-white/5 bg-[#1E293B]/5' : 'border-slate-100 bg-slate-50'}`}>
          <div className="flex justify-between items-center mb-6">
             <h2 className={`text-3xl md:text-4xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                 <FileText className="w-8 h-8 text-[#E30A17]" /> Upload New Resource
             </h2>
             <button onClick={() => setShowUploadForm(false)} className={`hover:text-white font-medium text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Cancel</button>
          </div>
          
          {uploadError && (
             <div className="mb-4 bg-rose-500/10 text-rose-600 p-3 rounded-xl flex items-center gap-2 text-sm font-semibold border border-rose-200">
                <AlertCircle className="w-5 h-5" /> {uploadError}
             </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1 md:col-span-1">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Document Title</label>
                    <input 
                      type="text" required placeholder="Advanced Mathematics Vol 2"
                      value={uploadData.title} onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                      className={`w-full border text-base font-normal rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFD700] placeholder-slate-500 ${isDarkMode ? 'bg-[#1E293B] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    />
                </div>
                <div className="space-y-1">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Author / Publisher</label>
                    <input 
                      type="text" required placeholder="John Doe"
                      value={uploadData.author} onChange={(e) => setUploadData({ ...uploadData, author: e.target.value })}
                      className={`w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFD700] font-semibold placeholder-slate-500 ${isDarkMode ? 'bg-[#1E293B] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    />
                </div>
                <div className="space-y-1">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Category</label>
                    <CustomDropdown 
                      value={uploadData.category}
                      onChange={(val) => setUploadData({ ...uploadData, category: val })}
                      options={[
                        { label: 'General Education', value: 'General' },
                        { label: 'Science & Technology', value: 'Science' },
                        { label: 'Mathematics', value: 'Mathematics' },
                        { label: 'Literature & Languages', value: 'Literature' },
                        { label: 'History & Social Science', value: 'History' },
                        { label: 'Research Papers', value: 'Research' },
                        { label: 'Curriculum / Syllabus', value: 'Syllabus' }
                      ]}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>File Attachment</label>
                <div className={`relative border-2 border-dashed rounded-2xl p-6 bg-[#1E293B]/50 hover:bg-[#1E293B]/5 transition-colors group cursor-pointer ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                    <input 
                      type="file" 
                      required
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className="flex flex-col items-center justify-center text-center space-y-2">
                       <div className={`w-12 h-12 rounded-full text-[#E30A17] flex items-center justify-center group-hover:scale-110 transition-transform ${isDarkMode ? 'bg-[#1E293B]/5' : 'bg-slate-50'}`}>
                          <Download className="w-6 h-6" />
                       </div>
                       <div>
                         {uploadData.file ? (
                            <p className="font-bold text-[#FFD700]">{uploadData.file.name}</p>
                         ) : (
                            <p className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Drag & Drop your file here, or click to browse</p>
                         )}
                         <p className="text-xs text-gray-500 mt-2">Supports PDF, DOCX, PPTX (Max 10MB)</p>
                       </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className={`hover:shadow-[#00D4FF]/20 px-6 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all w-full sm:w-auto disabled:opacity-70 bg-[#F97316] hover:bg-[#CF711F] shadow-md border border-[#F97316] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Save to Library</>}
                </button>
            </div>
          </form>
        </div>
      )}

      {/* Container Display */}
      {activeContainer === 'download' && (
        <>
          {filteredResources.length === 0 && !showUploadForm ? (
            <div className={`p-12 text-center rounded-3xl border backdrop-blur-xl shadow-sm flex flex-col items-center justify-center ${isDarkMode ? 'border-white/5 bg-[#1E293B]/5' : 'border-slate-100 bg-slate-50'}`}>
              <div className={`w-20 h-20 border rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-[#1E293B]/5 text-slate-200 border-white/10' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                <BookOpen className="w-10 h-10" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No downloadable resources found</h3>
              <p className={`max-w-sm mb-6 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No downloads available for your role or access level currently.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
              {filteredResources.map((resource) => {
                const isOwner = resource.uploadedBy === user?.id || user?.role === 'admin';
                const canDownload = user?.role !== 'student' || resource.permission === 'granted';
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    key={resource.id} 
                    className={`rounded-3xl border backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col group hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all relative ${isDarkMode ? 'border-white/10 bg-[#1E293B]/90' : 'border-slate-200 bg-white/95'}`}
                  >
                    {isOwner && (
                      <button
                        onClick={() => handleDelete(resource.id)}
                        title="Delete Resource"
                        className={`absolute top-3 right-3 hover:bg-[#E30A17]/20 text-[#E30A17] border border-transparent hover:border-[#E30A17]/30 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm backdrop-blur ${isDarkMode ? 'bg-[#1E293B]/10' : 'bg-slate-50'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className={`h-40 flex items-center justify-center relative overflow-hidden group-hover:bg-[#FFD700]/5 transition-colors ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
                      <FileText className="w-16 h-16 text-[#FFD700]/20 group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute bottom-3 left-3 bg-[#E67E22]/20 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-[#E67E22] shadow-sm border border-[#E67E22]/20">
                        {resource.fileUrl?.split('.').pop()?.toUpperCase() || 'FILE'}
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex gap-2 items-center mb-3">
                          <span className="text-[10px] font-bold text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/20 px-3 py-1.5 rounded-lg   shadow-sm">
                            {resource.category || 'General'}
                          </span>
                        </div>
                        <h3 className={`font-bold text-xl line-clamp-2 leading-snug mb-1.5 group-hover:text-[#FFD700] transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`} title={resource.title}>{resource.title}</h3>
                        <p className={`text-sm font-medium mb-5 line-clamp-1 border-b pb-4 ${isDarkMode ? 'text-slate-200 border-white/10' : 'text-slate-600 border-slate-200'}`}>By <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>{resource.author}</span></p>
                      </div>

                      <div className="space-y-3">
                        {canDownload ? (
                          <a
                            href={resource.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block text-center py-2.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#0099CC] font-bold hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all border border-[#F97316]/50 hover:-translate-y-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                          >
                            <Download className="w-4 h-4 inline-block mr-2" /> Download Document
                          </a>
                        ) : (
                          <button className={`w-full py-2.5 rounded-xl border font-semibold transition-colors bg-[#E67E22] hover:bg-[#CF711F] shadow-md border-[#E67E22] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Request Access</button>
                        )}
                        {user?.role === 'instructor' && resource.uploadedBy === user?.id && resource.status === 'draft' && (
                          <button onClick={() => handleSubmitForReview(resource)} className="w-full py-2.5 rounded-xl bg-[#E67E22]/20 text-[#E67E22] border border-[#E67E22]/30 font-bold hover:bg-[#E67E22]/30 transition-all">Submit for Review</button>
                        )}
                        {user?.role === 'admin' && resource.status === 'pending' && (
                          <button onClick={() => openReviewModal(resource)} className="w-full py-2.5 rounded-xl bg-[#E30A17]/20 text-[#E30A17] border border-[#E30A17]/30 font-bold hover:bg-[#E30A17]/30 transition-all">Review Needed</button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {activeContainer === 'secure' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
          <div className={`rounded-3xl border p-4 ${isDarkMode ? 'border-white/10 bg-[#1E293B]/5' : 'border-slate-200 bg-slate-50'}`}>
            <h2 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Secure Viewer Resources</h2>
            {filteredResources.length === 0 ? (
              <p className={isDarkMode ? 'text-slate-200' : 'text-slate-600'}>No secure documents for your account.</p>
            ) : (
              <div className="space-y-2">
                {filteredResources.map((resource) => (
                  <button
                    key={resource.id}
                    onClick={() => selectSecureResource(resource)}
                    className={`w-full text-left px-3 py-2 rounded-lg ${secureResource?.id === resource.id ? 'bg-cyan-500 ' : 'bg-[#1E293B]/10 text-slate-100 hover:bg-[#1E293B]/20'} ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {resource.title}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={`rounded-3xl border p-4 ${isDarkMode ? 'border-white/10 bg-[#1E293B]/5' : 'border-slate-200 bg-slate-50'}`} onContextMenu={(e) => user?.role === 'student' && e.preventDefault()}>
            <h2 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Secure Document Reader</h2>
            {secureResource ? (
              <iframe
                src={secureResource.fileUrl}
                title={secureResource.title}
                className={`w-full h-96 border rounded-lg ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}
                sandbox="allow-same-origin allow-scripts"
              />
            ) : (
              <p className={isDarkMode ? 'text-slate-200' : 'text-slate-600'}>Select a resource from the list to preview in the secure reader.</p>
            )}
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Right-click is blocked in this viewer for students.</p>
          </div>
        </div>
      )}

      {activeContainer === 'wiki' && (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <aside className={`w-full lg:w-72 shrink-0 rounded-3xl border overflow-hidden shadow-2xl sticky top-24 ${isDarkMode ? 'border-white/10 bg-[#1E293B]' : 'border-slate-200 bg-white'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/5 bg-[#1E293B]/50' : 'border-slate-100 bg-slate-50'}`}>
              <h2 className={`font-bold text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <BookOpen className="w-5 h-5 text-[#FFD700]" />
                EDOT Wiki
              </h2>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Official Documentation</p>
            </div>
            <div className="p-4">
              <p className="text-[10px] font-bold text-slate-500   mb-3 px-3">Topics</p>
              <ul className="space-y-1 text-sm font-medium">
                <li>
                  <a href="#overview" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1E293B]/60 hover:text-white transition-all group ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                    <BookOpen className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" /> 
                    Overview
                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
                <li>
                  <a href="#workflows" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1E293B]/60 hover:text-white transition-all group ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                    <GitMerge className="w-4 h-4 text-slate-500 group-hover:text-[#E67E22]" /> 
                    Workflows
                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
                <li>
                  <a href="#roles" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1E293B]/60 hover:text-white transition-all group ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                    <Shield className="w-4 h-4 text-slate-500 group-hover:text-[#E30A17]" /> 
                    Role Permissions
                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
                <li>
                  <a href="#submission" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1E293B]/60 hover:text-white transition-all group ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                    <FileSignature className="w-4 h-4 text-slate-500 group-hover:text-[#FFD700]" /> 
                    Submission Rules
                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              </ul>
            </div>
          </aside>
          
          <section className={`flex-1 rounded-3xl border shadow-2xl overflow-hidden ${isDarkMode ? 'border-white/10 bg-[#1E293B]' : 'border-slate-200 bg-white'}`}>
            <div className="p-8 lg:p-14 max-w-4xl mx-auto space-y-16">
              
              {/* Header section */}
              <div className={`border-b pb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full border text-xs font-semibold ${isDarkMode ? 'bg-[#1E293B]/50 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                  <Globe className="w-3.5 h-3.5" /> Documentation v2.1
                </div>
                <h1 className={`text-4xl lg:text-5xl font-display font-bold tracking-tight mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Library & Wiki Architecture</h1>
                <p className={`text-lg leading-relaxed max-w-2xl ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Comprehensive guide on how content flows through the EDOT ecosystem, from creation to secure consumption.
                </p>
              </div>

              {/* Overview */}
              <article id="overview" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-sm">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>System Overview</h2>
                </div>
                <div className={`prose-like leading-relaxed space-y-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                  <p>
                    The EDOT Library is an advanced, multi-container digital resource hub engineered to safely host, distribute, and manage educational assets.
                  </p>
                  <p>
                    Unlike standard file repositories, this system employs a segmented architecture allowing distinct access rules per container. Assets natively classify into one of three primary tiers:
                  </p>
                  <ul className="mt-4 space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0"></span>
                      <span><strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Download Vault:</strong> Public or course-restricted assets that can be saved offline.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E67E22] mt-2 shrink-0"></span>
                      <span><strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Secure Viewer:</strong> Encrypted, view-only documents that prevent downloading or right-clicking.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] mt-2 shrink-0"></span>
                      <span><strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Wiki Engine:</strong> Markdown-based internal documentation living natively inside the platform.</span>
                    </li>
                  </ul>
                </div>
              </article>

              {/* Workflows */}
              <article id="workflows" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#E67E22]/10 border border-[#E67E22]/20 flex items-center justify-center text-[#E67E22] shadow-sm">
                    <GitMerge className="w-5 h-5" />
                  </div>
                  <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Content Workflows</h2>
                </div>
                <div className={`p-6 rounded-2xl border leading-relaxed mb-6 ${isDarkMode ? 'bg-[#1E293B]/40 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                  <div className="flex flex-col md:flex-row items-center gap-4 text-sm font-semibold">
                    <div className={`px-4 py-2 bg-[#1E293B] rounded-lg border border-slate-600 w-full md:w-auto text-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Instructor Upload</div>
                    <ChevronRight className="w-5 h-5 text-slate-500 hidden md:block" />
                    <div className="px-4 py-2 bg-amber-900/50 rounded-lg text-amber-200 border border-amber-500/30 w-full md:w-auto text-center">Admin Review</div>
                    <ChevronRight className="w-5 h-5 text-slate-500 hidden md:block" />
                    <div className="px-4 py-2 bg-[#E67E22]/20 rounded-lg text-emerald-300 border border-[#E67E22]/30 w-full md:w-auto text-center">Published Live</div>
                  </div>
                </div>
                <p className={`leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                  Materials strictly move through a chronological pipeline to ensure educational standards are met. Instructors initialize the content stream by uploading materials which instantly route into the <strong>Pending Verification</strong> queue. System Administrators utilize their Master Dashboard to audit files before committing them live. 
                </p>
              </article>

              {/* Roles */}
              <article id="roles" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#E30A17]/10 border border-[#E30A17]/20 flex items-center justify-center text-[#E30A17] shadow-sm">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Role Definitions</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-5 rounded-2xl bg-gradient-to-br from-[#11151F] to-[#0B0E14] border hover:border-white/10 transition-colors ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                    <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}><Lock className="w-4 h-4 text-[#E30A17]" /> Administrators</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total system autonomy. Capabilities span across executing global overrides, approving cross-domain enrollments, and permanent deletion of system traces.</p>
                  </div>
                  <div className={`p-5 rounded-2xl bg-gradient-to-br from-[#11151F] to-[#0B0E14] border hover:border-white/10 transition-colors ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                    <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}><FileText className="w-4 h-4 text-cyan-400" /> Instructors</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Content architects. Authorized to originate course materials and manipulate internal asset visibility rules prior to publishing.</p>
                  </div>
                  <div className={`p-5 rounded-2xl bg-gradient-to-br from-[#11151F] to-[#0B0E14] border hover:border-white/10 transition-colors ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                    <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}><BookOpen className="w-4 h-4 text-[#FFD700]" /> Students</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Consumption layer. Bound by dynamic visibility parameters. Cannot access raw files if flagged entirely for Secure Display by instructors.</p>
                  </div>
                  <div className={`p-5 rounded-2xl bg-gradient-to-br from-[#11151F] to-[#0B0E14] border hover:border-white/10 transition-colors ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                    <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}><Eye className="w-4 h-4 text-[#E67E22]" /> Parents</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Telemetry observers. Possess read-only overview access to monitor the progression of connected student nodes in real-time.</p>
                  </div>
                </div>
              </article>

            </div>
          </section>
        </div>
      )}

      {/* Pending Queue for Admin only */}
      {user?.role === 'admin' && (
        <div className={`rounded-3xl border p-4 mt-4 ${isDarkMode ? 'border-white/10 bg-[#1E293B]/5' : 'border-slate-200 bg-slate-50'}`}>
          <h3 className={`font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Pending Approval Queue</h3>
          {pendingQueue.length === 0 ? (
            <p className={isDarkMode ? 'text-slate-200' : 'text-slate-600'}>No items are pending approval.</p>
          ) : pendingQueue.map((item) => (
            <div key={item.id} className={`mb-2 p-3 border rounded-xl ${isDarkMode ? 'border-white/10 bg-[#1E293B]/80' : 'border-slate-200 bg-white/90'}`}>
              <div className="flex justify-between items-center">
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</p>
                <button onClick={() => openReviewModal(item)} className={`px-2 py-1 text-xs rounded-lg bg-[#E30A17] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Review</button>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Uploaded by {item.author} | Category: {item.category}</p>
            </div>
          ))}
        </div>
      )}

      {reviewModalOpen && reviewTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className={`w-full max-w-xl border rounded-3xl p-6 ${isDarkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white border-slate-200'}`}>
            <h4 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Review & Comment</h4>
            <p className={`text-sm mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Resource: {reviewTarget.title}</p>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className={`w-full h-28 p-3 rounded-xl border outline-none mb-3 ${isDarkMode ? 'bg-[#1E293B] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
              placeholder="Leave feedback or request corrections..."
            />
            <div className="flex gap-2 mb-4">
              <button onClick={() => setReviewDecision('approved')} className={`px-3 py-2 rounded-lg text-sm ${reviewDecision === 'approved' ? 'bg-[#E67E22] ' : 'bg-[#1E293B]/10 '} ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Approve</button>
              <button onClick={() => setReviewDecision('rejected')} className={`px-3 py-2 rounded-lg text-sm ${reviewDecision === 'rejected' ? 'bg-[#E30A17] ' : 'bg-[#1E293B]/10 '} ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Reject</button>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setReviewModalOpen(false)} className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-[#1E293B]/10 text-white' : 'bg-slate-50 text-slate-900'}`}>Cancel</button>
              <button onClick={handleReviewSubmit} className={`px-4 py-2 rounded-lg bg-[#E67E22] hover:bg-[#CF711F] shadow-md border border-[#E67E22] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Submit</button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}

