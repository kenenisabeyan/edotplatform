import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Headphones
} from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../utils/firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import './AuthLayout.css';

// Custom Google Icon SVG
const GoogleIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={className}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

export default function AuthLayout({ defaultIsRegister = false }) {
  const [isRegister, setIsRegister] = useState(defaultIsRegister);
  
  // Extract auth context methods and session state
  const { login, socialLogin, register, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in (Session check)
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirect') || '/dashboard';
      navigate(redirect);
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState('student');
  const [regError, setRegError] = useState('');
  const [loadingReg, setLoadingReg] = useState(false);

  useEffect(() => {
    setIsRegister(defaultIsRegister);
  }, [defaultIsRegister]);

  const handleTabChange = (isReg) => {
    setIsRegister(isReg);
    setLoginError('');
    setRegError('');
    navigate(isReg ? '/register' : '/login');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoadingLogin(true);
    try {
      await login({ email: loginEmail, password: loginPassword });
    } catch (err) {
      setLoginError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleSocialLogin = async (providerName) => {
    try {
      setLoadingLogin(true);
      setLoginError('');
      
      const provider = providerName === 'Google' ? googleProvider : githubProvider;
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      await socialLogin({ 
        provider: providerName, 
        email: user.email || user.providerData?.[0]?.email || `${user.uid}@github.com`,
        name: user.displayName || user.email?.split('@')[0] || `${providerName} User`
      });
    } catch (err) {
      console.error(`${providerName} login error:`, err);
      let errorMsg = err.response?.data?.message || err.message || `${providerName} login failed`;
      if (providerName === 'GitHub' && (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed'))) {
        errorMsg = 'GitHub Sign-In is not configured in the Firebase Console yet. Please use Google or Email to authenticate.';
      }
      setLoginError(errorMsg);
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setLoadingReg(true);
    try {
      await register({ name: regName, email: regEmail, password: regPassword, role: regRole });
      setIsRegister(false); // Switch to login after successful register
      navigate('/login');
      setRegName(''); setRegEmail(''); setRegPassword('');
    } catch (err) {
      setRegError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoadingReg(false);
    }
  };

  if (authLoading) return null; // Avoid flashing page while checking session

  return (
    <>
      <Navbar />
      <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 md:py-16 auth-page-bg relative overflow-hidden font-sans pt-24 pb-12 z-10">
        
        {/* Soft background ambient glowing orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-[#FF5A00]/5 blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-[#00D4FF]/5 blur-3xl pointer-events-none -z-10"></div>
        
        {/* Floating Clouds in Background */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden -z-10 opacity-30">
          <div className="absolute top-[10%] left-[5%] animate-float-slow">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="#ffffff" className="drop-shadow-sm opacity-60">
              <path d="M100 40C100 23.4315 86.5685 10 70 10C61.3541 10 53.5939 13.6492 48.1633 19.508C44.757 16.6575 40.3807 15 35.6 15C24.5543 15 15.6 23.9543 15.6 35C15.6 35.8504 15.653 36.6881 15.7554 37.5108C9.52909 39.8052 5 45.8647 5 53C5 62.3888 12.6112 70 22 70H98C109.046 70 118 61.0457 118 50C118 44.9209 116.106 40.2838 113 36.756C113 35.688 113.5 34.6 113.5 33.5C113.5 29.3579 110.142 26 106 26C103.487 26 101.272 27.2354 99.9142 29.1306C99.9712 28.5916 100 28.0492 100 27.5C100 17.835 92.165 10 82.5 10C76.4952 10 71.2132 13.0298 68.0832 17.6186C65.5718 15.9388 62.5518 15 59.25 15C51.518 15 45.25 21.268 45.25 29C45.25 29.7431 45.3082 30.4727 45.4202 31.1856C42.8236 30.4184 40.068 30 37.2 30C23.8348 30 13 40.8348 13 54.2C13 63.8569 18.5724 72.211 26.7118 76.1554C28.2 70.3 33.5 66 39.8 66H98.2C104.5 66 109.8 70.3 111.288 76.1554C115.5 74.1 118.5 69.8 118.5 64.8C118.5 57.7305 112.769 52 105.7 52C104.4 52 103.1 52.2 101.9 52.6C101.95 51.7 102 50.8 102 50C102 44.4772 97.5228 40 92 40C90.2872 40 88.6791 40.4296 87.2717 41.1906C85.5008 37.4988 81.7135 35 77.3 35C72.8865 35 69.0992 37.4988 67.3283 41.1906C65.9209 40.4296 64.3128 40 62.6 40C57.0772 40 52.6 44.4772 52.6 50C52.6 50.8 52.65 51.7 52.7 52.6C51.5 52.2 50.2 52 48.9 52C41.8305 52 36.1 57.7305 36.1 64.8C36.1 69.8 39.1 74.1 43.3118 76.1554C44.8 70.3 50.1 66 56.4 66H82.6C88.9 66 94.2 70.3 95.6882 76.1554C103.828 72.211 109.4 63.8569 109.4 54.2C109.4 40.8348 98.5652 30 85.2 30C82.332 30 79.5764 30.4184 76.9798 31.1856C77.0918 30.4727 77.15 29.7431 77.15 29C77.15 21.268 70.882 15 63.15 15C59.8482 15 56.8282 15.9388 54.3168 17.6186C51.1868 13.0298 45.9048 10 39.9 10Z" />
            </svg>
          </div>
          <div className="absolute top-[20%] right-[6%] animate-float-medium">
            <svg width="100" height="66" viewBox="0 0 120 80" fill="#ffffff" className="drop-shadow-sm opacity-55">
              <path d="M100 40C100 23.4315 86.5685 10 70 10C61.3541 10 53.5939 13.6492 48.1633 19.508C44.757 16.6575 40.3807 15 35.6 15C24.5543 15 15.6 23.9543 15.6 35C15.6 35.8504 15.653 36.6881 15.7554 37.5108C9.52909 39.8052 5 45.8647 5 53C5 62.3888 12.6112 70 22 70H98C109.046 70 118 61.0457 118 50C118 44.9209 116.106 40.2838 113 36.756C113 35.688 113.5 34.6 113.5 33.5C113.5 29.3579 110.142 26 106 26C103.487 26 101.272 27.2354 99.9142 29.1306C99.9712 28.5916 100 28.0492 100 27.5C100 17.835 92.165 10 82.5 10C76.4952 10 71.2132 13.0298 68.0832 17.6186C65.5718 15.9388 62.5518 15 59.25 15C51.518 15 45.25 21.268 45.25 29C45.25 29.7431 45.3082 30.4727 45.4202 31.1856C42.8236 30.4184 40.068 30 37.2 30C23.8348 30 13 40.8348 13 54.2C13 63.8569 18.5724 72.211 26.7118 76.1554C28.2 70.3 33.5 66 39.8 66H98.2C104.5 66 109.8 70.3 111.288 76.1554C115.5 74.1 118.5 69.8 118.5 64.8C118.5 57.7305 112.769 52 105.7 52C104.4 52 103.1 52.2 101.9 52.6C101.95 51.7 102 50.8 102 50C102 44.4772 97.5228 40 92 40C90.2872 40 88.6791 40.4296 87.2717 41.1906C85.5008 37.4988 81.7135 35 77.3 35C72.8865 35 69.0992 37.4988 67.3283 41.1906C65.9209 40.4296 64.3128 40 62.6 40C57.0772 40 52.6 44.4772 52.6 50C52.6 50.8 52.65 51.7 52.7 52.6C51.5 52.2 50.2 52 48.9 52C41.8305 52 36.1 57.7305 36.1 64.8C36.1 69.8 39.1 74.1 43.3118 76.1554C44.8 70.3 50.1 66 56.4 66H82.6C88.9 66 94.2 70.3 95.6882 76.1554C103.828 72.211 109.4 63.8569 109.4 54.2C109.4 40.8348 98.5652 30 85.2 30C82.332 30 79.5764 30.4184 76.9798 31.1856C77.0918 30.4727 77.15 29.7431 77.15 29C77.15 21.268 70.882 15 63.15 15C59.8482 15 56.8282 15.9388 54.3168 17.6186C51.1868 13.0298 45.9048 10 39.9 10Z" />
            </svg>
          </div>
        </div>

        {/* Outer welcome heading */}
        <h1 className="text-3xl md:text-5xl lg:text-[2.75rem] font-black text-slate-900 tracking-tight leading-tight text-center mb-8 md:mb-12 z-10 px-4 max-w-4xl">
          Welcome to a New Era of Education.
        </h1>

        {/* Main card container */}
        <div className="w-full max-w-[1300px] bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(15,23,42,0.15)] overflow-hidden flex flex-col p-5 sm:p-8 md:p-10 lg:p-12 relative border border-slate-200/50 animate-auth-fade">
          
          {/* LOGO HEADER */}
          <div className="w-full flex justify-center mb-8 md:mb-12">
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-[2.5rem] font-black tracking-tight leading-none uppercase">
                <span className="text-[#FF5A00]">edot</span>
                <span className="text-[#0084FF]">platform</span>
              </span>
            </div>
          </div>

          {/* MAIN THREE-COLUMN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
            
            {/* LEFT COLUMN: PILLARS 1 & 2 */}
            <div className="lg:col-span-3 flex flex-col gap-10 md:gap-14 text-center lg:text-left">
              
              {/* Courses Pillar */}
              <div className="flex flex-col items-center justify-center gap-3 group">
                <div className="w-32 h-32 md:w-[9.5rem] md:h-[9.5rem] overflow-hidden flex items-center justify-center shrink-0 relative group-hover:scale-105 transition-transform duration-300">
                  <img src="/images/courses_3d.png" alt="Courses" className="w-full h-full object-contain graphic-float" />
                </div>
                <div className="flex flex-col text-center">
                  <h3 className="font-extrabold text-[#0F3057] text-[16px] md:text-[20px] tracking-widest uppercase leading-none">Courses</h3>
                  <p className="text-[11px] md:text-[12.5px] font-bold text-slate-500 mt-2 leading-relaxed">Find expert-led skills training.</p>
                </div>
              </div>

              {/* Impact Pillar */}
              <div className="flex flex-col items-center justify-center gap-3 group">
                <div className="w-32 h-32 md:w-[9.5rem] md:h-[9.5rem] overflow-hidden flex items-center justify-center shrink-0 relative group-hover:scale-105 transition-transform duration-300">
                  <img src="/images/impact_3d.png" alt="Impact" className="w-full h-full object-contain graphic-float" style={{ animationDelay: '0.8s' }} />
                </div>
                <div className="flex flex-col text-center">
                  <h3 className="font-extrabold text-[#0F3057] text-[16px] md:text-[20px] tracking-widest uppercase leading-none">Impact</h3>
                  <p className="text-[11px] md:text-[12.5px] font-bold text-slate-500 mt-2 leading-relaxed">Track and expand your footprint.</p>
                </div>
              </div>

            </div>

            {/* CENTER COLUMN: GLASSMORPHIC AUTH PANEL */}
            <div className="lg:col-span-6 flex justify-center z-10 w-full max-w-[480px] mx-auto">
              
              <div className="w-full glass-auth-card rounded-[2.5rem] shadow-2xl flex flex-col relative border border-white/60 overflow-hidden">
                
                {/* Folder style Tab Selector */}
                <div className="flex w-full border-b border-slate-200/20 bg-slate-500/5">
                  <button 
                    type="button"
                    onClick={() => handleTabChange(false)}
                    className={`flex-1 py-4 text-xs md:text-[13.5px] font-black uppercase tracking-wider transition-all duration-350 cursor-pointer ${
                      !isRegister 
                        ? 'bg-white/65 text-slate-900 border-r border-slate-200/20 font-black' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/20'
                    }`}
                  >
                    Sign In
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleTabChange(true)}
                    className={`flex-1 py-4 text-xs md:text-[13.5px] font-black uppercase tracking-wider transition-all duration-350 cursor-pointer ${
                      isRegister 
                        ? 'bg-white/65 text-slate-900 border-l border-slate-200/20 font-black' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/20'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Card Content Area */}
                <div className="p-6 sm:p-8 flex flex-col">
                  
                  {/* Subtitle */}
                  <p className="text-xs md:text-sm font-semibold text-slate-600 text-center mb-6 leading-relaxed">
                    {!isRegister 
                      ? "Enter your credentials to continue your journey:" 
                      : "Create a new account to continue your journey:"
                    }
                  </p>

                  {/* Forms Box */}
                  <div className="flex-1">
                    
                    {/* Authentication Alerts */}
                    {((!isRegister && loginError) || (isRegister && regError)) && (
                      <div className="p-3 mb-5 bg-rose-50/90 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold flex items-start gap-2 shadow-sm animate-in fade-in duration-300">
                        <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="text-left">
                          <span className="block font-black text-rose-900">Authentication Error</span>
                          <span className="opacity-90 font-medium leading-relaxed">{isRegister ? regError : loginError}</span>
                        </div>
                      </div>
                    )}

                    {!isRegister ? (
                      /* LOGIN FORM */
                      <form onSubmit={handleLogin} className="space-y-4">
                        
                        {/* Email field */}
                        <div className="space-y-1.5 text-left">
                          <label className="block text-[10px] md:text-xs font-black text-[#0F3057] uppercase tracking-wide">Email Address</label>
                          <input 
                            type="email" 
                            value={loginEmail}
                            onChange={e => setLoginEmail(e.target.value)}
                            required
                            placeholder="Email Address"
                            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200/80 text-sm text-slate-900 font-semibold transition-all focus:outline-none focus:border-[#FF5A00]/50 focus:ring-4 focus:ring-[#FF5A00]/10 shadow-sm placeholder-slate-400"
                          />
                        </div>

                        {/* Password field */}
                        <div className="space-y-1.5 text-left">
                          <label className="block text-[10px] md:text-xs font-black text-[#0F3057] uppercase tracking-wide">Password</label>
                          <div className="relative">
                            <input 
                              type={showLoginPassword ? "text" : "password"}
                              value={loginPassword}
                              onChange={e => setLoginPassword(e.target.value)}
                              required
                              placeholder="Password"
                              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200/80 text-sm text-slate-900 font-semibold transition-all focus:outline-none focus:border-[#FF5A00]/50 focus:ring-4 focus:ring-[#FF5A00]/10 shadow-sm placeholder-slate-400"
                            />
                            <button 
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
                            >
                              {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button 
                          type="submit" 
                          disabled={loadingLogin} 
                          className="w-full flex items-center justify-center gap-2 bg-[#d97706]/75 hover:bg-[#d97706]/90 text-white py-3.5 px-6 rounded-2xl font-black text-xs md:text-sm tracking-wide shadow-lg shadow-amber-800/15 transform active:scale-[0.99] transition-all duration-200 uppercase cursor-pointer auth-glass-btn"
                        >
                          {loadingLogin ? 'Logging in...' : 'Log In with Password'}
                          <ArrowRight className="w-4.5 h-4.5" />
                        </button>

                      </form>
                    ) : (
                      /* REGISTRATION FORM */
                      <form onSubmit={handleRegister} className="space-y-4">
                        
                        {/* Name field */}
                        <div className="space-y-1.5 text-left">
                          <label className="block text-[10px] md:text-xs font-black text-[#0F3057] uppercase tracking-wide">Full Name</label>
                          <input 
                            type="text" 
                            value={regName}
                            onChange={e => setRegName(e.target.value)}
                            required
                            placeholder="Full Name"
                            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200/80 text-sm text-slate-900 font-semibold transition-all focus:outline-none focus:border-[#FF5A00]/50 focus:ring-4 focus:ring-[#FF5A00]/10 shadow-sm placeholder-slate-400"
                          />
                        </div>

                        {/* Email field */}
                        <div className="space-y-1.5 text-left">
                          <label className="block text-[10px] md:text-xs font-black text-[#0F3057] uppercase tracking-wide">Email Address</label>
                          <input 
                            type="email" 
                            value={regEmail}
                            onChange={e => setRegEmail(e.target.value)}
                            required
                            placeholder="Email Address"
                            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200/80 text-sm text-slate-900 font-semibold transition-all focus:outline-none focus:border-[#FF5A00]/50 focus:ring-4 focus:ring-[#FF5A00]/10 shadow-sm placeholder-slate-400"
                          />
                        </div>

                        {/* Password field */}
                        <div className="space-y-1.5 text-left">
                          <label className="block text-[10px] md:text-xs font-black text-[#0F3057] uppercase tracking-wide">Password</label>
                          <div className="relative">
                            <input 
                              type={showRegPassword ? "text" : "password"}
                              value={regPassword}
                              onChange={e => setRegPassword(e.target.value)}
                              required
                              placeholder="Password"
                              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200/80 text-sm text-slate-900 font-semibold transition-all focus:outline-none focus:border-[#FF5A00]/50 focus:ring-4 focus:ring-[#FF5A00]/10 shadow-sm placeholder-slate-400"
                            />
                            <button 
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
                            >
                              {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Role field dropdown */}
                        <div className="space-y-1.5 text-left">
                          <label className="block text-[10px] md:text-xs font-black text-[#0F3057] uppercase tracking-wide">Account Type (Role)</label>
                          <div className="relative">
                            <select 
                              value={regRole} 
                              onChange={e => setRegRole(e.target.value)}
                              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200/80 text-sm text-slate-800 font-semibold transition-all focus:outline-none focus:border-[#FF5A00]/50 focus:ring-4 focus:ring-[#FF5A00]/10 shadow-sm cursor-pointer appearance-none"
                            >
                              <option value="student">Student</option>
                              <option value="parent">Parent</option>
                              <option value="instructor">Instructor</option>
                              <option value="sponsor">Sponsor</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button 
                          type="submit" 
                          disabled={loadingReg} 
                          className="w-full flex items-center justify-center gap-2 bg-[#FF5A00]/75 hover:bg-[#FF5A00]/90 text-white py-3.5 px-6 rounded-2xl font-black text-xs md:text-sm tracking-wide shadow-lg shadow-orange-500/15 transform active:scale-[0.99] transition-all duration-200 uppercase group cursor-pointer auth-glass-btn"
                        >
                          {loadingReg ? 'Signing up...' : 'Sign Up with Email'}
                          <ArrowRight className="w-4.5 h-4.5" />
                        </button>

                      </form>
                    )}

                    {/* Separator OR */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-350/30"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase font-extrabold text-slate-500">
                        <span className="bg-transparent px-3">- OR -</span>
                      </div>
                    </div>

                    {/* Social Logins */}
                    <div className="flex flex-col gap-3">
                      <button 
                        type="button" 
                        onClick={() => handleSocialLogin('Google')} 
                        className="h-12 flex items-center justify-center gap-3 border border-slate-200/80 rounded-2xl hover:bg-slate-50 transition-all shadow-sm bg-white cursor-pointer active:scale-[0.98] w-full"
                      >
                        <GoogleIcon className="w-5 h-5 shrink-0" />
                        <span className="font-extrabold text-slate-700 text-xs md:text-[13px]">Continue with Google</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleSocialLogin('GitHub')} 
                        className="h-12 flex items-center justify-center gap-3 border border-slate-200/80 rounded-2xl hover:bg-slate-50 transition-all shadow-sm bg-white cursor-pointer active:scale-[0.98] w-full"
                      >
                        {/* GitHub Icon */}
                        <svg className="w-5 h-5 shrink-0 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                        </svg>
                        <span className="font-extrabold text-slate-700 text-xs md:text-[13px]">Continue with GitHub</span>
                      </button>
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* RIGHT COLUMN: PILLARS 3 & 4 */}
            <div className="lg:col-span-3 flex flex-col gap-10 md:gap-14 text-center lg:text-left">
              
              {/* Community Pillar */}
              <div className="flex flex-col items-center justify-center gap-3 group">
                <div className="w-32 h-32 md:w-[9.5rem] md:h-[9.5rem] overflow-hidden flex items-center justify-center shrink-0 relative group-hover:scale-105 transition-transform duration-300">
                  <img src="/images/community_3d.png" alt="Community" className="w-full h-full object-contain graphic-float" style={{ animationDelay: '0.4s' }} />
                </div>
                <div className="flex flex-col text-center">
                  <h3 className="font-extrabold text-[#0F3057] text-[16px] md:text-[20px] tracking-widest uppercase leading-none">Community</h3>
                  <p className="text-[11px] md:text-[12.5px] font-bold text-slate-500 mt-2 leading-relaxed">Collaborate with a global network.</p>
                </div>
              </div>

              {/* Access Anywhere Pillar */}
              <div className="flex flex-col items-center justify-center gap-3 group">
                <div className="w-32 h-32 md:w-[9.5rem] md:h-[9.5rem] overflow-hidden flex items-center justify-center shrink-0 relative group-hover:scale-105 transition-transform duration-300">
                  <img src="/images/access_3d.png" alt="Access Anywhere" className="w-full h-full object-contain graphic-float" style={{ animationDelay: '1.2s' }} />
                </div>
                <div className="flex flex-col text-center">
                  <h3 className="font-extrabold text-[#0F3057] text-[16px] md:text-[20px] tracking-widest uppercase leading-none">Access Anywhere</h3>
                  <p className="text-[11px] md:text-[12.5px] font-bold text-slate-500 mt-2 leading-relaxed">Learn on the go.</p>
                </div>
              </div>

            </div>

          </div>

          {/* SECURE BADGES CAPSULE BAR FOOTER */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pt-8 border-t border-slate-200 mt-12 w-full max-w-[950px] mx-auto bg-slate-100/40 rounded-full px-6 py-4 border border-slate-200/55 shadow-sm">
            
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-650 shrink-0 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left leading-none">
                <h4 className="font-extrabold text-[11px] text-slate-800 tracking-tight">Secure & Safe</h4>
                <p className="text-[9.5px] text-slate-450 mt-1 font-medium">Your data is protected</p>
              </div>
            </div>

            <div className="hidden md:block h-6 w-[1.5px] bg-slate-300/60"></div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-650 shrink-0 shadow-sm">
                <Zap className="w-5 h-5" />
              </div>
              <div className="text-left leading-none">
                <h4 className="font-extrabold text-[11px] text-slate-800 tracking-tight">Fast & Easy</h4>
                <p className="text-[9.5px] text-slate-450 mt-1 font-medium">Quick access anytime</p>
              </div>
            </div>

            <div className="hidden md:block h-6 w-[1.5px] bg-slate-300/60"></div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-650 shrink-0 shadow-sm">
                <Globe className="w-5 h-5" />
              </div>
              <div className="text-left leading-none">
                <h4 className="font-extrabold text-[11px] text-slate-800 tracking-tight">Access Anywhere</h4>
                <p className="text-[9.5px] text-slate-450 mt-1 font-medium font-medium font-medium">Learn here anywhere</p>
              </div>
            </div>

            <div className="hidden md:block h-6 w-[1.5px] bg-slate-300/60"></div>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-550 shrink-0 shadow-sm">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="text-left leading-none">
                <h4 className="font-extrabold text-[11px] text-slate-800 tracking-tight">24/7 Support</h4>
                <p className="text-[9.5px] text-slate-450 mt-1 font-medium">We're here to help</p>
              </div>
            </div>

          </div>

        </div>

      </div>

      <Footer />
    </>
  );
}
