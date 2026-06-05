import React, { useState, useEffect, useRef } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { Bell, Clock, Award, CheckCircle2, ClipboardCheck, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import api from '../utils/api';

export default function NotificationBell() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const iconMap = {
      live_class_scheduled: <Clock className="w-5 h-5 text-[#00D4FF]" />,
      live_class_started: <Play className="w-5 h-5 text-emerald-400" />,
      live_class_ended: <CheckCircle2 className="w-5 h-5 text-[#38bdf8]" />,
      attendance_update: <ClipboardCheck className="w-5 h-5 text-[#f59e0b]" />,
      course_update: <CheckCircle2 className="w-5 h-5 text-[#00D4FF]" />,
      enrollment_update: <Award className="w-5 h-5 text-[#4338ca]" />,
      default: <Bell className={`w-5 h-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
    };

    const adaptNotification = (notif) => ({
      ...notif,
      icon: iconMap[notif.type] || iconMap.default,
      time: notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : 'Just now',
      unread: !notif.isRead
    });

    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/users/notifications');
        const notifs = Array.isArray(data.data) ? data.data.map(adaptNotification) : [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => n.unread).length);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    if (user) {
      fetchNotifications();
      const intervalId = setInterval(fetchNotifications, 5000);
      return () => clearInterval(intervalId);
    }
  }, [user, isDarkMode]);

  const handleNotificationClick = (actionUrl) => {
    setIsOpen(false);
    if (actionUrl) navigate(actionUrl);
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/users/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, unread: false, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark notifications read', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-full border flex items-center justify-center hover:text-white hover:border-[#00D4FF]/30 hover:shadow-[0_0_15px_rgba(255,215,0,0.2)] transition-all relative focus:outline-none backdrop-blur-md ${isDarkMode ? 'border-white/10 bg-[#0B1120]/5 text-slate-300' : 'border-white/20 bg-white/10 text-white'}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 w-5 h-5 bg-[#E30A17] text-[10px] font-bold rounded-full flex items-center justify-center border-2 shadow-sm text-white ${isDarkMode ? 'border-[#0B1120]' : 'border-[#1e3a8a]'}`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-3 w-80 sm:w-96 bg-slate-950/95 rounded-2xl shadow-2xl border overflow-hidden z-[100] animate-in zoom-in-95 slide-in-from-top-2 duration-200 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
          <div className={`p-4 border-b flex justify-between items-center bg-slate-950/90 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
            <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-sm font-semibold text-[#00D4FF] hover:text-[#00D4FF] hover:underline transition-all"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-[70vh] overflow-y-auto scrollbar-hide bg-slate-950/90">
            {notifications.length === 0 ? (
              <div className={`p-8 text-center flex flex-col items-center ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                <div className={`w-16 h-16 rounded-full border flex items-center justify-center mb-4 ${isDarkMode ? 'bg-[#0B1120]/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                  <Bell className={`w-8 h-8 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
                </div>
                <p className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No new notifications</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map(notif => (
                  <button 
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif.actionUrl)}
                    className={`p-4 border-b text-left transition-colors flex gap-4 group ${notif.unread ? 'bg-[#0B1120]/5 hover:bg-white/5/10' : 'hover:bg-white/5/5'} ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}
                  >
                    <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center border transition-colors ${notif.unread ? 'bg-[#00D4FF]/10 border-[#00D4FF]/30 shadow-[0_0_15px_rgba(255,215,0,0.1)]' : 'bg-[#0B1120]/5 group-hover:border-white/20'} ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                      {notif.icon}
                    </div>
                    <div>
                      <h4 className={`text-sm ${notif.unread ? 'font-bold group-hover:text-[#00D4FF]' : 'font-semibold '} transition-colors ${isDarkMode ? 'text-white text-slate-300' : 'text-slate-900 text-slate-500'}`}>
                        {notif.title}
                      </h4>
                      <p className={`text-sm mt-1 line-clamp-2 leading-snug ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{notif.message}</p>
                      <p className="text-xs text-[#00D4FF] mt-2 font-bold  ">{notif.time}</p>
                    </div>
                    {notif.unread && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#E30A17] mt-1.5 shrink-0 ml-auto shadow-[0_0_10px_rgba(227,10,23,0.5)]"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className={`p-3 border-t text-center hover:bg-white/5/5 transition-colors ${isDarkMode ? 'border-white/10 bg-[#0B1120]' : 'border-slate-200 bg-white'}`}>
            <button 
              onClick={() => { setIsOpen(false); navigate('/dashboard/notice'); }}
              className={`text-sm font-bold hover:text-white transition-colors w-full ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
