import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Github, Eye, EyeOff } from 'lucide-react';

const edotLogo = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/e69zbyhv3obsuf4uknyy';

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoadingLogin(true);
    try {
      await login({ email: loginEmail, password: loginPassword });
      // Redirect handled by useEffect above upon successful login
    } catch (err) {
      setLoginError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setLoadingLogin(true);
      const mockEmail = provider.toLowerCase() + '@example.com';
      await socialLogin({ provider, email: mockEmail });
      // Redirect handled by useEffect above upon successful login
    } catch (err) {
      setLoginError(err.response?.data?.message || err.message || `${provider} login failed`);
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
      setRegName(''); setRegEmail(''); setRegPassword('');
    } catch (err) {
      setRegError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoadingReg(false);
    }
  };

  if (authLoading) return null; // Avoid flashing the login page while checking session

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className={`w-full max-w-[850px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col ${isRegister ? 'md:flex-row' : 'md:flex-row-reverse'} relative min-h-[550px] overflow-hidden transition-all duration-500`}>
        
        {/* COLORED PANEL (Mustard) */}
        <div className={`w-full md:w-[45%] flex flex-col items-center justify-center p-10 bg-[#E1C388] z-10 relative transition-all duration-500 ${isRegister ? 'md:rounded-r-[120px]' : 'md:rounded-l-[120px]'}`}>
           
           {/* Logo */}
           <div className="mb-6 p-1.5 bg-white rounded-full shadow-sm relative">
             <img src={edotLogo} alt="EDOT Logo" className="w-[72px] h-[72px] rounded-full object-cover relative z-10" />
           </div>

           <h2 className="text-3xl font-black text-[#3D2B1F] mb-3 text-center tracking-tight">
             {isRegister ? "Welcome Back!" : "Hello, Friend!"}
           </h2>
           <p className="text-[#3D2B1F] text-center mb-10 max-w-[240px] text-[13px] font-medium leading-relaxed">
             {isRegister 
               ? "Enter your personal details to use all of site features" 
               : "Enter your personal details and start journey with us"}
           </p>

           <button 
             onClick={() => setIsRegister(!isRegister)}
             className="px-10 py-2 rounded-lg border-[1.5px] border-[#3D2B1F] text-[#3D2B1F] font-bold text-[13px] hover:bg-[#3D2B1F] hover:text-[#E1C388] transition-colors duration-300 tracking-wide uppercase"
           >
             {isRegister ? "SIGN IN" : "SIGN UP"}
           </button>
        </div>

        {/* WHITE FORM PANEL */}
        <div className="w-full md:w-[55%] p-10 lg:p-12 flex flex-col justify-center bg-white z-0 relative">
           
           <div className="max-w-[340px] mx-auto w-full">
             <div className="text-center mb-6">
               <h1 className="text-3xl font-black text-[#3D2B1F] tracking-tight">
                 {isRegister ? "Create Account" : "Sign In"}
               </h1>
             </div>

             {/* Social Logins */}
             <div className="flex justify-center gap-6 mb-7 mt-2">
               <button type="button" onClick={() => handleSocialLogin('Google')} className="w-[140px] h-14 flex items-center justify-center gap-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm bg-white">
                  <GoogleIcon className="w-6 h-6" />
                  <span className="font-bold text-slate-700 text-[14px]">Google</span>
               </button>
               <button type="button" onClick={() => handleSocialLogin('GitHub')} className="w-[140px] h-14 flex items-center justify-center gap-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm bg-white">
                  <Github className="w-6 h-6 text-slate-700" />
                  <span className="font-bold text-slate-700 text-[14px]">GitHub</span>
               </button>
             </div>

             <div className="text-center mb-6">
               <span className="text-[12px] font-medium text-slate-400">
                 {isRegister ? "or use your email for registration" : "or use your email password"}
               </span>
             </div>

             {/* FORMS */}
             {isRegister ? (
               <form onSubmit={handleRegister} className="space-y-3.5">
                 {regError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium border border-red-100">{regError}</div>}
                 
                 <input type="text" placeholder="Name" value={regName} onChange={e=>setRegName(e.target.value)} required 
                   className="w-full px-4 py-3 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DFB773] transition-all text-slate-900 font-medium bg-[#F3F4F6] text-[13px] placeholder:text-slate-500" />

                 <input type="email" placeholder="student@test.com" value={regEmail} onChange={e=>setRegEmail(e.target.value)} required 
                   className="w-full px-4 py-3 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DFB773] transition-all text-[#111827] font-medium bg-[#EBF2FF] text-[13px] placeholder:text-slate-500" />

                 <div className="relative">
                   <input type={showRegPassword ? "text" : "password"} placeholder="........" value={regPassword} onChange={e=>setRegPassword(e.target.value)} required 
                     className="w-full px-4 py-3 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DFB773] transition-all text-[#111827] font-medium bg-[#EBF2FF] text-[13px] placeholder:text-slate-500" />
                   <button 
                     type="button" 
                     onClick={() => setShowRegPassword(!showRegPassword)} 
                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-[#5C3E08] transition-colors"
                   >
                     {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                   </button>
                 </div>

                 <select value={regRole} onChange={e=>setRegRole(e.target.value)} 
                   className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DFB773] transition-all text-slate-900 font-medium bg-white text-[13px] appearance-none">
                   <option value="student">Student</option>
                   <option value="parent">Parent</option>
                   <option value="instructor">Instructor</option>
                   <option value="sponsor">Sponsor</option>
                 </select>

                 <button type="submit" disabled={loadingReg} className="w-[140px] mx-auto block bg-[#5C3E08] text-white py-3 rounded-lg font-bold tracking-wide hover:bg-[#4A3206] transition-colors mt-6 text-[13px] uppercase">
                   {loadingReg ? '...' : 'SIGN UP'}
                 </button>
               </form>
             ) : (
               <form onSubmit={handleLogin} className="space-y-3.5">
                 {loginError && (
                   <div className="p-4 bg-red-50/80 backdrop-blur-sm text-red-700 text-sm rounded-xl font-medium border border-red-200/60 shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                     <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                     </svg>
                     <div className="flex flex-col gap-1">
                       <span className="font-bold text-red-800">Authentication Failed</span>
                       <span className="text-[13px] opacity-90">{loginError}</span>
                     </div>
                   </div>
                 )}
                 
                 <input type="email" placeholder="student@test.com" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} required 
                   className="w-full px-4 py-3 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DFB773] transition-all text-[#111827] font-medium bg-[#EBF2FF] text-[13px] placeholder:text-slate-500" />

                 <div className="relative">
                   <input type={showLoginPassword ? "text" : "password"} placeholder="........" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} required 
                     className="w-full px-4 py-3 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DFB773] transition-all text-[#111827] font-medium bg-[#EBF2FF] text-[13px] placeholder:text-slate-500" />
                   <button 
                     type="button" 
                     onClick={() => setShowLoginPassword(!showLoginPassword)} 
                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-[#5C3E08] transition-colors"
                   >
                     {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                   </button>
                 </div>

                 <div className="flex justify-center pt-2 pb-2">
                   <a href="#" className="text-[12px] font-medium text-slate-500 hover:text-[#5C3E08] transition-colors">Forgot your password?</a>
                 </div>

                 <button type="submit" disabled={loadingLogin} className="w-[140px] mx-auto block bg-[#5C3E08] text-white py-3 rounded-lg font-bold tracking-wide hover:bg-[#4A3206] transition-colors text-[13px] uppercase">
                   {loadingLogin ? '...' : 'SIGN IN'}
                 </button>
               </form>
             )}

           </div>
        </div>
        
      </div>
    </div>
  );
}
