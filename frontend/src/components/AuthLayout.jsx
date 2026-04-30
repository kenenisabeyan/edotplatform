import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const edotLogo = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/e69zbyhv3obsuf4uknyy';
import './AuthLayout.css';
import { Github, Facebook, Linkedin } from 'lucide-react';

export default function AuthLayout({ defaultIsRegister = false }) {
  const [isRightPanelActive, setIsRightPanelActive] = useState(defaultIsRegister);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('student');
  const [regError, setRegError] = useState('');
  const [loadingReg, setLoadingReg] = useState(false);

  useEffect(() => {
    setIsRightPanelActive(defaultIsRegister);
  }, [defaultIsRegister]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoadingLogin(true);
    try {
      await login({ email: loginEmail, password: loginPassword });
      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirect') || '/dashboard';
      navigate(redirect);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || err.message || 'Login failed';
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
      await register({
        name: regName, email: regEmail, password: regPassword, role: regRole
      });
      setIsRightPanelActive(false);
      setRegName(''); setRegEmail(''); setRegPassword('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || err.message || 'Registration failed';
      setRegError(errorMsg);
    } finally {
      setLoadingReg(false);
    }
  };

  const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
  );

  return (
    <div className="auth-page-wrapper">
      <div className={`auth-container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
        
        {/* Sign Up Container */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleRegister}>
            <h1 className="auth-title">Create Account</h1>
            <div className="social-container">
              <button type="button" className="social"><GoogleIcon /></button>
              <button type="button" className="social"><Facebook size={18} /></button>
              <button type="button" className="social"><Github size={18} /></button>
              <button type="button" className="social"><Linkedin size={18} /></button>
            </div>
            <span className="auth-subtitle">or use your email for registration</span>
            {regError && <span className="auth-error">{regError}</span>}
            <input type="text" placeholder="Name" value={regName} onChange={e=>setRegName(e.target.value)} required />
            <input type="email" placeholder="Email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={regPassword} onChange={e=>setRegPassword(e.target.value)} required />
            <select value={regRole} onChange={e=>setRegRole(e.target.value)} className="role-select">
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="instructor">Instructor</option>
              <option value="sponsor">Sponsor</option>
            </select>
            <button type="submit" className="auth-submit-btn" disabled={loadingReg}>{loadingReg ? '...' : 'SIGN UP'}</button>
          </form>
        </div>

        {/* Sign In Container */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLogin}>
            <h1 className="auth-title">Sign In</h1>
            <div className="social-container">
              <button type="button" className="social"><GoogleIcon /></button>
              <button type="button" className="social"><Facebook size={18} /></button>
              <button type="button" className="social"><Github size={18} /></button>
              <button type="button" className="social"><Linkedin size={18} /></button>
            </div>
            <span className="auth-subtitle">or use your email password</span>
            {loginError && <span className="auth-error">{loginError}</span>}
            <input type="email" placeholder="Email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} required />
            <a href="#" className="forgot-pass">Forget Your Password?</a>
            <button type="submit" className="auth-submit-btn" disabled={loadingLogin}>{loadingLogin ? '...' : 'SIGN IN'}</button>
          </form>
        </div>

        {/* Overlay Container */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <div style={{ marginBottom: '20px', background: 'white', padding: '10px', borderRadius: '50%', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                <img src={edotLogo} alt="EDOT" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
              </div>
              <h1 className="auth-title-white">Welcome Back!</h1>
              <p className="auth-desc">Enter your personal details to use all of site features</p>
              <button className="ghost" onClick={() => setIsRightPanelActive(false)}>SIGN IN</button>
            </div>
            <div className="overlay-panel overlay-right">
              <div style={{ marginBottom: '20px', background: 'white', padding: '10px', borderRadius: '50%', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                <img src={edotLogo} alt="EDOT" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
              </div>
              <h1 className="auth-title-white">Hello, Friend!</h1>
              <p className="auth-desc">Register with your personal details to use all of site features</p>
              <button className="ghost" onClick={() => setIsRightPanelActive(true)}>SIGN UP</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
