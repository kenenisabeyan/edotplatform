import React, { useState, useCallback } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { UploadCloud, File, Video, X, CheckCircle, AlertCircle } from 'lucide-react';

const MaterialUpload = ({ lessonId, onUploadSuccess }) => {
  const isDarkMode = useThemeMode();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const mappedFiles = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
      title: file.name,
      status: 'pending', // pending, uploading, success, error
    }));
    setFiles((prev) => [...prev, ...mappedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mkv', '.webm'],
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt', '.pptx'],
      'application/msword': ['.doc', '.docx'],
    },
  });

  const getFileType = (mimeType) => {
  const isDarkMode = useThemeMode();
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'ppt';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
    return 'other';
  };

  const removeFile = (id) => {
  const isDarkMode = useThemeMode();
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setError(null);

    for (let i = 0; i < files.length; i++) {
      const currentFile = files[i];
      if (currentFile.status === 'success') continue;

      setFiles((prev) => prev.map((f) => f.id === currentFile.id ? { ...f, status: 'uploading' } : f));
      
      const formData = new FormData();
      formData.append('image', currentFile.file); // Assuming the existing /upload expects 'image' or file

      try {
        const uploadRes = await axios.post('http://localhost:5000/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          },
        });

        if (uploadRes.data.success) {
          const materialData = {
            lessonId,
            title: currentFile.title,
            fileUrl: uploadRes.data.filePath,
            fileType: getFileType(currentFile.file.type),
            duration: uploadRes.data.duration || null,
          };

          await axios.post('http://localhost:5000/api/materials', materialData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });

          setFiles((prev) => prev.map((f) => f.id === currentFile.id ? { ...f, status: 'success' } : f));
          if (onUploadSuccess) onUploadSuccess();
        }
      } catch (err) {
        console.error('Upload failed:', err);
        setFiles((prev) => prev.map((f) => f.id === currentFile.id ? { ...f, status: 'error' } : f));
        setError(`Failed to upload ${currentFile.title}`);
      }
    }
    
    setUploading(false);
    setProgress(0);
  };

  return (
    <div className="bg-[#0B1120] p-6 rounded-xl border border-gray-800 shadow-xl w-full max-w-3xl">
      <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Upload Course Materials</h3>
      
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-[#00D4FF] bg-[#00D4FF]/10' : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className={`mx-auto h-12 w-12 mb-3 ${isDragActive ? 'text-[#00D4FF]' : 'text-gray-400'}`} />
        <p className="text-gray-300 font-medium text-lg">
          {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Supports Videos (MP4, MKV), PDFs, PPTs, and Word Docs
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Selected Files</h4>
          {files.map((f) => (
            <div key={f.id} className="flex items-center justify-between bg-gray-800/80 p-3 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-3 truncate">
                {f.file.type.startsWith('video/') ? (
                  <Video className="h-5 w-5 text-blue-400 shrink-0" />
                ) : (
                  <File className="h-5 w-5 text-orange-400 shrink-0" />
                )}
                <div className="flex flex-col truncate">
                  <span className="text-gray-200 text-sm font-medium truncate">{f.title}</span>
                  <span className="text-gray-500 text-xs">{(f.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {f.status === 'uploading' && (
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00D4FF] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-400">{progress}%</span>
                  </div>
                )}
                {f.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {f.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                {f.status === 'pending' && !uploading && (
                  <button onClick={() => removeFile(f.id)} className="p-1 hover:bg-gray-700 rounded-md transition-colors">
                    <X className="h-4 w-4 text-gray-400 hover:text-white" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={uploadFiles}
          disabled={files.length === 0 || uploading || files.every(f => f.status === 'success')}
          className={`bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 font-medium py-2 px-6 rounded-lg shadow-lg transition-all ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
        >
          {uploading ? 'Uploading...' : 'Upload Files'}
        </button>
      </div>
    </div>
  );
};

export default MaterialUpload;
