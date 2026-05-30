import React from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { Link } from 'react-router-dom';
import { Phone, Linkedin, Send, Facebook, Youtube, Instagram, Heart } from 'lucide-react';

const edotLogo = 'https://res.cloudinary.com/dacck6udl/image/upload/f_auto,q_auto/v1/edot/frontend/images/e69zbyhv3obsuf4uknyy';

export default function Footer() {
  const isDarkMode = useThemeMode();

  return (
    <footer className={elative z-20 pt-20 pb-12 transition-all duration-500 overflow-hidden ${
      isDarkMode
        ? 'bg-[#0b1733] text-slate-100'
        : 'bg-[#f7fbff] text-slate-800'
    }} role="contentinfo">
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#0d6efd]/10 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0d6efd]/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-[1.4fr_1fr_0.9fr] gap-10 items-start">
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shadow-sm border border-slate-200">
                <img src={edotLogo} alt="EDOT Logo" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-[#0d6efd]">EDOT</p>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500/90">Education for All</p>
              </div>
            </Link>
            <p className="max-w-md text-sm leading-7 text-slate-600">
              EDOT connects learners, instructors, parents, and sponsors with verified courses, real progress tracking, and transparent support.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
              <Link to="/courses" className="block font-semibold hover:text-[#0d6efd]">Courses</Link>
              <Link to="/contact" className="block font-semibold hover:text-[#0d6efd]">Contact Us</Link>
              <Link to="/about" className="block font-semibold hover:text-[#0d6efd]">About Us</Link>
              <Link to="/testimony" className="block font-semibold hover:text-[#0d6efd]">Testimony</Link>
              <Link to="/support" className="block font-semibold hover:text-[#0d6efd]">Customer Services</Link>
              <Link to="/help" className="block font-semibold hover:text-[#0d6efd]">Help Center</Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">Platform support</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Get direct assistance for enrollment, sponsorship connections, course management, and instructor coordination.
            </p>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center justify-center rounded-full border border-slate-200 bg-[#0d6efd] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/5 transition hover:bg-[#0b5ed7]"
            >
              Contact Us
            </Link>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-8">
              <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-900">Connect</h4>
              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#0d6efd]" />
                  <span>+251 (906) 101-111</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#0d6efd]" />
                  <span>+251 (977) 666-699</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#0d6efd]" />
                  <span>+251 (116) 867-546</span>
                </div>
              </div>
            </div>
            <div className="rounded-[32px] border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center gap-3">
                {[{ icon: Facebook, href: '#' }, { icon: Youtube, href: '#' }, { icon: Linkedin, href: '#' }, { icon: Instagram, href: '#' }, { icon: Send, href: '#' }].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#0d6efd] hover:bg-[#0d6efd] hover:text-white"
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-sm text-slate-600">
            <div className="flex flex-wrap items-center gap-5">
              <span>+251 (906) 101-111</span>
              <span>+251 (977) 666-699</span>
              <span>+251 (116) 867-546</span>
            </div>
            <div className="text-slate-500">© 2024 EDOT, Education for All. Transforming learning, creating opportunities.</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
