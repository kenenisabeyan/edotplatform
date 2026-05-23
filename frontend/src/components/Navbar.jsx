import React, { useState, useEffect, useRef } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronDown, LogOut, Settings, Bell, BookOpen, Shield } from 'lucide-react';
const edotLogo = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/e69zbyhv3obsuf4uknyy';
import ThemeDropdown from './ThemeDropdown';

export default function Navbar() {
  const isDarkMode = useThemeMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isTransparentDarkBg = isHome && !isScrolled && !isDarkMode;

  const userDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) => 
    `relative text-[15px] font-medium transition-all px-2 py-1.5 ${
      isActive 
        ? 'text-[#00D4FF]'
        : isDarkMode || isTransparentDarkBg ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-[#00D4FF]'
    } ${isActive ? 'after:content-[\'\'] after:absolute after:left-2 after:-bottom-1.5 after:w-[calc(100%-16px)] after:h-[3px] after:bg-[#00D4FF] after:rounded-full' : ''}`;

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header 
      className={`${isAuthPage ? 'relative' : 'fixed top-0 left-0'} w-full z-50 transition-all duration-300 ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white'} py-6`}
      style={{ borderBottom: '2px solid #475569', boxShadow: '0px 12px 30px rgba(71, 85, 105, 0.4)' }}
    >
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        
        {/* LEFT: Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105 group">
            <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shadow-sm ${isDarkMode ? 'bg-[#0B1120] border border-white/10' : 'bg-white border border-slate-200'}`}>
               <img src={edotLogo} alt="EDOT" className="w-8 h-8 object-contain" />
            </div>
            <div className="flex flex-col justify-center">
              <span className={`text-[20px] font-black leading-none tracking-tight transition-colors ${isDarkMode || isTransparentDarkBg ? 'text-white' : 'text-slate-900'}`}>EDOT</span>
              <span className={`text-[9px] font-bold tracking-widest mt-[2px] uppercase ${isDarkMode || isTransparentDarkBg ? 'text-slate-300' : 'text-slate-500'}`}>Education for All</span>
            </div>
          </Link>
        </div>

        {/* CENTER: Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <NavLink to="/" className={navLinkClass} end>Home</NavLink>
          <NavLink to="/courses" className={navLinkClass}>Courses</NavLink>
          <NavLink to="/about" className={navLinkClass}>About</NavLink>
          <NavLink to="/impact" className={navLinkClass}>Impact</NavLink>
          <NavLink to="/sponsorship" className={navLinkClass}>Sponsorship</NavLink>
          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
        </nav>
        
        {/* RIGHT: Actions */}
        <div className="hidden lg:flex items-center justify-end gap-5">
          <ThemeDropdown />
          {isAuthenticated ? (
            <div className="flex items-center gap-5">
              <Link to="/dashboard/messages" className={`relative transition-colors hover:text-[#00D4FF] ${isDarkMode || isTransparentDarkBg ? 'text-slate-300' : 'text-slate-600'}`}>
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#00D4FF] text-[8px] font-bold text-white flex items-center justify-center rounded-full border border-transparent">1</span>
              </Link>
              
              <div className="relative" ref={userDropdownRef}>
                <button 
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 transition-transform hover:scale-105 focus:outline-none`}
                >
                  <div className="w-9 h-9 rounded-full bg-[#00D4FF] flex items-center justify-center text-white shadow-md">
                    <span className="font-bold text-sm">{user?.name?.charAt(0) || 'U'}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${userDropdownOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-white' : 'text-slate-700'}`} />
                </button>

                <div className={`absolute top-[calc(100%+1rem)] right-0 w-64 bg-white dark:bg-[#0B1120] border rounded-xl shadow-lg transition-all duration-200 origin-top-right overflow-hidden ${userDropdownOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'} ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  <div className={`p-4 border-b ${isDarkMode ? 'border-white/5 bg-[#0B1120]/40' : 'border-slate-100 bg-slate-50'}`}>
                    <p className={`text-[14px] font-semibold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'User'}</p>
                    <p className="text-[12px] text-slate-500 truncate mt-0.5">{user?.email || 'user@example.com'}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <Link to="/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-full text-[13px] font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                      <Shield className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link to="/dashboard/courses" className={`flex items-center gap-3 px-3 py-2 rounded-full text-[13px] font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                      <BookOpen className="w-4 h-4" /> My Learning
                    </Link>
                    <Link to="/dashboard/settings" className={`flex items-center gap-3 px-3 py-2 rounded-full text-[13px] font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                  </div>
                    <div className={`p-2 ${isDarkMode ? '' : ''}`}>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-full text-[13px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className={`font-medium text-[15px] transition-colors ${isDarkMode || isTransparentDarkBg ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Log In</Link>
              <Link to="/register" className="btn btn-primary ml-2">Sign Up</Link>
            </div>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-4">
          <ThemeDropdown />
          <button onClick={toggleMenu} className={`p-2 transition-colors ${isDarkMode || isTransparentDarkBg ? 'text-white' : 'text-slate-900'}`}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {mobileMenuOpen && (
        <div className={`lg:hidden absolute top-full left-0 w-full bg-white dark:bg-[#0B1120] max-h-[calc(100vh-70px)] overflow-y-auto ${isDarkMode ? '' : ''}`}>
          <div className="p-4 flex flex-col space-y-1">
            <NavLink to="/" className={({isActive}) => `px-4 py-3 rounded-lg text-[15px] font-medium ${isActive ? 'bg-[#00D4FF]/10 text-[#00D4FF]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}>Home</NavLink>
            <NavLink to="/courses" className={({isActive}) => `px-4 py-3 rounded-lg text-[15px] font-medium ${isActive ? 'bg-[#00D4FF]/10 text-[#00D4FF]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}>Courses</NavLink>
            <NavLink to="/about" className={({isActive}) => `px-4 py-3 rounded-lg text-[15px] font-medium ${isActive ? 'bg-[#00D4FF]/10 text-[#00D4FF]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}>About</NavLink>
            <NavLink to="/impact" className={({isActive}) => `px-4 py-3 rounded-lg text-[15px] font-medium ${isActive ? 'bg-[#00D4FF]/10 text-[#00D4FF]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}>Impact</NavLink>
            <NavLink to="/sponsorship" className={({isActive}) => `px-4 py-3 rounded-lg text-[15px] font-medium ${isActive ? 'bg-[#00D4FF]/10 text-[#00D4FF]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}>Sponsorship</NavLink>
            <NavLink to="/contact" className={({isActive}) => `px-4 py-3 rounded-lg text-[15px] font-medium ${isActive ? 'bg-[#00D4FF]/10 text-[#00D4FF]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}>Contact</NavLink>
            
            <div className={`mt-4 pt-4 ${isDarkMode ? '' : ''}`}>
              {isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <div className={`px-4 py-3 flex items-center gap-3 rounded-lg border ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="w-10 h-10 rounded-full bg-[#00D4FF] flex items-center justify-center text-white font-bold text-sm">{user?.name?.charAt(0) || 'U'}</div>
                    <div>
                      <p className={`text-[14px] font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.name}</p>
                      <p className="text-[12px] text-slate-500">{user?.email}</p>
                    </div>
                  </div>
                  <Link to="/dashboard" className={`px-4 py-3 rounded-full text-[14px] font-medium hover:bg-slate-50 dark:hover:bg-white/5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>View Dashboard</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-full text-[14px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">Log Out</button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-2 mt-2">
                  <Link to="/login" className={`btn btn-outline w-full justify-center text-[14px] py-2.5`}>Log In</Link>
                  <Link to="/register" className={`btn btn-primary w-full justify-center text-[14px] py-2.5`}>Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
