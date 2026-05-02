import React, { useState, useEffect, useCallback } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { 
  ArrowLeft, CheckCircle2, ChevronRight, Save, 
  BookOpen, LayoutList, DollarSign, PlusCircle, Banknote,
  PlayCircle, Trash2, Tag, Image as ImageIcon, Send, FileText
} from 'lucide-react';
import QuizBuilder from '../components/QuizBuilder';
import ReactPlayer from 'react-player';
import CustomDropdown from '../components/CustomDropdown';
import { useAuth } from '../context/AuthContext';
import { courseDropdownOptions } from '../constants/courseCategories';

export default function InstructorCourseBuilder() {
  const isDarkMode = useThemeMode();
  const navigate = useNavigate();
  const { id } = useParams(); // If editing an existing course
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [courseId, setCourseId] = useState(id || null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Social Science',
    level: 'Beginner',
    duration: 1,
    thumbnail: '',
    videoUrl: '',
    price: 0,
    requirements: [''],
    whatYouWillLearn: [''],
    tags: [''],
    isExamRequired: false,
    finalExam: []
  });

  const [lessons, setLessons] = useState([]);
  const [phases, setPhases] = useState([]); // List of string phase names
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', videoUrl: '', duration: 10, readingMaterials: '', quiz: [], phase: '' });
  const [showLessonFormForPhase, setShowLessonFormForPhase] = useState(null); // Phase name to show form for
  const [newPhaseName, setNewPhaseName] = useState('');
  const [showPhaseInput, setShowPhaseInput] = useState(false);
  const [lastFetchedDurationUrl, setLastFetchedDurationUrl] = useState('');

  const resolveVideoUrl = (url) => {
    if (!url) return '';
    let cleanUrl = url.trim();
    const iframeMatch = cleanUrl.match(/<iframe.*?src=["'](.*?)["']/i);
    if (iframeMatch) cleanUrl = iframeMatch[1];
    cleanUrl = cleanUrl.replace(/\\/g, '/');

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
       if (cleanUrl.startsWith('www.')) cleanUrl = `https://${cleanUrl}`;
       else if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) cleanUrl = `https://${cleanUrl}`;
       else cleanUrl = `http://localhost:5000${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
    }

    if (cleanUrl.includes('cloudinary.com')) {
      cleanUrl = cleanUrl.replace(/^http:\/\//i, 'https://');
      cleanUrl = cleanUrl.replace(/\/(image|raw)\/upload\//, '/video/upload/');
      cleanUrl = cleanUrl.replace(/\.(mkv|mov|avi|webm)$/i, '.mp4');
      if (!cleanUrl.match(/\.[a-z0-9]{3,4}$/i)) cleanUrl += '.mp4';
    }
    return cleanUrl;
  };

  const fetchCourseDetails = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/courses/${courseId}/content`);
      if (data.course) {
        setFormData({
          title: data.course.title || '',
          description: data.course.description || '',
          category: data.course.mainCategory || data.course.category || 'Social Science',
          level: data.course.level || 'Beginner',
          duration: data.course.duration || 1,
          thumbnail: data.course.thumbnail || '',
          videoUrl: data.course.videoUrl || '',
          price: data.course.price || 0,
          requirements: data.course.requirements?.length ? data.course.requirements : [''],
          whatYouWillLearn: data.course.whatYouWillLearn?.length ? data.course.whatYouWillLearn : [''],
          tags: data.course.tags?.length ? data.course.tags : [''],
          isExamRequired: data.course.isExamRequired || false,
          finalExam: data.course.finalExam || []
        });
        const courseLessons = data.course.lessons || [];
        setLessons(courseLessons);
        
        const uniquePhases = [...new Set(courseLessons.map(l => l.phase).filter(Boolean))];
        if (uniquePhases.length > 0) {
          setPhases(uniquePhases);
        }
      }
    } catch (err) {
      console.error('Failed to fetch course details', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId, fetchCourseDetails]);

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray.length ? newArray : [''] });
  };

  const saveCourseData = async () => {
    setSaving(true);
    try {
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter(item => item.trim() !== ''),
        whatYouWillLearn: formData.whatYouWillLearn.filter(item => item.trim() !== ''),
        tags: formData.tags.filter(item => item.trim() !== '')
      };

      if (!courseId) {
        const { data } = await api.post('/instructor/courses', cleanedData);
        setCourseId(data.data.id);
        navigate(`/dashboard/builder/${data.data.id}`, { replace: true });
      } else {
        await api.put(`/instructor/courses/${courseId}`, cleanedData);
      }
      return true;
    } catch (err) {
      console.error('Failed to save course', err);
      alert(err.response?.data?.message || 'Failed to save course details');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const nextStep = async () => {
    if (currentStep === 1 || currentStep === 2) {
      const success = await saveCourseData();
      if (success) setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = async () => {
    await saveCourseData();
    setCurrentStep(currentStep - 1);
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!courseId) return;
    
    setSaving(true);
    try {
      const { data } = await api.post(`/instructor/courses/${courseId}/lessons`, {
        ...lessonForm,
        phase: showLessonFormForPhase
      });
      setLessons([...lessons, data.data]);
      setLessonForm({ title: '', description: '', videoUrl: '', duration: 10, readingMaterials: '', quiz: [], phase: '' });
      setShowLessonFormForPhase(null);
    } catch (err) {
      console.error('Failed to add lesson', err);
      alert(err.response?.data?.message || 'Failed to add lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPhase = () => {
    if (newPhaseName.trim() && !phases.includes(newPhaseName.trim())) {
      setPhases([...phases, newPhaseName.trim()]);
    }
    setNewPhaseName('');
    setShowPhaseInput(false);
  };

  const handleSubmitForReview = async () => {
    const success = await saveCourseData();
    if (success && courseId) {
      setSaving(true);
      try {
        await api.put(`/instructor/courses/${courseId}/submit`);
        navigate('/dashboard/my-courses'); // Go back to dashboard after submitting
      } catch (err) {
        console.error('Failed to submit course', err);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setSaving(true);
    setUploadProgress(prev => ({ ...prev, [field]: 1 }));
    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [field]: percentCompleted }));
        }
      });
      if (data.success) {
        if (field === 'courseVideoUrl') {
          // Course level videoUrl
          setFormData(prev => ({ 
            ...prev, 
            videoUrl: data.secure_url
          }));
        } else if (field === 'videoUrl') {
          // Lesson form videoUrl
          setLessonForm(prev => ({ 
            ...prev, 
            videoUrl: data.secure_url,
            duration: data.duration ? Math.ceil(data.duration / 60) : prev.duration
          }));
        } else if (field === 'readingMaterials') {
          const docLink = `[Attached Resource: ${file.name}](${data.secure_url})`;
          setLessonForm(prev => ({ 
            ...prev, 
            readingMaterials: prev.readingMaterials 
              ? `${prev.readingMaterials}\n\n${docLink}` 
              : docLink
          }));
        } else if (field === 'thumbnail') {
          setFormData(prev => ({ ...prev, thumbnail: data.secure_url }));
        }
      }
    } catch (err) {
      console.error('Upload failed', err);
      alert(err.response?.data?.message || 'Failed to upload file. Please try again.');
    } finally {
      setSaving(false);
      setUploadProgress(prev => ({ ...prev, [field]: 0 }));
      if (e.target && e.target.value !== undefined) {
        e.target.value = ''; // Reset input
      }
    }
  };

  const handleDrag = (e, field) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [field]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleDrop = (e, field) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [field]: false }));
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload({ target: { files: e.dataTransfer.files } }, field);
    }
  };

  const steps = [
    { title: 'Information', icon: <BookOpen className="w-5 h-5" /> },
    { title: 'Details', icon: <Tag className="w-5 h-5" /> },
    { title: 'Curriculum', icon: <LayoutList className="w-5 h-5" /> },
    { title: 'Pricing', icon: <Banknote className="w-5 h-5" /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="w-12 h-12 border-4 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-[#1E293B] text-white' : 'bg-white text-slate-900'}`}>
      {/* Top Navbar specifically for the builder */}
      <header className={`border-b bg-[#1E293B] sticky top-0 z-30 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm font-medium">
            <button 
              onClick={() => navigate('/dashboard/my-courses')}
              className={`hover:text-white transition-colors flex items-center gap-1.5 pr-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <span className="text-white/20">|</span>
            <span className="text-[#FFD700]">Create Course</span>
            <span className="text-white/20">/</span>
            <span className={`font-semibold truncate max-w-[150px] sm:max-w-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formData.title || 'Untitled Course'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-xs font-medium flex items-center gap-1.5 hidden sm:flex ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {saving ? 'Saving...' : 'Draft saved'} {!saving && <CheckCircle2 className="w-3.5 h-3.5 text-[#00D4FF]" />}
            </span>
            <button 
              onClick={saveCourseData}
              disabled={saving}
              className={`inline-flex items-center gap-1.5 px-4 py-2 font-semibold rounded-lg transition-colors text-sm disabled:opacity-50 bg-[#E67E22] hover:bg-[#CF711F] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
            >
               {saving ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Progress Steps */}
          <div className="mb-10 px-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/10 -z-10"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-[#FFD700] to-[#E30A17] -z-10 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              ></div>
              
              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isActive = stepNum === currentStep;
                const isCompleted = stepNum < currentStep;
                
                return (
                  <div key={idx} className={`flex items-center gap-3 px-2 ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                      isActive ? 'bg-[#1E293B] text-[#FFD700] border-2 border-[#FFD700]' : 
                      isCompleted ? 'bg-[#E67E22] text-white border-2 border-[#E67E22]' : 'bg-[#1E293B] text-slate-400 border border-white/20'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                    </div>
                    <span className={`text-sm font-semibold hidden sm:block ${isActive ? 'text-[#FFD700]' : isCompleted ? 'text-[#E67E22]' : 'text-slate-400'}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Area */}
          <div key={currentStep} className={`bg-[#1E293B] border rounded-2xl overflow-hidden mb-8 relative animate-in fade-in zoom-in-95 duration-500 flex flex-col h-[calc(100vh-300px)] min-h-[500px] ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
            <div className="p-6 md:p-8 relative z-10 overflow-y-auto flex-1 scrollbar-thin">
              
              {/* STEP 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className={`text-2xl font-display font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>General Information</h2>
                  
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Course Title <span className="text-[#E30A17]">*</span></label>
                    <input 
                      type="text" 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      required 
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-1 focus:ring-[#FFD700] focus:border-[#FFD700] outline-none transition-all placeholder:text-slate-300 font-semibold ${isDarkMode ? 'bg-[#1E293B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`} 
                      placeholder="E.g., Complete Modern JavaScript Bootcamp" 
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Detailed Description <span className="text-[#E30A17]">*</span></label>
                    <textarea 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      required 
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-1 focus:ring-[#FFD700] focus:border-[#FFD700] outline-none transition-all resize-y placeholder:text-slate-300 font-medium ${isDarkMode ? 'bg-[#1E293B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`} 
                      rows="4" 
                      placeholder="What will students learn in this course? Detail the curriculum and learning outcomes."
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Category</label>
                      <CustomDropdown
                        value={formData.category}
                        onChange={(val) => {
                          const isNewSchool = val === 'Social Science' || val === 'Mathematics & Natural Science';
                          const isOldSchool = formData.category === 'Social Science' || formData.category === 'Mathematics & Natural Science';
                          
                          let newLevel = formData.level;
                          if (isNewSchool && !isOldSchool) {
                            newLevel = 'Grade 7';
                          } else if (!isNewSchool && isOldSchool) {
                            newLevel = 'Beginner';
                          }
                          setFormData({...formData, category: val, level: newLevel});
                        }}
                        options={courseDropdownOptions}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Level</label>
                      <CustomDropdown
                        value={formData.level}
                        onChange={(val) => setFormData({...formData, level: val})}
                        options={
                          (formData.category === 'Social Science' || formData.category === 'Mathematics & Natural Science') 
                            ? [
                                { label: 'Grade 7', value: 'Grade 7' },
                                { label: 'Grade 8', value: 'Grade 8' },
                                { label: 'Grade 9', value: 'Grade 9' },
                                { label: 'Grade 10', value: 'Grade 10' },
                                { label: 'Grade 11', value: 'Grade 11' },
                                { label: 'Grade 12', value: 'Grade 12' }
                              ]
                            : [
                                { label: 'Beginner', value: 'Beginner' },
                                { label: 'Intermediate', value: 'Intermediate' },
                                { label: 'Advanced', value: 'Advanced' },
                                { label: 'All Levels', value: 'All Levels' }
                              ]
                        }
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Duration (Hours) <span className="text-[#E30A17]">*</span></label>
                      <input 
                        type="number" 
                        min="1" 
                        value={formData.duration} 
                        onChange={e => setFormData({...formData, duration: Number(e.target.value)})} 
                        required 
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-1 focus:ring-[#FFD700] focus:border-[#FFD700] outline-none transition-all font-semibold ${isDarkMode ? 'bg-[#1E293B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Media & Details */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <h2 className={`text-2xl font-display font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Media & Additional Details</h2>
                  
                  <div>
                    <label className={`block text-sm font-bold mb-2 flex items-center justify-between ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                      <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4 text-[#FFD700]" /> Course Thumbnail URL</span>
                      <label 
                        className={`cursor-pointer text-xs font-bold transition-all px-3 py-1 rounded-md border flex items-center gap-1 ${dragActive.thumbnail ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]' : 'border-transparent text-[#FFD700] hover:text-white'}`}
                        onDragEnter={(e) => handleDrag(e, 'thumbnail')}
                        onDragLeave={(e) => handleDrag(e, 'thumbnail')}
                        onDragOver={(e) => handleDrag(e, 'thumbnail')}
                        onDrop={(e) => handleDrop(e, 'thumbnail')}
                      >
                        {uploadProgress.thumbnail ? `Uploading... ${uploadProgress.thumbnail}%` : 'Upload Image / Drop Here'}
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, 'thumbnail')} 
                          disabled={saving}
                        />
                      </label>
                    </label>
                    <input 
                      type="url" 
                      value={formData.thumbnail} 
                      onChange={e => setFormData({...formData, thumbnail: e.target.value})} 
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-1 focus:ring-[#FFD700] focus:border-[#FFD700] outline-none transition-all placeholder:text-slate-300 font-medium ${isDarkMode ? 'bg-[#1E293B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`} 
                      placeholder="https://example.com/beautiful-course-cover.jpg" 
                    />
                    {formData.thumbnail && (
                      <div className={`mt-4 rounded-xl overflow-hidden shadow-sm border max-w-sm h-48 bg-black/50 relative ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                        <img src={formData.thumbnail} alt="Thumbnail Preview" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80' }} />
                      </div>
                    )}
                  </div>

                  {/* Course Video URL */}
                  <div>
                    <label className={`block text-sm font-bold mb-2 flex items-center justify-between ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                      <span className="flex items-center gap-2"><PlayCircle className="w-4 h-4 text-[#FFD700]" /> Course Video URL (Intro)</span>
                      <label 
                        className={`cursor-pointer text-xs font-bold transition-all px-3 py-1 rounded-md border flex items-center gap-1 ${dragActive.courseVideoUrl ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]' : 'border-transparent text-[#FFD700] hover:text-white'}`}
                        onDragEnter={(e) => handleDrag(e, 'courseVideoUrl')}
                        onDragLeave={(e) => handleDrag(e, 'courseVideoUrl')}
                        onDragOver={(e) => handleDrag(e, 'courseVideoUrl')}
                        onDrop={(e) => handleDrop(e, 'courseVideoUrl')}
                      >
                        {uploadProgress.courseVideoUrl ? `Uploading... ${uploadProgress.courseVideoUrl}%` : 'Upload Video / Drop'}
                        <input 
                          type="file" 
                          accept="video/*"
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, 'courseVideoUrl')} 
                          disabled={saving}
                        />
                      </label>
                    </label>
                    <input 
                      type="url" 
                      value={formData.videoUrl} 
                      onChange={e => setFormData({...formData, videoUrl: e.target.value})} 
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-1 focus:ring-[#FFD700] focus:border-[#FFD700] outline-none transition-all placeholder:text-slate-300 font-medium ${isDarkMode ? 'bg-[#1E293B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`} 
                      placeholder="https://res.cloudinary.com/.../video.mp4" 
                    />
                    {formData.videoUrl && (
                      <div className={`mt-4 rounded-xl overflow-hidden shadow-sm border aspect-video bg-black/50 relative ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                        <video src={resolveVideoUrl(formData.videoUrl)} controls className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none' }} />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* What You'll Learn */}
                    <div>
                      <label className={`block text-sm font-bold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>What will students learn?</label>
                      {formData.whatYouWillLearn.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 mb-3">
                          <input 
                            type="text" 
                            value={item}
                            onChange={(e) => handleArrayChange('whatYouWillLearn', index, e.target.value)}
                            className={`flex-1 px-4 py-2.5 rounded-lg border focus:ring-1 focus:ring-[#FFD700] focus:border-[#FFD700] outline-none transition-all text-sm placeholder:text-slate-300 ${isDarkMode ? 'bg-[#1E293B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`}
                            placeholder={`Learning outcome ${index + 1}`}
                          />
                          <button 
                            onClick={() => removeArrayItem('whatYouWillLearn', index)}
                            className={`p-2.5 hover:text-[#E30A17] hover:bg-[#E30A17]/10 rounded-lg transition-colors border border-transparent hover:border-[#E30A17]/20 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => addArrayItem('whatYouWillLearn')}
                        className="text-sm font-bold text-[#FFD700] hover:text-[#FFD700]/80 flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-4 h-4" /> Add Outcome
                      </button>
                    </div>

                    {/* Requirements */}
                    <div>
                      <label className={`block text-sm font-bold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Prerequisites / Requirements</label>
                      {formData.requirements.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 mb-3">
                          <input 
                            type="text" 
                            value={item}
                            onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                            className={`flex-1 px-4 py-2.5 rounded-lg border focus:ring-1 focus:ring-[#FFD700] focus:border-[#FFD700] outline-none transition-all text-sm placeholder:text-slate-300 ${isDarkMode ? 'bg-[#1E293B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`}
                            placeholder={`Requirement ${index + 1}`}
                          />
                          <button 
                            onClick={() => removeArrayItem('requirements', index)}
                            className={`p-2.5 hover:text-[#E30A17] hover:bg-[#E30A17]/10 rounded-lg transition-colors border border-transparent hover:border-[#E30A17]/20 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => addArrayItem('requirements')}
                        className="text-sm font-bold text-[#FFD700] hover:text-[#FFD700]/80 flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-4 h-4" /> Add Requirement
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* STEP 3: Curriculum */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className={`text-2xl font-display font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Curriculum Builder</h2>
                  <p className={`mb-6 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Organize your course content into phases and video lessons.</p>
                  
                  {phases.length > 0 ? (
                    <div className="space-y-6 mb-8">
                      {phases.map((phase, pIdx) => {
                        const phaseLessons = lessons.filter(l => l.phase === phase);
                        return (
                          <div key={pIdx} className="bg-[#1E293B]/30 border border-[#FFD700]/20 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-[#1E293B]/80 p-4 border-b border-[#FFD700]/20 flex items-center justify-between">
                              <h3 className="font-bold text-[#FFD700] text-lg flex items-center gap-2">
                                <LayoutList className="w-5 h-5" /> {phase}
                              </h3>
                              <span className={`text-xs font-medium px-3 py-1 rounded-full border ${isDarkMode ? 'text-slate-400 bg-[#1E293B] border-white/10' : 'text-slate-500 bg-white border-slate-200'}`}>
                                {phaseLessons.length} {phaseLessons.length === 1 ? 'Lesson' : 'Lessons'}
                              </span>
                            </div>
                            
                            <div className="p-4 space-y-3 bg-[#1E293B]/40">
                              {phaseLessons.length > 0 ? (
                                phaseLessons.map((lesson, idx) => (
                                  <div key={lesson.id || idx} className={`border hover:border-white/20 p-4 rounded-xl flex items-center gap-4 transition-colors ${isDarkMode ? 'bg-[#1E293B]/50 border-white/5' : 'bg-slate-100 border-slate-100'}`}>
                                    <div className="w-8 h-8 rounded-full bg-[#E67E22]/10 text-[#E67E22] flex items-center justify-center shrink-0 font-bold border border-[#E67E22]/20 text-sm">
                                      {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className={`font-bold truncate text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{lesson.title}</h4>
                                    </div>
                                    <div className={`text-xs flex items-center gap-1.5 font-medium shrink-0 px-2.5 py-1.5 rounded-lg border ${isDarkMode ? 'text-slate-300 bg-[#1E293B] border-white/5' : 'text-slate-500 bg-white border-slate-100'}`}>
                                      <PlayCircle className="w-3.5 h-3.5 text-[#FFD700]" /> {lesson.duration}m
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className={`text-sm text-center py-4 border border-dashed rounded-xl bg-[#1E293B]/50 ${isDarkMode ? 'text-slate-400 border-white/10' : 'text-slate-500 border-slate-200'}`}>No lessons in this phase yet.</p>
                              )}
                              
                              {showLessonFormForPhase !== phase && (
                                <button 
                                  onClick={() => setShowLessonFormForPhase(phase)}
                                  className={`w-full py-3 mt-2 border border-dashed border-[#FFD700]/30 rounded-xl text-[#FFD700] text-sm font-bold hover:bg-[#FFD700]/10 transition-colors flex items-center justify-center gap-1.5 ${isDarkMode ? 'bg-[#1E293B]/40' : 'bg-slate-50'}`}
                                >
                                  <PlusCircle className="w-4 h-4" /> Add Lesson to {phase}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={`border border-dashed border-white/20 rounded-2xl p-10 text-center mb-6 ${isDarkMode ? 'bg-[#1E293B]/5' : 'bg-slate-50'}`}>
                      <LayoutList className="w-12 h-12 text-[#FFD700] mx-auto mb-3 opacity-50" />
                      <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No curriculum phases yet</h3>
                      <p className={`mb-6 text-sm max-w-sm mx-auto ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Start building your curriculum by adding your first phase (e.g., "Phase 1: Foundations").</p>
                    </div>
                  )}

                  {!showPhaseInput ? (
                    <button 
                      onClick={() => setShowPhaseInput(true)}
                      className={`w-full py-4 border border-dashed border-[#E67E22]/50 rounded-xl text-[#E67E22] font-bold hover:bg-[#E67E22]/10 transition-colors flex items-center justify-center gap-2 shadow-sm mt-4 ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}
                    >
                      <PlusCircle className="w-5 h-5" /> Add New Phase
                    </button>
                  ) : createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                      <div className={`bg-[#1E293B] border rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-300 relative ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                        <div className={`flex justify-between items-center mb-6 border-b pb-4 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                          <h3 className={`font-bold text-xl flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            <PlusCircle className="w-6 h-6 text-[#E67E22]" /> Create New Phase
                          </h3>
                          <button onClick={() => setShowPhaseInput(false)} className={`hover:text-white text-2xl transition-colors leading-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>&times;</button>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className={`block text-sm font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Phase Name <span className="text-[#E30A17]">*</span></label>
                            <input 
                              type="text" 
                              autoFocus
                              value={newPhaseName}
                              onChange={e => setNewPhaseName(e.target.value)}
                              onKeyDown={(e) => { if(e.key === 'Enter') handleAddPhase(); }}
                              placeholder='e.g., Phase 1: Foundations'
                              className={`w-full px-4 py-3 rounded-lg border focus:ring-1 focus:ring-[#E67E22] focus:border-[#E67E22] outline-none ${isDarkMode ? 'bg-[#1E293B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`}
                            />
                          </div>
                          <div className="flex gap-3 pt-4 mt-4">
                            <button 
                              onClick={() => setShowPhaseInput(false)}
                              className={`flex-1 py-3 px-4 font-bold rounded-lg border hover:bg-[#1E293B]/50 hover:text-white transition-colors ${isDarkMode ? 'bg-[#1E293B] text-slate-300 border-white/10' : 'bg-white text-slate-500 border-slate-200'}`}
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={handleAddPhase}
                              disabled={!newPhaseName.trim()}
                              className={`flex-1 py-3 px-4 font-semibold rounded-lg hover:shadow-lg hover:shadow-[#E67E22]/20 border transition-colors disabled:opacity-50 bg-[#E67E22] hover:bg-[#CF711F] shadow-md border-[#E67E22] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                            >
                              Add Phase
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>,
                    document.body
                  )}

                  {showLessonFormForPhase && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                      <div className={`bg-[#1E293B] border rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-2xl animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[90vh] ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                        <div className={`flex justify-between items-center mb-6 border-b pb-4 shrink-0 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                          <h3 className={`font-bold text-xl flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            <PlayCircle className="w-6 h-6 text-[#E67E22]" /> New Lesson for <span className="text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/20 px-3 py-1 rounded-lg text-sm">{showLessonFormForPhase}</span>
                          </h3>
                          <button onClick={() => setShowLessonFormForPhase(null)} className={`hover:text-white text-2xl transition-colors leading-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>&times;</button>
                        </div>
                      <form onSubmit={handleAddLesson} className="space-y-4 overflow-y-auto pr-2 flex-1">
                        <div>
                          <label className={`block text-sm font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Lesson Title <span className="text-[#E30A17]">*</span></label>
                          <input 
                            type="text" 
                            required 
                            value={lessonForm.title}
                            onChange={e => setLessonForm({...lessonForm, title: e.target.value})}
                            className={`w-full px-4 py-2.5 rounded-lg border focus:ring-1 focus:ring-[#FFD700] focus:border-[#FFD700] outline-none ${isDarkMode ? 'bg-[#1E293B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Description <span className="text-[#E30A17]">*</span></label>
                          <textarea 
                            required 
                            value={lessonForm.description}
                            onChange={e => setLessonForm({...lessonForm, description: e.target.value})}
                            className={`w-full px-4 py-2.5 rounded-lg border focus:ring-1 focus:ring-[#FFD700] focus:border-[#FFD700] outline-none resize-y ${isDarkMode ? 'bg-[#1E293B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`}
                            rows="2"
                          ></textarea>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <label className={`block text-sm font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Video URL <span className="text-[#E30A17]">*</span></label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                required 
                                value={lessonForm.videoUrl}
                                onChange={e => {
                                  setLessonForm({...lessonForm, videoUrl: e.target.value});
                                  if (e.target.value === '') setLastFetchedDurationUrl('');
                                }}
                                placeholder="Paste URL or upload file"
                                className={`flex-1 px-4 py-2.5 rounded-lg border focus:ring-1 focus:ring-[#FFD700] focus:border-[#FFD700] outline-none min-w-0 ${isDarkMode ? 'bg-[#1E293B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`}
                              />
                              <label 
                                className={`cursor-pointer hover:bg-[#1E293B]/20 text-[#FFD700] border px-4 py-2.5 rounded-lg font-bold transition-colors flex items-center shrink-0 ${dragActive.videoUrl ? 'border-[#FFD700] bg-[#FFD700]/10' : (isDarkMode ? 'bg-[#1E293B]/10 border-white/10' : 'bg-slate-50 border-slate-200')}`}
                                onDragEnter={(e) => handleDrag(e, 'videoUrl')}
                                onDragLeave={(e) => handleDrag(e, 'videoUrl')}
                                onDragOver={(e) => handleDrag(e, 'videoUrl')}
                                onDrop={(e) => handleDrop(e, 'videoUrl')}
                              >
                                {uploadProgress.videoUrl ? `${uploadProgress.videoUrl}%` : 'Upload / Drop'}
                                <input 
                                  type="file" 
                                  accept="video/mp4,video/webm,video/ogg"
                                  className="hidden" 
                                  onChange={(e) => handleFileUpload(e, 'videoUrl')} 
                                  disabled={saving}
                                />
                              </label>
                            </div>
                            
                            {/* Hidden ReactPlayer to extract duration automatically */}
                            {lessonForm.videoUrl && lessonForm.videoUrl !== lastFetchedDurationUrl && (
                              <div className="hidden">
                                <ReactPlayer 
                                  url={resolveVideoUrl(lessonForm.videoUrl)} 
                                  onDuration={(duration) => {
                                    const durationInMinutes = Math.ceil(duration / 60);
                                    setLessonForm(prev => ({ ...prev, duration: durationInMinutes || 1 }));
                                    setLastFetchedDurationUrl(lessonForm.videoUrl);
                                  }}
                                  onError={() => {
                                    setLastFetchedDurationUrl(lessonForm.videoUrl);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          <div className="w-full sm:w-32 shrink-0">
                            <label className={`block text-sm font-bold mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Duration (m) <span className="text-[#E30A17]">*</span></label>
                            <input 
                              type="number" 
                              required min="1"
                              value={lessonForm.duration}
                              onChange={e => setLessonForm({...lessonForm, duration: Number(e.target.value)})}
                              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-1 focus:ring-[#FFD700] focus:border-[#FFD700] outline-none ${isDarkMode ? 'bg-[#1E293B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1.5 mt-4">
                            <label className={`block text-sm font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}><FileText className="w-4 h-4 text-blue-400"/> Reading Materials & Notes</label>
                            <label 
                              className={`cursor-pointer text-xs font-bold transition-all px-3 py-1 rounded-md border flex items-center gap-1 ${dragActive.readingMaterials ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]' : 'border-transparent text-[#FFD700] hover:text-white'}`}
                              onDragEnter={(e) => handleDrag(e, 'readingMaterials')}
                              onDragLeave={(e) => handleDrag(e, 'readingMaterials')}
                              onDragOver={(e) => handleDrag(e, 'readingMaterials')}
                              onDrop={(e) => handleDrop(e, 'readingMaterials')}
                            >
                              {uploadProgress.readingMaterials ? `Uploading... ${uploadProgress.readingMaterials}%` : 'Upload Document / Drop Here'}
                              <input 
                                type="file" 
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                                className="hidden" 
                                onChange={(e) => handleFileUpload(e, 'readingMaterials')} 
                                disabled={saving}
                              />
                            </label>
                          </div>
                          <textarea 
                            value={lessonForm.readingMaterials}
                            onChange={e => setLessonForm({...lessonForm, readingMaterials: e.target.value})}
                            className={`w-full px-4 py-2.5 rounded-lg border focus:ring-1 focus:ring-[#FFD700] focus:border-[#FFD700] outline-none min-h-[100px] placeholder:text-slate-300 ${isDarkMode ? 'bg-[#1E293B] text-white border-white/10' : 'bg-white text-slate-900 border-slate-200'}`}
                            placeholder="Add markdown notes, links, or text for students to read. Uploading a document inserts its link here."
                          ></textarea>
                        </div>
                        
                        <div className="mt-4">
                          <QuizBuilder 
                            quiz={lessonForm.quiz} 
                            setQuiz={(newQuiz) => setLessonForm({...lessonForm, quiz: newQuiz})} 
                            title="End of Lesson Mini-Quiz" 
                          />
                        </div>

                        <div className={`flex gap-3 pt-6 mt-4 shrink-0 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                          <button 
                            type="button" 
                            onClick={() => setShowLessonFormForPhase(null)}
                            className={`flex-1 py-3 px-4 font-bold rounded-lg border hover:bg-[#1E293B]/50 hover:text-white transition-colors ${isDarkMode ? 'bg-[#1E293B] text-slate-300 border-white/10' : 'bg-white text-slate-500 border-slate-200'}`}
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            disabled={saving}
                            className={`flex-1 py-3 px-4 font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00D4FF]/20 border transition-colors disabled:opacity-50 bg-[#F97316] hover:bg-[#CF711F] shadow-md border-[#F97316] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                          >
                            Save Lesson
                          </button>
                        </div>
                      </form>
                      </div>
                    </div>,
                    document.body
                  )}
                </div>
              )}

              {/* STEP 4: Pricing & Publish */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className={`text-2xl font-display font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Pricing & Publishing</h2>
                  <p className={`mb-8 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Set your course value and {isAdmin ? 'publish it immediately' : 'submit it for administrative review'}.</p>
                  
                  <div className={`border rounded-2xl p-6 md:p-8 mb-8 backdrop-blur-md ${isDarkMode ? 'bg-[#1E293B]/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-20 h-20 bg-[#E67E22]/10 rounded-full flex gap-1 items-center justify-center text-[#E67E22] shadow-sm shrink-0 border-4 border-[#E67E22]/20">
                        <Banknote className="w-10 h-10" />
                      </div>
                      <div className="flex-1 w-full text-center sm:text-left">
                        <label className="block text-sm font-bold text-[#FFD700] mb-2">Set Course Price (ETB)</label>
                        <div className="relative max-w-xs mx-auto sm:mx-0">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="font-bold text-[#E67E22]">Br</span>
                          </div>
                          <input 
                            type="number" 
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                            className={`w-full pl-10 pr-4 py-4 text-2xl font-bold rounded-xl border-2 border-[#F97316]/30 focus:ring-1 focus:ring-[#00D4FF] focus:border-[#F97316] outline-none transition-all shadow-inner ${isDarkMode ? 'bg-[#1E293B] text-white' : 'bg-white text-slate-900'}`}
                          />
                        </div>
                        <p className={`mt-3 text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Set to 0 to make this course free for all students.</p>
                      </div>
                    </div>
                  </div>

                  <div className={`border rounded-2xl p-6 mb-8 backdrop-blur-md ${isDarkMode ? 'bg-[#1E293B]/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                       <CheckCircle2 className="w-5 h-5 text-[#FFD700]" /> Final Course Certification Exam
                    </h3>
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>You can require a final exam for students to earn their certificate.</p>
                    <label className="flex items-center gap-3 mb-6 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.isExamRequired}
                        onChange={e => setFormData({...formData, isExamRequired: e.target.checked})}
                        className={`w-5 h-5 text-[#F97316] border-white/20 rounded focus:ring-[#00D4FF] focus:ring-offset-[#0B0E14] ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'}`}
                      />
                      <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Require Final Exam for Certification</span>
                    </label>

                    {formData.isExamRequired && (
                      <div className="mt-4">
                        <QuizBuilder 
                          quiz={formData.finalExam} 
                          setQuiz={(newQuiz) => setFormData({...formData, finalExam: newQuiz})} 
                          title="Comprehensive Final Exam Questions" 
                        />
                      </div>
                    )}
                  </div>

                  <div className={`border rounded-2xl p-6 backdrop-blur-md ${isDarkMode ? 'bg-[#1E293B]/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <h3 className={`font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                       <CheckCircle2 className="w-5 h-5 text-[#E67E22]" /> Pre-flight Checklist
                    </h3>
                    <ul className={`space-y-2 text-sm ml-7 list-disc ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                      <li>Course title and detailed description are complete.</li>
                      <li>At least one lesson module has been added to the curriculum.</li>
                      <li>Course thumbnail is assigned (or default will be used).</li>
                    </ul>
                  </div>

                </div>
              )}

            </div>
            
            {/* Form Footer / Navigation */}
            <div className={`bg-[#1E293B] border-t p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 relative z-20 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
              <button 
                onClick={prevStep}
                disabled={currentStep === 1 || saving}
                className={`w-full sm:w-auto px-6 py-2.5 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-transparent hover:bg-white/5 border border-white/20 text-sm flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}
              >
                <ArrowLeft className="w-4 h-4" /> Previous Step
              </button>
              
              <div className="w-full sm:w-auto flex gap-3">
                {currentStep < 4 ? (
                  <button 
                    onClick={nextStep}
                    disabled={saving || (currentStep === 1 && !formData.title)}
                    className={`w-full sm:w-auto px-8 py-2.5 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-[#E67E22] hover:bg-[#CF711F] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                  >
                    Save & Continue <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmitForReview}
                    disabled={saving || lessons.length === 0}
                    className={`w-full sm:w-auto px-8 py-2.5 font-semibold rounded-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-[#E67E22] hover:bg-[#CF711F] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                  >
                    <Send className="w-4 h-4" /> {isAdmin ? 'Publish Course' : 'Submit for Review'}
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
