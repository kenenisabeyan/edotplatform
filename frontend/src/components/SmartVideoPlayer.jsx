import React, { useRef, useEffect, useState } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import ReactPlayer from 'react-player';

// Helper: Detect video type
function getVideoType(url) {
  if (!url) return 'unknown';
  const u = url.toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('vimeo.com')) return 'vimeo';
  if (u.match(/\.(mp4|webm|ogg|mov|mkv)(\?|$)/)) return 'direct';
  if (u.includes('cloudinary.com')) return 'cloudinary';
  return 'unknown';
}

// Helper: Clean/resolve Cloudinary URLs
function resolveCloudinaryUrl(url) {
  if (!url || !url.includes('cloudinary.com')) return url;
  try {
    let resolvedUrl = url.replace(/^http:\/\//i, 'https://');
    const urlObj = new URL(resolvedUrl);
    let pathname = urlObj.pathname;
    pathname = pathname.replace(/\/(image|raw)\/upload\//, '/video/upload/');
    if (!pathname.match(/\.(mp4|webm|ogg|mov|mkv)$/i)) pathname += '.mp4';
    urlObj.pathname = pathname;
    return urlObj.toString();
  } catch {
    return url;
  }
}

export default function SmartVideoPlayer({ url, ...props }) {
  const isDarkMode = useThemeMode();
  const [videoType, setVideoType] = useState('unknown');
  const [resolvedUrl, setResolvedUrl] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    if (!url) return;
    let type = getVideoType(url);
    let resolved = url;
    if (type === 'cloudinary') resolved = resolveCloudinaryUrl(url);
    setVideoType(type);
    setResolvedUrl(resolved);
  }, [url]);

  if (!resolvedUrl) return <div className={`bg-black p-4 rounded ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No video URL provided.</div>;

  // YouTube/Vimeo: Use ReactPlayer
  if (videoType === 'youtube' || videoType === 'vimeo') {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-gray-800">
        <ReactPlayer url={resolvedUrl} width="100%" height="100%" controls {...props} />
      </div>
    );
  }

  // Direct/Cloudinary: Use native video
  if (videoType === 'direct' || videoType === 'cloudinary') {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-gray-800">
        <video ref={videoRef} src={resolvedUrl} controls className="w-full h-full object-contain" {...props} />
      </div>
    );
  }

  // Unknown type
  return <div className={`bg-black p-4 rounded ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Unsupported video type or invalid URL.</div>;
}
