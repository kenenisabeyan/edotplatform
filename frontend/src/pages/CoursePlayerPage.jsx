import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import axios from 'axios';
import VideoPlayer from '../components/VideoPlayer';
import { FileText, File, Video, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { useParams } from 'react-router-dom';

const CoursePlayerPage = () => {
  const isDarkMode = useThemeMode();
  const { courseId, lessonId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const [materialsRes, progressRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/materials/${lessonId}?courseId=${courseId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get(`http://localhost:5000/api/progress/${lessonId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);

        if (materialsRes.data.success) {
          setMaterials(materialsRes.data.data);
        }
        if (progressRes.data.success) {
          setProgress(progressRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching lesson data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [lessonId]);

  const videoMaterial = materials.find(m => m.fileType === 'video');
  const otherMaterials = materials.filter(m => m.fileType !== 'video');

  if (loading) return <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white'}`}><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00D4FF]"></div></div>;

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${isDarkMode ? 'bg-[#0B1120] text-white' : 'bg-white text-slate-900'}`}>
      {/* Sidebar - Course Content */}
      <div className="w-full md:w-80 bg-[#151A23] border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-lg font-bold text-gray-100">Course Content</h2>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div className="bg-[#00D4FF] h-1.5 rounded-full" style={{ width: progress?.isComplete ? '100%' : '30%' }}></div>
            </div>
            <span className="text-xs text-gray-400 font-medium">{progress?.isComplete ? '100%' : '30%'}</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Example static list, ideally this is mapped from course.lessons */}
          <div className="bg-[#1A202C] border border-[#00D4FF]/30 rounded-lg p-3 cursor-pointer">
            <div className="flex items-center gap-3">
              {progress?.isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-[#00D4FF] shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-500 shrink-0" />
              )}
              <div className="flex-1">
                <h4 className={`text-sm font-medium line-clamp-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>1. Current Lesson Title</h4>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Video className="w-3 h-3" /> {videoMaterial?.duration || 10} mins
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
          
          {/* Video Player Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Course Name</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[#00D4FF]">Current Lesson</span>
            </div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {videoMaterial?.title || 'Lesson Video'}
            </h1>
            
            {videoMaterial ? (
              <VideoPlayer 
                videoUrl={videoMaterial.fileUrl} 
                courseId={courseId} 
                lessonId={lessonId} 
                requiredDuration={videoMaterial.duration}
                onComplete={() => setProgress(prev => ({ ...prev, isComplete: true }))}
              />
            ) : (
              <div className="w-full aspect-video bg-gray-900 rounded-xl flex items-center justify-center border border-gray-800">
                <p className="text-gray-500 flex items-center gap-2"><Video className="w-5 h-5"/> No video material available for this lesson</p>
              </div>
            )}
          </div>

          {/* Reading Materials Section */}
          <div className="bg-[#151A23] border border-gray-800 rounded-xl p-6">
            <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <FileText className="text-[#00D4FF]" /> Additional Resources
            </h3>
            
            {otherMaterials.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {otherMaterials.map(mat => (
                  <a 
                    key={mat.id} 
                    href={mat.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-4 p-4 rounded-full bg-gray-800/50 border border-gray-700 hover:border-[#00D4FF]/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#00D4FF]/10 flex items-center justify-center shrink-0 group-hover:bg-[#00D4FF]/20">
                      <File className="w-5 h-5 text-[#00D4FF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white">{mat.title}</p>
                      <p className="text-xs text-gray-500 uppercase mt-0.5">{mat.fileType}</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No additional resources attached to this lesson.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CoursePlayerPage;
