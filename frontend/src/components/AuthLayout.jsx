import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  UserPlus, 
  UserCheck,
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Headphones, 
  GraduationCap, 
  Users, 
  TrendingUp, 
  Rocket,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  ChevronRight
} from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, microsoftProvider } from '../utils/firebase';
import Navbar from './Navbar';
import Footer from './Footer';
import './AuthLayout.css';
const signinImg = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/fx8hbyw7sdx7r6ag2i97';

// Custom Google Icon
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
      
      const provider = providerName === 'Google' ? googleProvider : microsoftProvider;
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      await socialLogin({ 
        provider: providerName, 
        email: user.email,
        name: user.displayName || user.email.split('@')[0]
      });
    } catch (err) {
      console.error(`${providerName} login error:`, err);
      let errorMsg = err.response?.data?.message || err.message || `${providerName} login failed`;
      if (providerName === 'Microsoft' && (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed'))) {
        errorMsg = 'Microsoft Sign-In is not configured in the Firebase Console yet. Please use Google or Email to authenticate.';
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
      <div className="min-h-screen w-full flex items-center justify-center px-3 py-6 md:p-6 lg:p-8 auth-page-bg font-sans relative overflow-hidden transition-colors duration-300 pt-20 lg:pt-24">
        
        {/* Background ambient lighting */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#FF5A00]/5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#00D4FF]/5 blur-3xl pointer-events-none"></div>

        {/* Main card container */}
        <div className="w-full max-w-[1400px] min-h-auto md:min-h-[88vh] lg:min-h-[96vh] bg-white rounded-2xl md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row relative z-10 border border-slate-200/50">
          
          {/* LEFT COLUMN: IMMERSIVE BRANDING SHOWCASE */}
          <div className="hidden lg:flex lg:w-1/2 xl:w-1/2 relative flex-col justify-between py-10 px-10 bg-[#FF5A00] select-none overflow-hidden auth-left-panel">
            {/* Left image panel removed as requested */}
          </div>

          {/* RIGHT COLUMN: HIGH-CONTRAST FORM WRAPPER (Solid Pristine White) */}
          <div className="w-full lg:w-1/2 flex flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 bg-white text-slate-800 min-h-auto md:min-h-[78vh] lg:min-h-[86vh]">
            
            {/* Top spacer or brand title for mobile */}
            <div className="w-full text-center mt-1 mb-4 sm:mt-2 sm:mb-6">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Welcome to <span className="text-[#FF5A00]">edot</span><span className="text-[#0084FF]">platform</span>
              </h2>
              <p className="text-sm sm:text-base font-medium text-slate-500 mt-2 max-w-[34rem] mx-auto sm:mx-0">
                Login to your account or create a new one to get started.
              </p>
            </div>

          {/* Form Tabs */}
          <div className="flex justify-center border-b border-slate-200 mb-4 sm:mb-6 max-w-xs mx-auto w-full">
            <button 
              type="button"
              onClick={() => handleTabChange(false)}
              className={`flex-1 flex items-center justify-center gap-2 pb-2.5 sm:pb-3.5 text-[12px] sm:text-[14.5px] font-extrabold border-b-2 transition-all cursor-pointer ${
                !isRegister 
                  ? 'border-[#FF5A00] text-[#FF5A00]' 
                  : 'border-transparent text-slate-400 hover:text-slate-650'
              }`}
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Login
            </button>
            <button 
              type="button"
              onClick={() => handleTabChange(true)}
              className={`flex-1 flex items-center justify-center gap-2 pb-2.5 sm:pb-3.5 text-[12px] sm:text-[14.5px] font-extrabold border-b-2 transition-all cursor-pointer ${
                isRegister 
                  ? 'border-[#FF5A00] text-[#FF5A00]' 
                  : 'border-transparent text-slate-400 hover:text-slate-655'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
              Sign Up
            </button>
          </div>

          {/* Forms Box */}
          <div className="max-w-[540px] w-full mx-auto flex-1 flex flex-col justify-center gap-3 sm:gap-6">
            
            {/* Error alerts container */}
            {((!isRegister && loginError) || (isRegister && regError)) && (
              <div className="p-2.5 sm:p-3.5 mb-3 sm:mb-4 bg-rose-50 border border-rose-200/60 text-rose-700 text-[11px] sm:text-xs rounded-lg sm:rounded-xl font-semibold shadow-sm flex items-start gap-2 sm:gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <span className="font-extrabold text-rose-850 block mb-0.5">Authentication Error</span>
                  <span className="leading-relaxed opacity-90">{isRegister ? regError : loginError}</span>
                </div>
              </div>
            )}

            {!isRegister ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-4">
                
                {/* Email field */}
                <div className="space-y-1 sm:space-y-1.5 text-left">
                  <label className="block text-[11px] sm:text-xs font-extrabold text-slate-750 uppercase tracking-wide">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>
                    <input 
                      type="email" 
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      required
                      placeholder="yourname@texts.com"
                      className="w-full pl-12 pr-4 py-2.5 sm:py-3 auth-field-input text-sm text-slate-900 font-semibold transition-all"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-1 sm:space-y-1.5 text-left">
                  <label className="block text-[11px] sm:text-xs font-extrabold text-slate-755 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>
                    <input 
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                      placeholder="Create a strong password"
                      className="w-full pl-12 pr-10 py-2.5 sm:py-3 auth-field-input text-sm text-slate-900 font-semibold transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3 sm:pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Eye className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Checkbox and Forgot Password */}
                <div className="flex items-center justify-between text-[11px] sm:text-xs pt-0.5 sm:pt-1">
                  <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer font-bold text-slate-650 hover:text-slate-800 select-none">
                    <input 
                      type="checkbox" 
                      className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded border-slate-300 text-[#FF5A00] focus:ring-[#FF5A00] cursor-pointer"
                    />
                    <span className="hidden sm:inline">Remember me</span>
                    <span className="sm:hidden">Remember</span>
                  </label>
                  <a href="#" className="font-bold text-[#0084FF] hover:text-[#0066FF] transition-colors hover:underline">Forgot Password?</a>
                </div>

                {/* Submit button */}
                <button 
                  type="submit" 
                  disabled={loadingLogin} 
                  className="w-full flex items-center justify-center gap-2 sm:gap-2.5 bg-[#19C2E8] hover:bg-[#00c5eb] text-white py-2.5 sm:py-3.5 px-4 sm:px-6 rounded-full font-bold text-[12px] sm:text-sm tracking-wide shadow-lg shadow-cyan-500/20 transform active:scale-[0.99] transition-all duration-200 uppercase group cursor-pointer auth-action-btn"
                >
                  {loadingLogin ? 'Logging in...' : 'Login to Your Account'}
                  <span className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-white ml-0.5 sm:ml-1 transition-colors">
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 transform group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </button>

              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegister} className="space-y-4">
                
                {/* Full name field */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-extrabold text-slate-750 uppercase tracking-wide">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <input 
                      type="text" 
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      required
                      placeholder="yourname"
                      className="w-full pl-12 pr-4 py-3 auth-field-input text-sm text-slate-900 font-semibold transition-all"
                    />
                  </div>
                </div>

                {/* Email field */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-extrabold text-slate-750 uppercase tracking-wide">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4.5 h-4.5" />
                    </div>
                    <input 
                      type="email" 
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      required
                      placeholder="yourname@texts.com"
                      className="w-full pl-12 pr-4 py-3 auth-field-input text-sm text-slate-900 font-semibold transition-all"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-extrabold text-slate-755 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4.5 h-4.5" />
                    </div>
                    <input 
                      type={showRegPassword ? "text" : "password"}
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      required
                      placeholder="Create a strong password"
                      className="w-full pl-12 pr-10 py-3 auth-field-input text-sm text-slate-900 font-semibold transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Role field dropdown */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-extrabold text-slate-750 uppercase tracking-wide">Account Type (Role)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserCheck className="w-4.5 h-4.5" />
                    </div>
                    <select 
                      value={regRole} 
                      onChange={e => setRegRole(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 auth-field-input text-sm text-slate-800 font-semibold transition-all shadow-sm cursor-pointer appearance-none"
                    >
                      <option value="student">Student</option>
                      <option value="parent">Parent</option>
                      <option value="instructor">Instructor</option>
                      <option value="sponsor">Sponsor</option>
                    </select>
                    {/* Select arrow */}
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button 
                  type="submit" 
                  disabled={loadingReg} 
                  className="w-full flex items-center justify-center gap-2.5 bg-[#FF5A00] hover:bg-[#E54B00] text-white py-3.5 px-6 rounded-full font-bold text-sm tracking-wide shadow-lg shadow-orange-500/20 transform active:scale-[0.99] transition-all duration-200 uppercase group cursor-pointer auth-action-btn"
                >
                  {loadingReg ? 'Signing up...' : 'Sign Up to edotplatform'}
                  <span className="flex items-center justify-center w-5 h-5 rounded-full border border-white ml-1 transition-colors">
                    <ArrowRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </button>

              </form>
            )}

            {/* Separator OR */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-extrabold text-slate-400">
                <span className="bg-white px-3.5">OR</span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => handleSocialLogin('Google')} 
                className="h-12 flex items-center justify-center gap-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm bg-white cursor-pointer active:scale-[0.98]"
              >
                <GoogleIcon className="w-5 h-5 shrink-0" />
                <span className="font-extrabold text-slate-700 text-[13px]">Continue with Google</span>
              </button>
              <button 
                type="button" 
                onClick={() => handleSocialLogin('Microsoft')} 
                className="h-12 flex items-center justify-center gap-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm bg-white cursor-pointer active:scale-[0.98]"
              >
                <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0H11V11H0V0Z" fill="#F25022"/>
                  <path d="M12 0H23V11H12V0Z" fill="#7FBA00"/>
                  <path d="M0 12H11V23H0V12Z" fill="#00A4EF"/>
                  <path d="M12 12H23V23H12V12Z" fill="#FFB900"/>
                </svg>
                <span className="font-extrabold text-slate-700 text-[13px]">Continue with Microsoft</span>
              </button>
            </div>

            {/* Toggle Footer text */}
            <div className="text-center mt-6 text-sm font-bold text-slate-500">
              {!isRegister ? (
                <span>
                  Don't have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => handleTabChange(true)} 
                    className="text-[#FF5A00] hover:text-[#E54B00] inline-flex items-center gap-0.5 hover:underline font-extrabold cursor-pointer"
                  >
                    Sign up now <ChevronRight className="w-4 h-4 mt-0.5" />
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => handleTabChange(false)} 
                    className="text-[#FF5A00] hover:text-[#E54B00] inline-flex items-center gap-0.5 hover:underline font-extrabold cursor-pointer"
                  >
                    Sign in here <ChevronRight className="w-4 h-4 mt-0.5" />
                  </button>
                </span>
              )}
            </div>

          </div>

          {/* Secure Badges Footer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100 mt-6 text-left">
            <div className="flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500 shrink-0 transform group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-[11px] text-slate-800 leading-tight truncate">Secure & Safe</h4>
                <p className="text-[9.5px] text-slate-450 mt-0.5 leading-none truncate">Your data is protected</p>
              </div>
            </div>

            <div className="flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-500 shrink-0 transform group-hover:scale-105 transition-transform">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-[11px] text-slate-800 leading-tight truncate">Fast & Easy</h4>
                <p className="text-[9.5px] text-slate-450 mt-0.5 leading-none truncate">Quick access anytime</p>
              </div>
            </div>

            <div className="flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-sky-50 text-sky-500 shrink-0 transform group-hover:scale-105 transition-transform">
                <Globe className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-[11px] text-slate-800 leading-tight truncate">Access Anywhere</h4>
                <p className="text-[9.5px] text-slate-450 mt-0.5 leading-none truncate">Learn from anywhere</p>
              </div>
            </div>

            <div className="flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500 shrink-0 transform group-hover:scale-105 transition-transform">
                <Headphones className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-[11px] text-slate-800 leading-tight truncate">24/7 Support</h4>
                <p className="text-[9.5px] text-slate-450 mt-0.5 leading-none truncate">We're here to help</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>

    <Footer />
    </>
  );
}
