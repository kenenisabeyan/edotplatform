import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Shield, Bell, Lock, Eye, CreditCard, Clock, Sliders, Save, Palette, Key, BookOpen, Settings, User, Mail, Smartphone, Globe, AlertTriangle, Fingerprint, Activity, CheckCircle2 } from 'lucide-react';
import CustomDropdown from '../components/CustomDropdown';
import useThemeMode from '../hooks/useThemeMode';

export default function SettingsView() {
  const { user, login } = useAuth(); // use login to refresh context
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [profileData, setProfileData] = useState({ name: '', email: '' });

  const [connectEmail, setConnectEmail] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectMsg, setConnectMsg] = useState('');

  const [activeTab, setActiveTab] = useState('general');
  const isDarkMode = useThemeMode();

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || '', email: user.email || '' });
    }
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');
      
      const payload = { 
        [user.role]: settings[user.role],
        common: settings.common
      };
      await api.put('/settings', payload);

      if (profileData.name !== user.name || profileData.email !== user.email) {
        const profileRes = await api.put('/users/profile', profileData);
        if (profileRes.data.success && profileRes.data.data) {
           const token = localStorage.getItem('token');
           if (token) {
               window.location.reload(); 
               return; 
           }
        }
      }

      setSuccessMsg('Settings updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleConnectParent = async () => {
    if (!connectEmail) return;
    try {
      setConnecting(true);
      setConnectMsg('');
      const res = await api.post('/users/connect', { email: connectEmail });
      if (res.data.success) {
        setConnectMsg('Connected successfully!');
        setConnectEmail('');
      } else {
        setConnectMsg(res.data.message || 'Failed to connect.');
      }
    } catch (err) {
      setConnectMsg(err.response?.data?.message || 'Error connecting.');
    } finally {
      setConnecting(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [user.role]: {
        ...(prev[user.role] || {}),
        [field]: value
      }
    }));
  };

  const handleCommonChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      common: {
        ...(prev.common || {}),
        [field]: value
      }
    }));
  };

  const ToggleSwitch = ({ label, description, checked, onChange }) => (
    <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all group shadow-sm ${isDarkMode ? 'bg-[#0B1120] border-white/5 hover:border-[#F97316]/30' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
      <div className="flex items-start gap-4 pr-6">
        <div>
          <h4 className={`font-bold text-sm transition-colors ${isDarkMode ? 'text-white group-hover:text-[#F97316]' : 'text-slate-800 group-hover:text-indigo-600'}`}>{label}</h4>
          <p className={`text-xs leading-relaxed mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>{description}</p>
        </div>
      </div>
      <button 
        type="button" 
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 outline-none focus:ring-2 focus:ring-offset-2 ${isDarkMode ? 'focus:ring-offset-[#0B1120] focus:ring-[#F97316]' : 'focus:ring-offset-white focus:ring-indigo-500'} ${checked ? (isDarkMode ? 'bg-[#00D4FF]' : 'bg-indigo-600') : (isDarkMode ? 'bg-slate-700' : 'bg-slate-300')}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full shadow-md transition-transform ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white'} ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  const NumberSlider = ({ label, description, value, onChange, min, max, unit = '' }) => (
    <div className={`p-5 rounded-2xl border transition-all shadow-sm ${isDarkMode ? 'bg-[#0B1120] border-white/5 hover:border-white/10' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{label}</h4>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>{description}</p>
        </div>
        <span className={`font-black text-lg px-3 py-1 rounded-lg shrink-0 shadow-inner ${isDarkMode ? 'text-[#00D4FF] bg-[#00D4FF]/10 border border-[#00D4FF]/30' : 'text-indigo-600 bg-indigo-50 border border-indigo-200'}`}>{value}{unit}</span>
      </div>
      <div className="px-1">
        <input 
          type="range" min={min} max={max} value={value} 
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${isDarkMode ? 'bg-slate-700 accent-[#F97316]' : 'bg-slate-200 accent-indigo-600'}`}
        />
        <div className={`flex justify-between text-[10px] font-black mt-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>
    </div>
  );

  const InputField = ({ label, description, type = "text", value, onChange, placeholder, icon: Icon }) => (
    <div className={`p-5 rounded-2xl border transition-all shadow-sm ${isDarkMode ? 'bg-[#0B1120] border-white/5 hover:border-white/10' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
      <label className={`block text-xs font-black mb-2 flex items-center gap-2 ${isDarkMode ? 'text-[#F97316]' : 'text-slate-700'}`}>
        {Icon && <Icon className="w-4 h-4" />} {label}
      </label>
      {description && <p className={`text-xs mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>{description}</p>}
      <div className="relative">
        <input 
          type={type} 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full p-3.5 border rounded-xl font-medium text-sm outline-none focus:ring-2 focus:border-transparent transition-all shadow-inner ${isDarkMode ? 'bg-[#0B1120] border-white/10 text-white focus:ring-[#F97316] placeholder:text-slate-300' : 'bg-white border-slate-300 text-slate-900 focus:ring-indigo-500 placeholder:text-slate-400'}`}
        />
      </div>
    </div>
  );

  if (loading || !settings) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className={`w-12 h-12 border-4 border-t-[#F97316] rounded-full animate-spin shadow-[0_0_15px_rgba(255,215,0,0.5)] ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div>
    </div>
  );

  const roleConfig = settings[user.role] || {};
  const commonConfig = settings.common || {};

  const tabs = [
    { id: 'general', icon: User, label: 'General Profile' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'security', icon: Lock, label: 'Security & Auth' }
  ];

  if (user.role === 'admin') {
    tabs.push({ id: 'platform', icon: Globe, label: 'Platform DNA' });
    tabs.push({ id: 'ledger', icon: CreditCard, label: 'Ledger & AI' });
  } else if (user.role === 'instructor') {
    tabs.push({ id: 'pedagogy', icon: BookOpen, label: 'Pedagogy Logic' });
    tabs.push({ id: 'ai', icon: Activity, label: 'Automation & AI' });
  } else if (user.role === 'student') {
    tabs.push({ id: 'privacy', icon: Eye, label: 'Privacy & Sharing' });
    tabs.push({ id: 'family', icon: Shield, label: 'Family Link' });
  } else if (user.role === 'parent') {
    tabs.push({ id: 'billing', icon: CreditCard, label: 'Billing Settings' });
    tabs.push({ id: 'alerts', icon: AlertTriangle, label: 'Alert Thresholds' });
  }

  return (
    <div className="animate-in fade-in max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b pb-6 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h2 className={`text-3xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
             <Sliders className={`w-8 h-8 ${isDarkMode ? 'text-[#F97316]' : 'text-slate-700'}`} /> Configuration Hub
          </h2>
          <p className={`font-medium text-sm mt-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Manage preferences, security protocols, and platform mechanics.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          {successMsg && (
            <span className="text-[#00D4FF] font-bold   text-[10px] bg-[#00D4FF]/10 px-3 py-1.5 rounded-md border border-[#00D4FF]/20 animate-in slide-in-from-right-4 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5"/> {successMsg}
            </span>
          )}
          <button 
            onClick={handleSave} 
            disabled={saving}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 font-semibold text-sm rounded-xl hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border border-[#00D4FF] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
          >
            {saving ? <div className="w-4 h-4 border-2 border-[#0B1120]/30 border-t-[#0B1120] rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
            {saving ? 'Comitting...' : 'Apply Changes'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide sticky top-[104px]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left font-bold text-sm transition-all whitespace-nowrap outline-none ${
                  activeTab === tab.id 
                  ? (isDarkMode ? 'bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 shadow-inner' : 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-inner') 
                  : (isDarkMode ? 'text-slate-200 hover:bg-white/5/5 hover:text-white border border-transparent focus:ring-2 focus:ring-[#F97316]/50' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent focus:ring-2 focus:ring-indigo-500/50')
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}`} /> {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Configuration Panel */}
        <div className={`flex-1 backdrop-blur-xl border p-6 md:p-8 rounded-3xl shadow-2xl min-h-[500px] relative overflow-hidden ${isDarkMode ? 'bg-[#0B1120]/80 border-white/10' : 'bg-white/95 border-slate-200'}`}>
          
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#F97316]/3 to-[#008A32]/3 rounded-full blur-[100px] pointer-events-none -z-10"></div>

          <div className="animate-in fade-in slide-in-from-right-4 duration-300 z-10 relative space-y-8">
            
            {/* GENERAL TAB (Database Connected) */}
            {activeTab === 'general' && (
              <>
                <div className={`border-b pb-4 mb-6 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  <h3 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>General Profile Mechanics</h3>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Configure baseline structural data and display protocols.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="Public Display Name" value={profileData.name} onChange={(v) => setProfileData(p => ({...p, name: v}))} placeholder="Full Name" type="text" />
                  <InputField label="Primary Email Route" value={profileData.email} onChange={(v) => setProfileData(p => ({...p, email: v}))} placeholder="Email" type="email" />
                </div>
                <div className="space-y-4">
                  <label className={`block text-xs font-black ${isDarkMode ? 'text-[#F97316]' : 'text-slate-700'}`}>Timezone Protocol</label>
                  <CustomDropdown
                    value={commonConfig.timezone || '(GMT+03:00) East Africa Time'}
                    onChange={(v) => handleCommonChange('timezone', v)}
                    options={[
                      {label: '(GMT+03:00) East Africa Time', value: '(GMT+03:00) East Africa Time'},
                      {label: '(GMT+00:00) Greenwich Mean Time', value: '(GMT+00:00) Greenwich Mean Time'},
                      {label: '(GMT-05:00) Eastern Time', value: '(GMT-05:00) Eastern Time'},
                      {label: '(GMT-08:00) Pacific Time', value: '(GMT-08:00) Pacific Time'},
                    ]}
                    className={`w-full md:w-1/2 [&>button]:py-3.5 [&>button]:border-white/10 ${isDarkMode ? '[&>button]:bg-[#0B1120] [&>button]:text-white' : '[&>button]:bg-white [&>button]:text-slate-900'}`}
                  />
                </div>
              </>
            )}

            {/* NOTIFICATIONS TAB (Database Connected) */}
            {activeTab === 'notifications' && (
              <>
                <div className={`border-b pb-4 mb-6 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  <h3 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Notification Matrix</h3>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Design your interrupt frequency and communication channels.</p>
                </div>
                <div className="grid gap-4">
                  <ToggleSwitch label="System Announcements" description="Critical platform updates and scheduled maintenance downtimes." checked={commonConfig.notifySystem ?? true} onChange={(v) => handleCommonChange('notifySystem', v)} />
                  <ToggleSwitch label="Direct Messages" description="In-app and email routing for personal communications." checked={commonConfig.notifyMessages ?? true} onChange={(v) => handleCommonChange('notifyMessages', v)} />
                  <ToggleSwitch label="Weekly Digested Reports" description="Algorithmic summaries sent via email every Sunday at 00:00 UTC." checked={commonConfig.notifyDigest ?? false} onChange={(v) => handleCommonChange('notifyDigest', v)} />
                </div>
              </>
            )}

            {/* SECURITY TAB (Mocked Advanced UI) */}
            {activeTab === 'security' && (
              <>
                <div className={`border-b pb-4 mb-6 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  <h3 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Security & Authentication</h3>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Audit logs, 2FA protocols, and access management.</p>
                </div>
                <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <h4 className={`font-bold text-sm flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}><Fingerprint className={`w-4 h-4 ${isDarkMode ? 'text-[#F97316]' : 'text-indigo-600'}`}/> Biometric / Two-Factor Protocol</h4>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Currently utilizing standard credential validation. We recommend enabling 2FA.</p>
                  </div>
                  <button type="button" className={`px-5 py-2.5 border font-semibold rounded-lg transition-all shrink-0 bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border-[#00D4FF] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Enable 2FA</button>
                </div>
                <div className={`p-6 rounded-2xl border flex flex-col justify-center gap-4 shadow-sm ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <h4 className="font-bold text-rose-500 text-sm ">Device Sessions</h4>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>1 active session on Windows NT 10.0; Win64.</p>
                  </div>
                  <button type="button" className={`w-max px-5 py-2.5 border font-semibold rounded-lg transition-all bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border-[#00D4FF] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Terminate All Other Sessions</button>
                </div>
              </>
            )}

            {/* INSTRUCTOR: PEDAGOGY */}
            {activeTab === 'pedagogy' && (
              <>
                <div className={`border-b pb-4 mb-6 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  <h3 className={`text-lg font-black ${isDarkMode ? 'text-[#F97316]' : 'text-slate-900'}`}>Pedagogy Logic</h3>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Configure instructional defaults and visibility parameters.</p>
                </div>
                <div className="space-y-6">
                  <InputField 
                    icon={Clock} label="Consultation Window (Office Hours)" 
                    description="Define your public schedule for dynamic student booking."
                    type="text" value={roleConfig.consultationHours || ''} onChange={(v) => handleChange('consultationHours', v)} placeholder="e.g. Mon-Wed 3PM-5PM (GMT+3)" 
                  />
                  <div className={`p-5 rounded-2xl border transition-all shadow-sm ${isDarkMode ? 'bg-[#0B1120] border-white/5 hover:border-white/10' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                    <label className={`block text-xs font-black mb-2 flex items-center gap-2 ${isDarkMode ? 'text-[#F97316]' : 'text-slate-700'}`}>
                       <BookOpen className="w-4 h-4" /> Catalog Autonomy
                    </label>
                    <p className={`text-xs mb-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Default visibility protocol for unapproved drafted courses.</p>
                    <CustomDropdown
                      value={roleConfig.courseVisibility || 'public'}
                      onChange={(val) => handleChange('courseVisibility', val)}
                      options={[
                        { label: 'Public (Requires Approval Algorithm)', value: 'public' },
                        { label: 'Hidden (Private Link Only)', value: 'enrolled_only' }
                      ]}
                      className={`w-full md:w-3/4 [&>button]:py-3.5 [&>button]:border-white/10 font-bold ${isDarkMode ? '[&>button]:bg-[#0B1120] [&>button]:text-white' : '[&>button]:bg-white [&>button]:text-slate-900'}`}
                    />
                  </div>
                </div>
              </>
            )}

            {/* INSTRUCTOR: AI */}
            {activeTab === 'ai' && (
              <>
                <div className={`border-b pb-4 mb-6 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  <h3 className={`text-lg font-black ${isDarkMode ? 'text-[#F97316]' : 'text-slate-900'}`}>Automation & AI</h3>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Algorithmic generation toggles.</p>
                </div>
                <div className="grid gap-4">
                  <ToggleSwitch 
                    label="Automated Tag Analysis" 
                    description="Generate algorithmic performance reports on student progress asynchronously to save manual review time." 
                    checked={roleConfig.autoTags !== false} onChange={(v) => handleChange('autoTags', v)} 
                  />
                  <ToggleSwitch 
                    label="AI Auto-Grading (Beta)" 
                    description="Allow the system to automatically infer grades on free-text quiz formats." 
                    checked={roleConfig.autoGrade ?? false} onChange={(v) => handleChange('autoGrade', v)} 
                  />
                </div>
              </>
            )}

            {/* ADMIN: PLATFORM */}
            {activeTab === 'platform' && (
              <>
                <div className={`border-b pb-4 mb-6 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  <h3 className={`text-lg font-black ${isDarkMode ? 'text-[#F97316]' : 'text-slate-900'}`}>Platform DNA</h3>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Global branding and root configurations.</p>
                </div>
                <div className={`p-8 rounded-2xl border flex flex-col justify-center mb-6 shadow-sm ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <label className={`block text-xs font-black mb-4 flex items-center gap-2 ${isDarkMode ? 'text-[#F97316]' : 'text-slate-700'}`}><Palette className="w-4 h-4"/> Global Hex Code</label>
                  <p className={`text-xs mb-6 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>This cascades the color injection across the SCSS variables.</p>
                  <div className={`flex gap-4 items-center p-3 rounded-xl border w-max shadow-inner ${isDarkMode ? 'bg-[#0B1120] border-white/10' : 'bg-white border-slate-200'}`}>
                    <input 
                      type="color" 
                      value={roleConfig.primaryColor || '#0B1120'}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      className="w-10 h-10 p-0 border-none rounded-lg cursor-pointer bg-transparent"
                    />
                    <span className={`font-mono font-black pr-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{roleConfig.primaryColor || '#0B1120'}</span>
                  </div>
                </div>
                <InputField 
                    icon={Key} label="External Auth API Proxy Key" 
                    description="Overriding the live sk_live secret layer."
                    type="password" value={roleConfig.apiKey || ''} onChange={(v) => handleChange('apiKey', v)} placeholder="sk_live_..." 
                />
              </>
            )}

            {/* ADMIN: LEDGER & AI */}
            {activeTab === 'ledger' && (
              <>
                <div className={`border-b pb-4 mb-6 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  <h3 className={`text-lg font-black ${isDarkMode ? 'text-[#F97316]' : 'text-slate-900'}`}>Ledger & Intelligence</h3>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Financial logic and automated interventions.</p>
                </div>
                <div className="grid gap-6">
                  <NumberSlider 
                    label="Standard Ledger Commission" 
                    description="Default global percentage fee cut extracted from instructor ticket sales."
                    min={0} max={30} unit="%"
                    value={roleConfig.feePercentage ?? 10} 
                    onChange={(val) => handleChange('feePercentage', val)} 
                  />
                  <ToggleSwitch 
                    label="AI Intervention Protocol" 
                    description="Aggressively trigger automated behavioral interventions server-side for severe attendance drops."
                    checked={roleConfig.autoInterventionTriggers !== false} 
                    onChange={(val) => handleChange('autoInterventionTriggers', val)} 
                  />
                </div>
              </>
            )}

            {/* STUDENT: PRIVACY */}
            {activeTab === 'privacy' && (
              <>
                <div className={`border-b pb-4 mb-6 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  <h3 className={`text-lg font-black ${isDarkMode ? 'text-[#F97316]' : 'text-slate-900'}`}>Transparency Matrix</h3>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Control your data visibility to guardians and peers.</p>
                </div>
                <div className="grid gap-4">
                  <ToggleSwitch 
                    label="Private Mode" 
                    description="Go completely off-grid. Prevents automatic activity syncing to supporters." 
                    checked={roleConfig.privateMode === true} onChange={(v) => handleChange('privateMode', v)} 
                  />
                  <ToggleSwitch 
                    label="Share Milestones with Parents" 
                    description="Allow linked parent accounts to see when you complete a course or lesson." 
                    checked={roleConfig.shareMilestones !== false} onChange={(v) => handleChange('shareMilestones', v)} 
                  />
                  <ToggleSwitch 
                    label="Share Grade Summaries" 
                    description="Allow parents to view your aggregate test scores and quiz metrics." 
                    checked={roleConfig.shareGrades !== false} onChange={(v) => handleChange('shareGrades', v)} 
                  />
                </div>
              </>
            )}

            {/* STUDENT: FAMILY */}
            {activeTab === 'family' && (
              <>
                <div className={`border-b pb-4 mb-6 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  <h3 className={`text-lg font-black ${isDarkMode ? 'text-[#F97316]' : 'text-slate-900'}`}>Family Supporter Link</h3>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Connect your account securely via email validation.</p>
                </div>
                <div className={`p-8 rounded-2xl border border-l-4 shadow-sm ${isDarkMode ? 'bg-[#0B1120] border-white/5 border-l-[#008A32]' : 'bg-slate-50 border-slate-200 border-l-[#008A32]'}`}>
                  <h4 className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Guardian Email Address</h4>
                  <p className={`text-xs mb-6 font-medium max-w-lg leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Link your account with a parent's registered email to securely share progress dynamically. Both parties must be registered.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="email" 
                      value={connectEmail}
                      onChange={(e) => setConnectEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className={`flex-1 p-3.5 border rounded-xl font-semibold outline-none focus:ring-2 focus:ring-[#008A32] focus:border-transparent shadow-inner ${isDarkMode ? 'bg-[#0B1120] border-white/10 text-white placeholder:text-slate-300' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'}`}
                    />
                    <button 
                      type="button"
                      onClick={handleConnectParent}
                      disabled={connecting}
                      className={`px-6 py-3.5 font-semibold rounded-xl hover:shadow-[0_0_15px_rgba(0,138,50,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-50 shrink-0 bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border border-[#00D4FF] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                    >
                      {connecting ? 'Linking...' : 'Establish Link'}
                    </button>
                  </div>
                  {connectMsg && <p className={`mt-4 text-xs font-bold   ${(connectMsg.includes('Error') || connectMsg.includes('Failed') || connectMsg.includes('not found') || connectMsg.includes('Already')) ? 'text-[#E30A17]' : 'text-[#00D4FF]'}`}>{connectMsg}</p>}
                </div>
              </>
            )}

            {/* PARENT: BILLING */}
            {activeTab === 'billing' && (
              <>
                <div className={`border-b pb-4 mb-6 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  <h3 className={`text-lg font-black ${isDarkMode ? 'text-[#F97316]' : 'text-slate-900'}`}>Subscriptions & Billing</h3>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Manage payment sources for dependent enrollments.</p>
                </div>
                <div className={`p-6 rounded-2xl border shadow-sm ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                  <label className={`block text-xs font-black mb-4 flex items-center gap-2 ${isDarkMode ? 'text-[#F97316]' : 'text-slate-700'}`}><CreditCard className="w-4 h-4"/> Default Payment Protocol</label>
                  <CustomDropdown
                    value={roleConfig.billingMethod || 'unlinked'}
                    onChange={(val) => handleChange('billingMethod', val)}
                    options={[
                      { label: 'Unlinked / Manual Checkout', value: 'unlinked' },
                      { label: 'Stored Payment Vault', value: 'card' },
                      { label: 'Direct Bank Wire Interface', value: 'bank_transfer' }
                    ]}
                    className={`w-full md:w-3/4 [&>button]:py-4 [&>button]:border-white/10 ${isDarkMode ? '[&>button]:bg-[#0B1120] [&>button]:text-white' : '[&>button]:bg-white [&>button]:text-slate-900'}`}
                  />
                </div>
              </>
            )}

            {/* PARENT: ALERTS */}
            {activeTab === 'alerts' && (
              <>
                <div className={`border-b pb-4 mb-6 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  <h3 className={`text-lg font-black ${isDarkMode ? 'text-[#F97316]' : 'text-slate-900'}`}>Support Thresholds</h3>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-500'}`}>Algorithmic danger alerts based on real student data.</p>
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                  <NumberSlider 
                    label="Grade Alert Drop Threshold" 
                    description="Trigger real-time alert if average grades structurally fall below this mark."
                    min={0} max={100} unit="%"
                    value={roleConfig.alertGradeBelow ?? 70} 
                    onChange={(val) => handleChange('alertGradeBelow', val)} 
                  />
                  <NumberSlider 
                    label="Absence Danger Threshold" 
                    description="Immediately escalate alert after this many consecutive missed sessions."
                    min={1} max={10} unit=" days"
                    value={roleConfig.alertAbsenceCount ?? 3} 
                    onChange={(val) => handleChange('alertAbsenceCount', val)} 
                  />
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
