import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { BellRing, Pin, Plus, Send, AlertCircle, Radio, Clock, ShieldAlert, CheckCircle2, Globe2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CustomDropdown from '../components/CustomDropdown';
import useThemeMode from '../hooks/useThemeMode';

export default function NoticeView() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '', audience: 'all' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const isDarkMode = useThemeMode();

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notices');
      setNotices(data.data || []);
    } catch (err) {
      console.error('Failed to fetch notices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;
    
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/notices', newNotice);
      setNewNotice({ title: '', content: '', audience: 'all' });
      setShowCreateForm(false);
      setSuccessMsg('Signal broadcasted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchNotices();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to establish broadcast tunnel.');
    } finally {
      setSubmitting(false);
    }
  };

  const canCreate = user?.role === 'admin' || user?.role === 'instructor';

  if (loading && notices.length === 0) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className={`w-12 h-12 border-4 border-t-[#FFD700] rounded-full animate-spin shadow-[0_0_15px_rgba(255,215,0,0.5)] ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in flex flex-col space-y-8 max-w-6xl mx-auto pb-12">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-6 mt-4 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-3xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
             <Radio className={`w-8 h-8 ${isDarkMode ? 'text-[#FFD700]' : 'text-slate-700'}`} /> Global Notices
          </h1>
          <p className={`font-medium text-sm mt-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Official announcements and platform-wide updates.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {successMsg && (
            <span className="text-[#E67E22] font-bold   text-[10px] bg-[#E67E22]/10 px-3 py-1.5 rounded-md border border-[#E67E22]/20 animate-in slide-in-from-right-4 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5"/> {successMsg}
            </span>
          )}
          {canCreate && !showCreateForm && (
            <button 
              onClick={() => setShowCreateForm(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD700] to-yellow-600 text-[#0B0E14] font-black   text-xs rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.2)] hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] hover:-translate-y-0.5 transition-all outline-none focus:ring-2 focus:ring-[#FFD700]/50"
            >
              <Plus className="w-4 h-4" /> Create Notice
            </button>
          )}
        </div>
      </div>

      {/* Create Notice Form */}
      {showCreateForm && (
        <div className={`backdrop-blur-xl rounded-3xl border shadow-2xl p-6 md:p-8 relative overflow-hidden animate-in fade-in slide-in-from-top-4 ${isDarkMode ? 'bg-[#1E293B]/80 border-white/10' : 'bg-white/95 border-slate-200'}`}>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#E30A17]/10 to-transparent rounded-full blur-[80px] pointer-events-none -z-10"></div>
          
          <div className={`flex justify-between items-center mb-8 border-b pb-4 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
             <h2 className={`text-lg font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                 <ShieldAlert className="w-5 h-5 text-[#E30A17]" /> Draft New Notice
             </h2>
             <button onClick={() => setShowCreateForm(false)} className={`font-black text-[10px] px-4 py-2 rounded-lg border transition-colors ${isDarkMode ? 'text-slate-200 hover:text-white bg-[#1E293B]/5 border-white/10' : 'text-slate-600 hover:text-slate-900 bg-slate-50 border-slate-200'}`}>Cancel</button>
          </div>
          
          {errorMsg && (
             <div className="mb-6 px-4 py-3 bg-[#E30A17]/10 text-[#E30A17] rounded-xl text-xs font-bold   border border-[#E30A17]/20 flex items-center gap-2 shadow-sm animate-in fade-in">
                <AlertCircle className="w-4 h-4" /> {errorMsg}
             </div>
          )}

          <form onSubmit={handleCreateNotice} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                    <label className={`text-[10px] font-black ${isDarkMode ? 'text-[#FFD700]' : 'text-slate-700'}`}>Announcement Title</label>
                    <div className={`relative border rounded-xl overflow-hidden focus-within:ring-1 transition-all shadow-inner ${isDarkMode ? 'border-white/10 focus-within:border-[#FFD700]/50 focus-within:ring-[#FFD700]/50 bg-[#1E293B]' : 'border-slate-300 focus-within:border-indigo-500 focus-within:ring-indigo-500 bg-white'}`}>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. End of Semester Examinations Update"
                        value={newNotice.title}
                        onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                        className={`w-full px-4 py-3.5 bg-transparent font-medium text-sm outline-none transition-colors ${isDarkMode ? 'text-white placeholder:text-slate-300' : 'text-slate-900 placeholder:text-slate-400'}`}
                      />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className={`text-[10px] font-black ${isDarkMode ? 'text-[#FFD700]' : 'text-slate-700'}`}>Target Audience</label>
                    <CustomDropdown
                      value={newNotice.audience}
                      onChange={(val) => setNewNotice({ ...newNotice, audience: val })}
                      options={[
                        { label: 'Global (All Nodes)', value: 'all' },
                        { label: 'Students Only', value: 'student' },
                        { label: 'Parents Only', value: 'parent' },
                        { label: 'Instructors Only', value: 'instructor' },
                        { label: 'Alpha Clearance (Admins)', value: 'admin' }
                      ]}
                      className={`w-full [&>button]:py-3.5 [&>button]:font-medium ${isDarkMode ? '[&>button]:bg-[#1E293B] [&>button]:border-white/10 [&>button]:text-white' : '[&>button]:bg-white [&>button]:border-slate-300 [&>button]:text-slate-900'}`}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className={`text-[10px] font-black ${isDarkMode ? 'text-[#FFD700]' : 'text-slate-700'}`}>Message Content</label>
                <textarea 
                  required
                  placeholder="Type your official announcement here..."
                  rows={5}
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  className={`w-full p-4 border rounded-xl outline-none focus:ring-1 font-medium resize-none shadow-inner transition-all text-sm ${isDarkMode ? 'bg-[#1E293B] border-white/10 text-white focus:border-[#FFD700]/50 focus:ring-[#FFD700]/50 placeholder:text-slate-300' : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 placeholder:text-slate-400'}`}
                ></textarea>
            </div>

            <div className={`flex justify-end pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className={`flex items-center justify-center gap-2 px-8 py-3.5 font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(227,10,23,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-50 min-w-[200px] bg-[#E67E22] hover:bg-[#CF711F] shadow-md border border-[#E67E22] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                >
                  {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send className="w-4 h-4" />}
                  {submitting ? 'Publishing...' : 'Publish Notice'}
                </button>
            </div>
          </form>
        </div>
      )}

      {/* Feed Architecture */}
      {notices.length === 0 && !showCreateForm ? (
        <div className={`p-16 text-center rounded-3xl border backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden ${isDarkMode ? 'bg-[#1E293B]/80 border-white/10' : 'bg-white/95 border-slate-200'}`}>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat opacity-[0.03] pointer-events-none"></div>
           <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 border shadow-inner ${isDarkMode ? 'bg-[#1E293B] text-[#FFD700]/30 border-white/5' : 'bg-slate-100 text-slate-300 border-slate-200'}`}>
             <BellRing className="w-10 h-10" />
           </div>
           <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>You're caught up!</h3>
           <p className={`max-w-sm mb-6 text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>There are no official announcements at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {notices.map((notice) => (
            <div key={notice.id} className={`rounded-3xl border backdrop-blur-xl shadow-2xl overflow-hidden p-6 md:p-8 transition-all duration-300 relative group flex flex-col md:flex-row gap-6 ${isDarkMode ? 'bg-[#1E293B]/80 border-white/10 hover:shadow-[0_0_30px_rgba(255,215,0,0.1)] hover:border-[#FFD700]/30' : 'bg-white/95 border-slate-200 hover:shadow-lg hover:border-slate-300'}`}>
                
                <div className={`absolute top-0 left-0 w-1 h-full opacity-50 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'bg-[#FFD700]' : 'bg-indigo-500'}`}></div>
                
                <div className={`w-14 h-14 border rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${isDarkMode ? 'bg-[#1E293B] border-white/10 text-[#FFD700]' : 'bg-slate-50 border-slate-200 text-indigo-600'}`}>
                  <Pin className="w-6 h-6 transform group-hover:rotate-12 transition-transform" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-3">
                    <h3 className={`font-bold text-lg md:text-xl pr-4 transition-colors ${isDarkMode ? 'text-white group-hover:text-[#FFD700]' : 'text-slate-900 group-hover:text-indigo-600'}`}>{notice.title}</h3>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[9px]   font-black px-3 py-1.5 rounded-lg border shadow-sm ${
                          notice.audience === 'all' ? 'bg-[#FFD700]/10 border-[#FFD700]/20 text-[#FFD700]' :
                          notice.audience === 'student' ? 'bg-[#E67E22]/10 border-[#E67E22]/20 text-[#E67E22]' :
                          notice.audience === 'instructor' ? 'bg-blue-500/100/10 border-blue-500/20 text-blue-400' :
                          'bg-[#E30A17]/10 border-[#E30A17]/20 text-[#E30A17]'
                      }`}>
                        {notice.audience === 'all' ? 'Global Alpha' : notice.audience}
                      </span>
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border flex items-center gap-1.5 shadow-inner ${isDarkMode ? 'text-slate-300 bg-[#1E293B] border-white/5' : 'text-slate-600 bg-slate-50 border-slate-200'}`}>
                        <Clock className="w-3 h-3" /> {new Date(notice.date || notice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className={`p-4 border rounded-xl shadow-inner mt-2 ${isDarkMode ? 'bg-[#1E293B] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <p className={`whitespace-pre-wrap leading-relaxed text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{notice.content}</p>
                  </div>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
