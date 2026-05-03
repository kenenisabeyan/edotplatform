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
  const [resolvedUrl, setResolvedUrl] = useState('');

  useEffect(() => {
    if (!url) return;
    let resolved = url;
    
    const embedMatch = resolved.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i);
    if (embedMatch) {
      resolved = `https://www.youtube.com/watch?v=${embedMatch[1]}`;
    }
    
    if (resolved.toLowerCase().includes('cloudinary.com')) {
       resolved = resolveCloudinaryUrl(resolved);
    }
    setResolvedUrl(resolved);
  }, [url]);

  if (!resolvedUrl) return <div className={`bg-black p-4 rounded ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No video URL provided.</div>;

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-gray-800">
      <ReactPlayer 
        url={resolvedUrl} 
        width="100%" 
        height="100%" 
        controls 
        {...props} 
        config={{
          youtube: {
            playerVars: { showinfo: 1 }
          }
        }}
      />
    </div>
  );
}
