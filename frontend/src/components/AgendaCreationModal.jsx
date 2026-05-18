import React, { useState } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { X, Calendar, Clock, BookOpen, Bell, AlertCircle, HeartHandshake, Users, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import CustomDropdown from './CustomDropdown';
import PremiumModal from './PremiumModal';

export default function AgendaCreationModal({ isOpen, onClose, onAgendaCreated, defaultType, defaultTitle, defaultTargetAudiences }) {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: defaultTitle || '',
    description: '',
    date: '',
    time: '',
    type: defaultType || 'announcement',
    targetAudiences: defaultTargetAudiences || []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'meeting', label: 'Meeting', icon: Users, color: 'bg-blue-500/100' },
    { id: 'exam', label: 'Exam', icon: BookOpen, color: 'bg-rose-500/100' },
    { id: 'announcement', label: 'Announcement', icon: Bell, color: 'bg-indigo-500/100' },
    { id: 'advice', label: 'Advice', icon: AlertCircle, color: 'bg-[#00D4FF]/100' },
    { id: 'support', label: 'Support', icon: HeartHandshake, color: 'bg-emerald-500/100' }
  ];

  const adminOptions = [
    {
      category: 'Broadcast',
      options: [
        { label: 'All Platform Users', value: ['all'] }
      ]
    },
    {
      category: 'Single Role',
      options: [
        { label: 'Students Only', value: ['student'] },
        { label: 'Instructors Only', value: ['instructor'] },
        { label: 'Parents Only', value: ['parent'] },
        { label: 'Admins Only', value: ['admin'] }
      ]
    },
    {
      category: 'Joint Roles',
      options: [
        { label: 'Instructors & Admins', value: ['instructor', 'admin'] },
        { label: 'Students & Instructors', value: ['student', 'instructor'] },
        { label: 'Students & Parents', value: ['student', 'parent'] },
      ]
    }
  ];

  const instructorOptions = [
    {
      category: 'My Classes',
      options: [
        { label: 'My Students', value: ['my_students'] }
      ]
    },
    {
      category: 'Global',
      options: [
        { label: 'Students & Parents', value: ['student', 'parent'] },
        { label: 'All Students', value: ['student'] }
      ]
    }
  ];

  const audienceOptions = user?.role === 'admin' ? adminOptions : instructorOptions;

  const handleSelectAudience = (valueArray) => {
    setFormData({ ...formData, targetAudiences: valueArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.targetAudiences.length === 0) {
      setError('Please select at least one target audience.');
      return;
    }
    
    const dateTimeCombined = new Date(`${formData.date}T${formData.time || '00:00'}`);

    setLoading(true);
    setError('');
    
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        date: dateTimeCombined,
        type: formData.type,
        color: categories.find(c => c.id === formData.type)?.color || 'bg-indigo-500/100',
        targetAudiences: formData.targetAudiences
      };
      
      const res = await api.post('/calendar', payload);
      if (res.data.success) {
        onAgendaCreated(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create agenda. Ensure you have permissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PremiumModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className={`p-6 border-b flex justify-between items-center shrink-0 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                 <h2 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <Calendar className="w-5 h-5 text-[#00D4FF]" /> Create New Agenda
                 </h2>
                 <button onClick={onClose} className={`p-2 rounded-full transition-colors bg-white/5 backdrop-blur-sm border ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 border-slate-700/50' : 'hover:bg-slate-100 text-slate-500 border-slate-200'}`}>
                   <X className="w-5 h-5" />
                 </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                 {error && (
                   <div className="p-4 mb-6 rounded-xl bg-rose-500/100/20 border border-rose-500/30 text-rose-300 text-sm font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> {error}
                   </div>
                 )}

                 <form id="agendaForm" onSubmit={handleSubmit} className="space-y-6">
                    
                    <div className="space-y-4 relative">
                       <h3 className={`font-bold text-sm border-b pb-2 ${isDarkMode ? 'text-slate-300 border-white/5' : 'text-slate-500 border-slate-100'}`}>Target Audience</h3>
                       
                       <CustomDropdown
                         options={audienceOptions}
                         value={formData.targetAudiences}
                         onChange={handleSelectAudience}
                         placeholder="Select Target Audience..."
                       />
                    </div>

                    <div className="space-y-4 mt-8">
                       <h3 className={`font-bold text-sm border-b pb-2 ${isDarkMode ? 'text-slate-300 border-white/5' : 'text-slate-500 border-slate-100'}`}>Agenda Details</h3>
                       
                       <div>
                         <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Title</label>
                         <input 
                           type="text" required 
                           value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                           className={`w-full px-4 py-3 border rounded-xl text-sm focus:border-[#00D4FF]/50 focus:ring-1 focus:ring-[#00D4FF]/50 font-medium outline-none placeholder:text-slate-500 transition-all ${isDarkMode ? 'bg-[#0B1120]/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`} 
                           placeholder="e.g., Parent-Teacher Meeting, Final Math Exam"
                         />
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Date</label>
                           <div className="relative">
                              <input 
                                type="date" required 
                                value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:border-[#00D4FF]/50 focus:ring-1 focus:ring-[#00D4FF]/50 font-medium outline-none color-scheme-dark transition-all ${isDarkMode ? 'bg-[#0B1120]/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`} 
                              />
                              <Calendar className={`absolute left-3 top-3.5 w-4 h-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
                           </div>
                         </div>
                         <div>
                           <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Time</label>
                           <div className="relative">
                              <input 
                                type="time" required 
                                value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}
                                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:border-[#00D4FF]/50 focus:ring-1 focus:ring-[#00D4FF]/50 font-medium outline-none color-scheme-dark transition-all ${isDarkMode ? 'bg-[#0B1120]/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`} 
                              />
                              <Clock className={`absolute left-3 top-3.5 w-4 h-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`} />
                           </div>
                         </div>
                       </div>

                       <div>
                         <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Category</label>
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                            {categories.map(cat => {
                              const IconComponent = cat.icon;
                              const isSelected = formData.type === cat.id;
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => setFormData({...formData, type: cat.id})}
                                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${isSelected ? (isDarkMode ? `bg-[#0B1120]/50 border-${cat.color.split('-')[1]}-500 shadow-sm` : `bg-white border-${cat.color.split('-')[1]}-500 shadow-md ring-1 ring-${cat.color.split('-')[1]}-500`) : (isDarkMode ? 'bg-[#0B1120]/50 hover:border-white/20' : 'bg-white hover:border-slate-300 shadow-sm')} ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}
                                >
                                   <div className={`w-8 h-8 rounded-full mb-1 flex items-center justify-center ${isSelected ? cat.color + ' shadow-md' : (isDarkMode ? 'bg-[#1E293B] ' : 'bg-slate-100 ')} ${isDarkMode ? (isSelected ? 'text-white' : 'text-slate-400') : (isSelected ? 'text-white' : 'text-slate-500')}`}>
                                     <IconComponent className="w-4 h-4" />
                                   </div>
                                   <span className={`text-[10px] font-bold ${isSelected ? (isDarkMode ? 'text-white' : 'text-slate-900') : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>{cat.label}</span>
                                </button>
                              )
                            })}
                         </div>
                       </div>

                       <div>
                         <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Description / Instructions (Optional)</label>
                         <textarea 
                           rows="3"
                           value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                           className={`w-full !px-4 py-3 border rounded-xl text-sm focus:border-[#00D4FF]/50 focus:ring-1 focus:ring-[#00D4FF]/50 font-medium resize-none outline-none placeholder:text-slate-500 transition-all ${isDarkMode ? 'bg-[#0B1120]/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`} 
                           placeholder="Add any specific advice, support contexts, links, or instructions here..."
                         ></textarea>
                       </div>
                    </div>
                 </form>
              </div>

              {/* Footer */}
              <div className={`p-6 border-t shrink-0 bg-transparent rounded-b-[32px] flex justify-end gap-3 glass-card ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                 <button type="button" onClick={onClose} className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm border ${isDarkMode ? 'text-slate-300 border-slate-700 bg-[#1E293B] hover:bg-slate-700' : 'text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-sm'}`}>
                    Cancel
                 </button>
                 <button 
                   type="submit" 
                   form="agendaForm" 
                   disabled={loading}
                   className={`px-8 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-[#00D4FF] hover:bg-[#00A3CC] shadow-lg shadow-[#00D4FF]/20 text-white text-sm hover:-translate-y-0.5`}
                 >
                    {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                    Broadcast
                 </button>
              </div>
    </PremiumModal>
  );
}
