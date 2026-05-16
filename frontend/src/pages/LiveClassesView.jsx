import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Calendar as CalendarIcon, Clock, Users, Plus, X, Link as LinkIcon, CheckCircle2, Play, UploadCloud, Lock, Unlock, FileVideo } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useThemeMode from '../hooks/useThemeMode';
import axios from 'axios';
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns';
import toast from 'react-hot-toast';
import LiveRoom from './LiveRoom';
import PremiumModal from '../components/PremiumModal';

export default function LiveClassesView() {
  const { user } = useAuth();
  const isDarkMode = useThemeMode();
  const [classes, setClasses] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'recordings'
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [playingVideoUrl, setPlayingVideoUrl] = useState(null);
  const [playingVideoTitle, setPlayingVideoTitle] = useState('');
  const [livekitSession, setLivekitSession] = useState(null);
  
  const [formData, setFormData] = useState({
    courseId: '', title: '', description: '', scheduledAt: '', durationMinutes: 60
  });

  const [uploadForm, setUploadForm] = useState({
    courseId: '', liveClassId: '', title: '', description: '', file: null,
    isPublic: false, requiresPermission: true
  });
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  useEffect(() => {
    fetchClasses();
    if (isInstructor) {
      fetchCourses();
    }
  }, [user, isInstructor]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const [liveRes, recRes] = await Promise.all([
        axios.get('/api/live-classes', { withCredentials: true }).catch(() => ({ data: {} })),
        axios.get('/api/live-classes/recordings', { withCredentials: true }).catch(() => ({ data: {} }))
      ]);
      if (liveRes.data?.success) setClasses(liveRes.data.liveClasses);
      if (recRes.data?.success) setRecordings(recRes.data.recordings);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get('/api/courses/my-courses', { withCredentials: true });
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleScheduleClass = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/live-classes', formData, { withCredentials: true });
      if (data.success) {
        toast.success('Live class scheduled!');
        setShowModal(false);
        fetchClasses();
        setFormData({ courseId: '', title: '', description: '', scheduledAt: '', durationMinutes: 60 });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to schedule class');
    }
  };

  const handleUploadRecording = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return toast.error("Please select a video file");
    setUploadingVideo(true);
    try {
      const formPayload = new FormData();
      formPayload.append('file', uploadForm.file);
      
      toast.loading("Uploading to cloud storage... This may take a moment.", { id: 'uploadToast' });
      const uploadRes = await axios.post('/api/upload', formPayload, { withCredentials: true });
      
      if (!uploadRes.data.success) throw new Error("Upload failed");
      
      const { secure_url, duration } = uploadRes.data;

      const payload = {
         courseId: uploadForm.courseId,
         liveClassId: uploadForm.liveClassId || undefined,
         title: uploadForm.title,
         description: uploadForm.description,
         videoUrl: secure_url,
         duration: Math.round(duration / 60) || 0,
         isPublic: uploadForm.isPublic,
         requiresPermission: uploadForm.requiresPermission
      };

      await axios.post('/api/live-classes/recordings', payload, { withCredentials: true });
      toast.success("Recording secured and published successfully", { id: 'uploadToast' });
      setShowUploadModal(false);
      fetchClasses();
      setUploadForm({ courseId: '', liveClassId: '', title: '', description: '', file: null, isPublic: false, requiresPermission: true });
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload recording", { id: 'uploadToast' });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleJoinClass = async (classId, meetLink) => {
    try {
      const { data } = await axios.post(`/api/live-classes/${classId}/join`, {}, { withCredentials: true });
      if (data.token) {
         setLivekitSession({ token: data.token, url: data.livekitUrl, roomName: data.roomName });
      } else {
         window.open(meetLink || data.meetLink, '_blank');
      }
      fetchClasses(); 
    } catch (error) {
      toast.error('Failed to join class');
    }
  };

  const handleEndClass = async (classId) => {
    try {
      await axios.post(`/api/live-classes/${classId}/complete`, {}, { withCredentials: true });
      toast.success('Class marked as completed');
      fetchClasses();
    } catch (error) {
      toast.error('Failed to end class');
    }
  };

  const handlePlayRecording = async (rec) => {
    try {
      toast.loading('Authenticating secure stream...', { id: 'playToast' });
      const { data } = await axios.get(`/api/live-classes/recordings/${rec.id}/play`, { withCredentials: true });
      if (data.success && data.playUrl) {
        toast.success('Stream authenticated', { id: 'playToast' });
        setPlayingVideoUrl(data.playUrl);
        setPlayingVideoTitle(rec.title);
      } else {
        throw new Error('No URL returned');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Access Denied', { id: 'playToast' });
    }
  };

  return (
    <div className={`p-8 min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Live & Recorded</h1>
            <p className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Hybrid Learning Engine. Stream live or catch up via secure VOD replay.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex p-1 rounded-full border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
               <button 
                 onClick={() => setActiveTab('live')}
                 className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'live' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
               >
                 Live Sessions
               </button>
               <button 
                 onClick={() => setActiveTab('recordings')}
                 className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'recordings' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
               >
                 Secured Replays
               </button>
            </div>
            
            {isInstructor && activeTab === 'live' && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-orange-500/20 text-sm"
              >
                <Plus className="w-4 h-4" /> Schedule
              </button>
            )}
            
            {isInstructor && activeTab === 'recordings' && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-indigo-500/20 text-sm"
              >
                <UploadCloud className="w-4 h-4" /> Upload
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : activeTab === 'live' ? (
          /* Live Classes Tab */
          classes.length === 0 ? (
            <div className={`text-center py-20 ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} rounded-[32px] border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <Video className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
              <h3 className="text-xl font-bold">No live classes scheduled</h3>
              <p className={`mt-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Check back later for upcoming real-time sessions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {classes.map((c) => {
                  const date = new Date(c.scheduledAt);
                  const isLive = c.status === 'live' || (isPast(date) && c.status !== 'completed');
                  
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative overflow-hidden rounded-[32px] border ${isDarkMode ? 'bg-[#0B1221] border-white/5 hover:border-orange-500/30' : 'bg-white border-slate-200 hover:border-orange-300'} transition-all p-6 group`}
                    >
                      {isLive && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                          <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">Live</span>
                        </div>
                      )}
                      {c.status === 'completed' && (
                        <div className="absolute top-4 right-4 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border dark:border-white/5">
                          Completed
                        </div>
                      )}
                      
                      <div className="mt-2 mb-4 pr-16">
                        <span className={`text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                          <CalendarIcon className="w-3 h-3" /> {c.course?.title || 'General Session'}
                        </span>
                        <h3 className="text-xl font-bold mt-2 line-clamp-2 leading-tight">{c.title}</h3>
                      </div>
                      
                      <p className={`text-sm mb-6 line-clamp-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {c.description || 'No description provided for this session.'}
                      </p>

                      <div className={`space-y-3 mb-8 p-4 rounded-[32px] ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                        <div className={`flex items-center gap-3 text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          <Clock className="w-4 h-4 text-orange-500" />
                          {format(date, 'MMM d, yyyy • h:mm a')} <span className="opacity-50">({c.durationMinutes}m)</span>
                        </div>
                        <div className={`flex items-center gap-3 text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          <Users className="w-4 h-4 text-orange-500" />
                          {c.instructor?.name || 'EDOT Team'}
                        </div>
                      </div>

                      {c.status !== 'completed' ? (
                        <button
                          onClick={() => handleJoinClass(c.id, c.meetLink)}
                          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-[32px] font-bold transition-all text-sm ${
                            isLive 
                              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]' 
                              : isDarkMode 
                                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/5' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
                          }`}
                        >
                          <Video className="w-5 h-5" />
                          {isLive ? 'Join Live Studio' : `Starts ${formatDistanceToNow(date, { addSuffix: true })}`}
                        </button>
                      ) : (
                        <button
                          disabled
                          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-[32px] font-bold text-sm ${
                            isDarkMode ? 'bg-slate-800/50 text-slate-500 border border-white/5' : 'bg-slate-50 text-slate-400 border border-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          Session Concluded
                        </button>
                      )}

                      {isInstructor && c.status !== 'completed' && (
                        <button
                          onClick={() => handleEndClass(c.id)}
                          className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-xs text-red-500 hover:text-red-400 font-bold transition-colors"
                        >
                          Force Complete Session
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )
        ) : (
          /* Recordings Tab */
          recordings.length === 0 ? (
            <div className={`text-center py-20 ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} rounded-[32px] border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <FileVideo className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
              <h3 className="text-xl font-bold">No recordings available</h3>
              <p className={`mt-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Recordings from past sessions will appear here securely.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {recordings.map((rec) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`relative overflow-hidden rounded-[32px] border ${isDarkMode ? 'bg-[#0B1221] border-white/5 hover:border-indigo-500/30' : 'bg-white border-slate-200 hover:border-indigo-300'} transition-all group flex flex-col`}
                  >
                     <div className="relative w-full aspect-video bg-black overflow-hidden shrink-0">
                        <img 
                          src={rec.thumbnail && rec.thumbnail !== 'default-video-thumb.jpg' ? rec.thumbnail : 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop'} 
                          alt={rec.title} 
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                           <button onClick={() => handlePlayRecording(rec)} className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white hover:bg-white hover:text-black transition-all hover:scale-110 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                             <Play className="w-6 h-6 ml-1" fill="currentColor" />
                           </button>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white tracking-widest">
                           {rec.duration ? `${rec.duration} MIN` : 'VOD'}
                        </div>
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-white flex items-center gap-1 border border-white/10">
                           {rec.requiresPermission ? <Lock className="w-3 h-3 text-rose-400" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
                           {rec.requiresPermission ? 'SECURED' : 'PUBLIC'}
                        </div>
                     </div>
                     <div className="p-6 flex flex-col flex-1">
                        <span className={`text-[10px] font-black tracking-widest uppercase mb-2 block ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                          {rec.course?.title || 'General'}
                        </span>
                        <h3 className="text-lg font-bold mb-2 line-clamp-2 leading-tight">{rec.title}</h3>
                        <p className={`text-xs mb-4 line-clamp-2 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {rec.description || 'No description provided.'}
                        </p>
                        
                        <div className={`mt-auto pt-4 border-t flex justify-between items-center ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                           <div className="flex items-center gap-2">
                             <img src={rec.instructor?.avatar ? (rec.instructor.avatar.startsWith('http') ? rec.instructor.avatar : `http://localhost:5000${rec.instructor.avatar}`) : `https://ui-avatars.com/api/?name=${rec.instructor?.name}&background=random`} className="w-6 h-6 rounded-full" alt="avatar" />
                             <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{rec.instructor?.name}</span>
                           </div>
                        </div>
                     </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )
        )}

        {/* Schedule Modal */}
        <PremiumModal isOpen={showModal} onClose={() => setShowModal(false)} maxWidth="max-w-lg">
                 <div className="flex flex-col w-full h-full p-6 md:p-8">
                 {/* Brand Background Decorative Elements */}
                 <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#F97316]/10 to-transparent pointer-events-none z-0"></div>
                 <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#F97316]/20 blur-[80px] pointer-events-none z-0"></div>
                 <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#00D4FF]/20 blur-[80px] pointer-events-none z-0"></div>
                 
                <div className={`px-8 py-6 flex items-center justify-between border-b relative z-10 ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
                  <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Schedule Live Stream</h3>
                  <button onClick={() => setShowModal(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleScheduleClass} className="p-8 space-y-6 relative z-10">
                  <div>
                    <label className="block text-xs font-black mb-2 uppercase tracking-widest opacity-60">Target Course</label>
                    <select required value={formData.courseId} onChange={(e) => setFormData({...formData, courseId: e.target.value})} className={`w-full px-5 py-3.5 rounded-[32px] text-sm font-medium outline-none transition-all ${isDarkMode ? 'bg-[#151B2B] focus:bg-[#1E2638] border-transparent focus:border-orange-500/50' : 'bg-slate-100 focus:bg-white border-transparent border focus:border-orange-500/50'}`}>
                      <option value="">Select a course mapping...</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black mb-2 uppercase tracking-widest opacity-60">Session Title</label>
                    <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g., Week 3 Live Debugging" className={`w-full px-5 py-3.5 rounded-[32px] text-sm font-medium outline-none transition-all ${isDarkMode ? 'bg-[#151B2B] focus:bg-[#1E2638] border-transparent focus:border-orange-500/50' : 'bg-slate-100 focus:bg-white border-transparent border focus:border-orange-500/50'}`}/>
                  </div>

                  <div>
                    <label className="block text-xs font-black mb-2 uppercase tracking-widest opacity-60">Syllabus / Description</label>
                    <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="What will be covered?" className={`w-full !px-6 py-3.5 !rounded-[32px] text-sm font-medium outline-none transition-all ${isDarkMode ? 'bg-[#151B2B] focus:bg-[#1E2638] border-transparent focus:border-orange-500/50' : 'bg-slate-100 focus:bg-white border-transparent border focus:border-orange-500/50'}`}/>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black mb-2 uppercase tracking-widest opacity-60">Date & Time</label>
                      <input required type="datetime-local" value={formData.scheduledAt} onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})} className={`w-full px-5 py-3.5 rounded-[32px] text-sm font-medium outline-none transition-all ${isDarkMode ? 'bg-[#151B2B] focus:bg-[#1E2638] border-transparent focus:border-orange-500/50' : 'bg-slate-100 focus:bg-white border-transparent border focus:border-orange-500/50'}`}/>
                    </div>
                    <div>
                      <label className="block text-xs font-black mb-2 uppercase tracking-widest opacity-60">Length (min)</label>
                      <input required type="number" min="15" max="240" value={formData.durationMinutes} onChange={(e) => setFormData({...formData, durationMinutes: parseInt(e.target.value)})} className={`w-full px-5 py-3.5 rounded-[32px] text-sm font-medium outline-none transition-all ${isDarkMode ? 'bg-[#151B2B] focus:bg-[#1E2638] border-transparent focus:border-orange-500/50' : 'bg-slate-100 focus:bg-white border-transparent border focus:border-orange-500/50'}`}/>
                    </div>
                  </div>

                  <div className="pt-6 flex items-center justify-end gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className={`px-6 py-3.5 rounded-[32px] font-bold text-sm transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>Cancel</button>
                    <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-[32px] font-bold text-sm transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)]">Deploy Engine</button>
                  </div>
                </form>
                 </div>
        </PremiumModal>

        {/* Upload Recording Modal */}
        <PremiumModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} maxWidth="max-w-xl">
                 <div className="flex flex-col w-full h-full p-6 md:p-8">
                 {/* Brand Background Decorative Elements */}
                 <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none z-0"></div>
                 <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[80px] pointer-events-none z-0"></div>
                 <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[80px] pointer-events-none z-0"></div>

                <div className={`px-8 py-6 flex items-center justify-between border-b relative z-10 ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
                  <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Secure VOD Upload</h3>
                  <button onClick={() => setShowUploadModal(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleUploadRecording} className="p-8 space-y-6 relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-black mb-2 uppercase tracking-widest opacity-60">Course</label>
                       <select required value={uploadForm.courseId} onChange={(e) => setUploadForm({...uploadForm, courseId: e.target.value})} className={`w-full px-5 py-3.5 rounded-[32px] text-sm font-medium outline-none transition-all ${isDarkMode ? 'bg-[#151B2B] focus:bg-[#1E2638] border-transparent' : 'bg-slate-100 border-transparent border'}`}>
                         <option value="">Select...</option>
                         {courses.map(course => (
                           <option key={course.id} value={course.id}>{course.title}</option>
                         ))}
                       </select>
                     </div>
                     <div>
                       <label className="block text-xs font-black mb-2 uppercase tracking-widest opacity-60">Link to Live Class (Opt)</label>
                       <select value={uploadForm.liveClassId} onChange={(e) => setUploadForm({...uploadForm, liveClassId: e.target.value})} className={`w-full px-5 py-3.5 rounded-[32px] text-sm font-medium outline-none transition-all ${isDarkMode ? 'bg-[#151B2B] focus:bg-[#1E2638] border-transparent' : 'bg-slate-100 border-transparent border'}`}>
                         <option value="">None...</option>
                         {classes.filter(c => c.courseId === uploadForm.courseId).map(c => (
                           <option key={c.id} value={c.id}>{c.title}</option>
                         ))}
                       </select>
                     </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black mb-2 uppercase tracking-widest opacity-60">Recording Title</label>
                    <input required type="text" value={uploadForm.title} onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})} placeholder="Session Replay Title" className={`w-full px-5 py-3.5 rounded-[32px] text-sm font-medium outline-none transition-all ${isDarkMode ? 'bg-[#151B2B] focus:bg-[#1E2638] border-transparent' : 'bg-slate-100 border-transparent border'}`}/>
                  </div>

                  <div>
                    <label className="block text-xs font-black mb-2 uppercase tracking-widest opacity-60">Description</label>
                    <textarea rows="2" value={uploadForm.description} onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})} placeholder="Context..." className={`w-full !px-6 py-3.5 !rounded-[32px] text-sm font-medium outline-none transition-all ${isDarkMode ? 'bg-[#151B2B] focus:bg-[#1E2638] border-transparent' : 'bg-slate-100 border-transparent border'}`}/>
                  </div>
                  
                  <div className={`p-6 rounded-[32px] border border-dashed flex flex-col items-center justify-center relative transition-all ${isDarkMode ? 'border-slate-700 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-indigo-400'}`}>
                     <UploadCloud className={`w-8 h-8 mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                     <p className="text-sm font-bold mb-1">{uploadForm.file ? uploadForm.file.name : 'Select Video File'}</p>
                     <p className="text-xs font-medium opacity-60">MP4, WebM (Max 1GB)</p>
                     <input required type="file" accept="video/*" onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>

                  <div className={`p-4 rounded-[32px] border flex items-center justify-between ${isDarkMode ? 'bg-[#151B2B] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                     <div>
                        <h4 className="text-sm font-bold flex items-center gap-2"><Lock className="w-4 h-4 text-emerald-500"/> DRM & Access Control</h4>
                        <p className="text-xs font-medium opacity-60 mt-1">Only enrolled students can watch</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={uploadForm.requiresPermission} onChange={(e) => setUploadForm({...uploadForm, requiresPermission: e.target.checked})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                     </label>
                  </div>

                  <div className="pt-6 flex items-center justify-end gap-3 border-t dark:border-white/5">
                    <button type="button" disabled={uploadingVideo} onClick={() => setShowUploadModal(false)} className={`px-6 py-3.5 rounded-[32px] font-bold text-sm transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>Cancel</button>
                    <button type="submit" disabled={uploadingVideo} className={`px-8 py-3.5 rounded-[32px] font-bold text-sm transition-all text-white flex items-center gap-2 ${uploadingVideo ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.3)]'}`}>
                      {uploadingVideo ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <UploadCloud className="w-4 h-4" />}
                      {uploadingVideo ? 'Encrypting & Uploading...' : 'Secure Upload'}
                    </button>
                  </div>
                </form>
                 </div>
        </PremiumModal>

        {/* Secure Video Player Modal */}
        <PremiumModal isOpen={!!playingVideoUrl} onClose={() => setPlayingVideoUrl(null)} maxWidth="max-w-5xl">
             <div className="relative aspect-video rounded-[32px] overflow-hidden bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">
                 <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none">
                    <h2 className="text-white text-xl font-bold">{playingVideoTitle}</h2>
                    <p className="text-emerald-400 text-xs font-bold mt-1 uppercase tracking-widest flex items-center gap-1"><Lock className="w-3 h-3"/> Secure Token Stream Active</p>
                 </div>
                 <video src={playingVideoUrl} controls autoPlay controlsList="nodownload" className="w-full h-full object-contain" />
             </div>
        </PremiumModal>

      </div>

      {/* LiveKit Room */}
      <AnimatePresence>
        {livekitSession && (
          <LiveRoom 
            token={livekitSession.token} 
            url={livekitSession.url} 
            roomName={livekitSession.roomName} 
            onClose={() => { setLivekitSession(null); fetchClasses(); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
