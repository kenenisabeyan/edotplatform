import React, { useState, useEffect, useRef } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { Bell, Clock, Award, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
    const fetchNotifications = async () => {
      try {
        let notifs = [];
        const role = user?.role || 'student';
        
        if (role === 'admin') {
          const { data } = await api.get('/admin/courses/pending');
          if (data.count > 0) {
            notifs.push({
              id: 'admin_pending',
              title: 'Action Required',
              message: `There are ${data.count} pending courses requiring your approval.`,
              icon: <ClipboardCheck className="w-5 h-5 text-amber-500" />,
              link: '/dashboard/approvals',
              time: 'Just now',
              unread: true
            });
          }
        } else if (role === 'instructor') {
          const { data } = await api.get('/instructor/courses');
          const pending = data.data.filter(c => c.status === 'pending');
          const approved = data.data.filter(c => c.status === 'approved');
          
          if (pending.length > 0) {
            notifs.push({
              id: 'inst_pending',
              title: 'Courses Under Review',
              message: `You have ${pending.length} courses waiting for admin approval.`,
              icon: <Clock className="w-5 h-5 text-amber-500" />,
              link: '/dashboard/my-courses',
              time: 'Recently',
              unread: true
            });
          }
          if (approved.length > 0) {
             notifs.push({
              id: 'inst_approved_mock', // Usually we'd check timestamps, just mocking a recent approval
              title: 'Course Approved!',
              message: `Good news! One of your courses has gone live.`,
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
              link: '/dashboard/my-courses',
              time: '1 hr ago',
              unread: false
            });
          }
        } else {
          notifs.push({
            id: 'stu_cert',
            title: 'New Certificate Available',
            message: 'You successfully completed Introduction to React! View your certificate.',
            icon: <Award className="w-5 h-5 text-[#4338ca]" />,
            link: '/dashboard/certificates',
            time: '2 hrs ago',
            unread: true
          });
          notifs.push({
            id: 'stu_course',
            title: 'Welcome to EDOT Platform',
            message: 'Explore our digital library and enroll in new courses today.',
            icon: <Bell className={`w-5 h-5 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />,
            link: '/dashboard/courses',
            time: '1 day ago',
            unread: false
          });
        }

        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => n.unread).length);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    if (user) {
      fetchNotifications();
      const intervalId = setInterval(fetchNotifications, 5000); // Poll notifications same as sidebar metrics
      return () => clearInterval(intervalId);
    }
  }, [user]);

  const handleNotificationClick = (link) => {
    setIsOpen(false);
    if (link) navigate(link);
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-full border flex items-center justify-center hover:text-white hover:border-[#FFD700]/30 hover:shadow-[0_0_15px_rgba(255,215,0,0.2)] transition-all relative focus:outline-none backdrop-blur-md ${isDarkMode ? 'border-white/10 bg-[#1E293B]/5 text-slate-300' : 'border-white/20 bg-white/10 text-white'}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 w-5 h-5 bg-[#E30A17] text-[10px] font-bold rounded-full flex items-center justify-center border-2 shadow-sm text-white ${isDarkMode ? 'border-[#0B0F19]' : 'border-[#1e3a8a]'}`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-3 w-80 sm:w-96 bg-[#1E293B]/95 backdrop-blur-xl rounded-2xl shadow-2xl border overflow-hidden z-[100] animate-in zoom-in-95 slide-in-from-top-2 duration-200 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
          <div className={`p-4 border-b flex justify-between items-center bg-black/40 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
            <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-sm font-semibold text-[#FFD700] hover:text-[#EAB308] hover:underline transition-all"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-[70vh] overflow-y-auto scrollbar-hide bg-black/20">
            {notifications.length === 0 ? (
              <div className={`p-8 text-center flex flex-col items-center ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                <div className={`w-16 h-16 rounded-full border flex items-center justify-center mb-4 ${isDarkMode ? 'bg-[#1E293B]/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                  <Bell className={`w-8 h-8 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
                </div>
                <p className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No new notifications</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map(notif => (
                  <button 
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif.link)}
                    className={`p-4 border-b text-left transition-colors flex gap-4 group ${notif.unread ? 'bg-[#1E293B]/5 hover:bg-[#1E293B]/10' : 'hover:bg-[#1E293B]/5'} ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}
                  >
                    <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center border transition-colors ${notif.unread ? 'bg-[#FFD700]/10 border-[#FFD700]/30 shadow-[0_0_15px_rgba(255,215,0,0.1)]' : 'bg-[#1E293B]/5 group-hover:border-white/20'} ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                      {notif.icon}
                    </div>
                    <div>
                      <h4 className={`text-sm ${notif.unread ? 'font-bold group-hover:text-[#FFD700]' : 'font-semibold '} transition-colors ${isDarkMode ? 'text-white text-slate-300' : 'text-slate-900 text-slate-500'}`}>
                        {notif.title}
                      </h4>
                      <p className={`text-sm mt-1 line-clamp-2 leading-snug ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{notif.message}</p>
                      <p className="text-xs text-[#E67E22] mt-2 font-bold  ">{notif.time}</p>
                    </div>
                    {notif.unread && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#E30A17] mt-1.5 shrink-0 ml-auto shadow-[0_0_10px_rgba(227,10,23,0.5)]"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className={`p-3 border-t text-center hover:bg-[#1E293B]/5 transition-colors ${isDarkMode ? 'border-white/10 bg-[#1E293B]' : 'border-slate-200 bg-white'}`}>
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
