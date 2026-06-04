import React, { useState, useEffect, useRef } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronDown, LogOut, Settings, Bell, BookOpen, Shield, LogIn, HelpCircle, ArrowRight, Search } from 'lucide-react';
const edotLogo = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/jpw8g8m6spazsktyizdw';
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
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    // close menus when route changes
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const headerStyle = isDarkMode ? {
    borderBottom: 'none',
    boxShadow: isScrolled ? '0 15px 40px -10px rgba(0, 0, 0, 0.95), 0 6px 18px -8px rgba(0, 212, 255, 0.5), 0 1px 0px rgba(255, 255, 255, 0.15)' : 'none',
    background: isScrolled ? 'rgba(11, 17, 32, 0.95)' : 'transparent',
    backdropFilter: isScrolled ? 'blur(12px)' : 'none',
    paddingTop: isScrolled ? '20px' : '32px',
    paddingBottom: isScrolled ? '20px' : '32px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  } : {
    borderBottom: 'none',
    boxShadow: isScrolled ? '0 15px 40px -10px rgba(15, 23, 42, 0.38), 0 6px 18px -8px rgba(15, 23, 42, 0.25), 0 1px 0px rgba(15, 23, 42, 0.1)' : 'none',
    background: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
    backdropFilter: isScrolled ? 'blur(12px)' : 'none',
    paddingTop: isScrolled ? '20px' : '32px',
    paddingBottom: isScrolled ? '20px' : '32px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };
 
  const isAuthPage = ['/login', '/register', '/signup', '/forgot', '/reset'].some(p => location.pathname.startsWith(p));

  const navLinkClass = ({ isActive }) => `text-[15px] font-semibold transition-colors ${isActive ? 'text-[#00D4FF]' : (isDarkMode ? 'text-slate-200 hover:text-white/90' : 'text-slate-700 hover:text-slate-900')}`;

  const toggleMenu = () => setMobileMenuOpen(v => !v);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50`}
      style={headerStyle}
    >
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        
        {/* LEFT: Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-102 group">
            <div className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shadow-sm ${
              isDarkMode ? 'bg-[#0B1120] border border-white/10' : 'bg-white border border-slate-200'
            }`}>
               <img src={edotLogo} alt="EDOT" className="w-7 h-7 object-contain" />
            </div>
            <div className="flex flex-col justify-center text-left">
              <span className={`text-[19px] font-black leading-none tracking-tight transition-colors ${
                isDarkMode || isTransparentDarkBg ? 'text-white' : 'text-slate-900'
              }`}>EDOT</span>
              <span className={`text-[8.5px] font-black tracking-widest mt-1.5 uppercase ${
                isDarkMode || isTransparentDarkBg ? 'text-slate-300' : 'text-slate-500'
              }`}>Education to 18</span>
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
          <button 
            onClick={() => navigate('/courses')} 
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:text-[#19C2E8] ${
              isDarkMode ? 'border-slate-800 text-slate-300 hover:border-[#19C2E8]' : 'border-slate-200 text-slate-700 hover:border-[#19C2E8]'
            }`}
            aria-label="Search Courses"
          >
            <Search className="w-4.5 h-4.5" />
          </button>
          <ThemeDropdown />
          {isAuthenticated ? (
            <div className="flex items-center gap-5">
              <Link to="/dashboard/messages" className={`relative transition-colors hover:text-[#19C2E8] ${isDarkMode || isTransparentDarkBg ? 'text-slate-300' : 'text-slate-600'}`}>
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#19C2E8] text-[8px] font-bold text-white flex items-center justify-center rounded-full border border-transparent">1</span>
              </Link>
              
              <div className="relative" ref={userDropdownRef}>
                <button 
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 transition-transform hover:scale-105 focus:outline-none`}
                >
                  <div className="w-9 h-9 rounded-full bg-[#19C2E8] flex items-center justify-center text-white shadow-md">
                    <span className="font-bold text-sm">{user?.name?.charAt(0) || 'U'}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${userDropdownOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-white' : 'text-slate-700'}`} />
                </button>

                <div className={`absolute top-[calc(100%+1rem)] right-0 w-64 border rounded-xl shadow-lg transition-all duration-200 origin-top-right overflow-hidden desktop-user-dropdown ${userDropdownOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                  <div className="p-4 border-b desktop-user-dropdown-header">
                    <p className="text-[14px] font-semibold truncate desktop-user-dropdown-name">{user?.name || 'User'}</p>
                    <p className="text-[12px] truncate mt-0.5 desktop-user-dropdown-email">{user?.email || 'user@example.com'}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-full text-[13px] font-medium transition-colors desktop-user-dropdown-link">
                      <Shield className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link to="/dashboard/courses" className="flex items-center gap-3 px-3 py-2 rounded-full text-[13px] font-medium transition-colors desktop-user-dropdown-link">
                      <BookOpen className="w-4 h-4" /> My Learning
                    </Link>
                    <Link to="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-full text-[13px] font-medium transition-colors desktop-user-dropdown-link">
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                  </div>
                  <div className="p-2">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-full text-[13px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className={`flex items-center gap-2 font-bold text-[14px] transition-colors hover:text-[#19C2E8] ${
                  isDarkMode || isTransparentDarkBg ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                  isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-700'
                }`}>
                  <LogIn className="w-4 h-4" />
                </div>
                Log in
              </Link>
              <Link 
                to="/signup" 
                className="bg-[#FF5A00] hover:bg-[#E54B00] text-white px-6 py-2.5 rounded-full font-bold text-[14px] transition-colors shadow-sm ml-2 flex items-center gap-1.5"
              >
                Sign up
              </Link>
              <button 
                onClick={() => navigate('/contact')}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors hover:text-[#19C2E8] ${
                  isDarkMode ? 'border-slate-800 text-slate-300 hover:border-[#19C2E8]' : 'border-slate-200 text-slate-700 hover:border-[#19C2E8]'
                }`}
                aria-label="FAQ & Help"
              >
                <HelpCircle className="w-4.5 h-4.5" />
              </button>
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
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-[85vw] max-w-[380px] mobile-menu-drawer shadow-2xl p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="mobile-menu-title text-lg font-semibold">Menu</div>
              <button onClick={toggleMenu} className="p-2 rounded-full mobile-menu-close-btn transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
                <NavLink to="/" className={({isActive}) => `flex items-center w-full px-6 py-4 text-[18px] font-semibold transition-colors ${isActive ? 'mobile-menu-link-active' : 'mobile-menu-link-inactive'}`}>Home</NavLink>
                <NavLink to="/courses" className={({isActive}) => `flex items-center w-full px-6 py-4 text-[18px] font-semibold transition-colors ${isActive ? 'mobile-menu-link-active' : 'mobile-menu-link-inactive'}`}>Courses</NavLink>
                <NavLink to="/about" className={({isActive}) => `flex items-center w-full px-6 py-4 text-[18px] font-semibold transition-colors ${isActive ? 'mobile-menu-link-active' : 'mobile-menu-link-inactive'}`}>About</NavLink>
                <NavLink to="/impact" className={({isActive}) => `flex items-center w-full px-6 py-4 text-[18px] font-semibold transition-colors ${isActive ? 'mobile-menu-link-active' : 'mobile-menu-link-inactive'}`}>Impact</NavLink>
                <NavLink to="/sponsorship" className={({isActive}) => `flex items-center w-full px-6 py-4 text-[18px] font-semibold transition-colors ${isActive ? 'mobile-menu-link-active' : 'mobile-menu-link-inactive'}`}>Sponsorship</NavLink>
                <NavLink to="/contact" className={({isActive}) => `flex items-center w-full px-6 py-4 text-[18px] font-semibold transition-colors ${isActive ? 'mobile-menu-link-active' : 'mobile-menu-link-inactive'}`}>Contact</NavLink>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <div className="px-4 py-4 mobile-menu-user-card">
                    <p className="text-sm truncate mobile-menu-user-name">{user?.name || 'User'}</p>
                    <p className="text-xs truncate mobile-menu-user-email">{user?.email || 'user@example.com'}</p>
                  </div>
                  <Link to="/dashboard" className="px-4 py-3 rounded-full bg-[#00D4FF] text-slate-950 text-center font-semibold">View Dashboard</Link>
                  <button onClick={handleLogout} className="w-full px-4 py-3 rounded-full border border-red-500 text-red-400 font-semibold hover:bg-red-500/10">Log Out</button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" className="px-4 py-3 rounded-full text-center font-semibold mobile-menu-btn-login">Log In</Link>
                  <Link to="/signup" className="px-4 py-3 rounded-full text-center font-semibold mobile-menu-btn-signup">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
