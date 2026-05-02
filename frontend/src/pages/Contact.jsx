import React, { useState } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { 
  Mail, Phone, MapPin, Send, CheckCircle, 
  Facebook, Linkedin, Youtube, Instagram, MessageCircle, 
  Handshake, HelpCircle, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Contact() {
  const isDarkMode = useThemeMode();
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Learner', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoadingSubmit(false);
      setTimeout(() => {
        setFormData({ name: '', email: '', role: 'Learner', subject: '', message: '' });
        setSubmitted(false);
      }, 5000);
    }, 1500);
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${isDarkMode ? 'bg-[#0B1120] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      <div className="relative z-10 pt-24">
        
        {/* 1. HERO SECTION */}
        <section className={`relative w-full py-20 lg:py-32 px-6 overflow-hidden flex flex-col items-center border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="absolute inset-0 z-0">
             <div className={`absolute inset-0 bg-gradient-to-r z-10 ${isDarkMode ? 'from-[#0B1120] via-[#0B1120]/90 to-transparent' : 'from-slate-50 via-slate-50/95 to-slate-50/40'}`}></div>
             <img 
               src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80" 
               alt="Friendly customer support team" 
               className="w-full h-full object-cover object-center lg:object-right"
             />
          </div>

          <div className="max-w-[1200px] w-full mx-auto relative z-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={`text-left ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
               <div className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-full border mb-6 ${isDarkMode ? 'bg-white/10 border-white/20' : 'bg-[#EBC176]/10 border-[#EBC176]/30'}`}>
                  <Mail className={`w-4 h-4 ${isDarkMode ? 'text-[#EBC176]' : 'text-[#D97706]'}`} />
                  <span className={`text-[11px] font-bold tracking-wider uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>We'd Love to Hear From You</span>
               </div>
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                 Let’s Connect and Build the <span className={`${isDarkMode ? 'text-[#EBC176]' : 'text-[#D97706]'}`}>Future of Education</span>
               </h1>
               <p className={`text-lg md:text-xl font-normal leading-relaxed max-w-xl ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                 Have questions, ideas, or want to collaborate? Reach out — we’re here to support you whether you're a learner, instructor, parent, sponsor, or partner.
               </p>
            </div>
          </div>
        </section>

        {/* 2. MAIN CONTACT SECTION (Form + Info) */}
        <section className={`py-24 px-6 border-b ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
             
             {/* LEFT: Contact Form */}
             <div className="lg:col-span-7">
               <div className={`p-8 md:p-12 rounded-3xl border shadow-xl relative overflow-hidden h-full ${isDarkMode ? 'bg-[#0B1120] border-white/10' : 'bg-white border-slate-200'}`}>
                  
                  {submitted ? (
                    <div className="flex flex-col items-center justify-center text-center py-24 relative z-10 w-full h-full animate-in fade-in zoom-in duration-500">
                      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8 border bg-[#EBC176]/10 border-[#EBC176]/20">
                        <CheckCircle className="w-12 h-12 text-[#EBC176]" />
                      </div>
                      <h3 className="text-3xl font-bold mb-4">Message Sent Successfully!</h3>
                      <p className={`max-w-sm mx-auto leading-relaxed text-[15px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Thank you for reaching out. We’ll get back to you as soon as possible.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10 w-full">
                      <div className="mb-10 border-b pb-8 border-slate-200 dark:border-white/5">
                         <h2 className="text-3xl font-bold mb-3">Send Us a Message</h2>
                         <p className={`text-[15px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>We’ll get back to you as soon as possible.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={`block text-sm font-semibold mb-2 ml-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Full Name</label>
                          <input 
                            type="text" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            required 
                            placeholder="e.g. Abebe Kebede"
                            className={`w-full px-5 py-4 border rounded-xl focus:outline-none transition-all text-[15px] ${isDarkMode ? 'bg-[#0B1120] border-white/10 text-white placeholder-slate-600 focus:border-[#EBC176]/50' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#EBC176]/50 shadow-sm'}`} 
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-semibold mb-2 ml-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Email Address</label>
                          <input 
                            type="email" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                            required 
                            placeholder="abebe@example.com"
                            className={`w-full px-5 py-4 border rounded-xl focus:outline-none transition-all text-[15px] ${isDarkMode ? 'bg-[#0B1120] border-white/10 text-white placeholder-slate-600 focus:border-[#EBC176]/50' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#EBC176]/50 shadow-sm'}`} 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={`block text-sm font-semibold mb-2 ml-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Your Role</label>
                          <div className="relative">
                            <select 
                              value={formData.role} 
                              onChange={e => setFormData({...formData, role: e.target.value})} 
                              className={`w-full px-5 py-4 border rounded-xl focus:outline-none transition-all text-[15px] appearance-none cursor-pointer ${isDarkMode ? 'bg-[#0B1120] border-white/10 text-white focus:border-[#EBC176]/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#EBC176]/50 shadow-sm'}`}
                            >
                              <option value="Learner">Learner</option>
                              <option value="Instructor">Instructor</option>
                              <option value="Parent">Parent</option>
                              <option value="Sponsor">Sponsor</option>
                              <option value="Partner">Partner</option>
                              <option value="Other">Other</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className={`block text-sm font-semibold mb-2 ml-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Subject</label>
                          <input 
                            type="text" 
                            value={formData.subject} 
                            onChange={e => setFormData({...formData, subject: e.target.value})} 
                            required 
                            placeholder="How can we help?"
                            className={`w-full px-5 py-4 border rounded-xl focus:outline-none transition-all text-[15px] ${isDarkMode ? 'bg-[#0B1120] border-white/10 text-white placeholder-slate-600 focus:border-[#EBC176]/50' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#EBC176]/50 shadow-sm'}`} 
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ml-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Message</label>
                        <textarea 
                          rows="5" 
                          value={formData.message} 
                          onChange={e => setFormData({...formData, message: e.target.value})} 
                          required 
                          placeholder="Type your message here..."
                          className={`w-full px-5 py-4 border rounded-xl focus:outline-none transition-all resize-none text-[15px] ${isDarkMode ? 'bg-[#0B1120] border-white/10 text-white placeholder-slate-600 focus:border-[#EBC176]/50' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#EBC176]/50 shadow-sm'}`}
                        ></textarea>
                      </div>
                      
                      <button 
                        type="submit" 
                        disabled={loadingSubmit}
                        className="btn-primary w-full py-4 text-[15px] flex items-center justify-center gap-3 mt-4 transition-transform hover:scale-[1.02]"
                      >
                        {loadingSubmit ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                        {loadingSubmit ? 'SENDING...' : 'SEND MESSAGE'}
                      </button>
                    </form>
                  )}
               </div>
             </div>

             {/* RIGHT: Contact Info & Socials */}
             <div className="lg:col-span-5 flex flex-col gap-10">
                
                {/* Minimal Illustration Image */}
                <div className={`w-full h-48 rounded-3xl overflow-hidden border relative shadow-sm ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                   <img src="https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&q=80" alt="Contact Support Minimal" className="w-full h-full object-cover" />
                   <div className={`absolute inset-0 ${isDarkMode ? 'bg-[#0B1120]/40' : 'bg-[#F8FAFC]/10'}`}></div>
                </div>

                {/* Contact Info */}
                <div>
                   <h3 className="text-3xl font-bold mb-8">Reach Us Directly</h3>
                   
                   <div className="space-y-8">
                      <div className="flex items-start gap-5 group">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isDarkMode ? 'bg-[#EBC176]/10 text-[#EBC176] group-hover:bg-[#EBC176]/20' : 'bg-[#EBC176]/10 text-[#D97706] group-hover:bg-[#EBC176]/20'}`}>
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Phone Numbers</p>
                          <p className="font-bold text-lg">+251 911 234 567</p>
                          <p className="font-bold text-lg">+251 922 345 678</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-5 group">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isDarkMode ? 'bg-[#EBC176]/10 text-[#EBC176] group-hover:bg-[#EBC176]/20' : 'bg-[#EBC176]/10 text-[#D97706] group-hover:bg-[#EBC176]/20'}`}>
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Email Address</p>
                          <a href="mailto:support@edot.com" className="font-bold text-lg hover:text-[#EBC176] transition-colors">support@edot.com</a>
                        </div>
                      </div>

                      <div className="flex items-start gap-5 group">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isDarkMode ? 'bg-[#EBC176]/10 text-[#EBC176] group-hover:bg-[#EBC176]/20' : 'bg-[#EBC176]/10 text-[#D97706] group-hover:bg-[#EBC176]/20'}`}>
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Location</p>
                          <p className="font-bold text-lg">Addis Ababa, Ethiopia</p>
                        </div>
                      </div>
                   </div>
                </div>

                <div className={`h-px w-full ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>

                {/* Social Presence */}
                <div>
                   <h3 className="text-2xl font-bold mb-6">Connect With Us</h3>
                   <div className="flex flex-wrap gap-4">
                      <a href="#" className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all hover:-translate-y-1 ${isDarkMode ? 'bg-transparent border-white/20 hover:bg-[#1877F2] hover:border-[#1877F2]' : 'bg-white border-slate-300 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white'}`}>
                        <Facebook className="w-5 h-5" />
                      </a>
                      <a href="#" className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all hover:-translate-y-1 ${isDarkMode ? 'bg-transparent border-white/20 hover:bg-[#0A66C2] hover:border-[#0A66C2]' : 'bg-white border-slate-300 hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white'}`}>
                        <Linkedin className="w-5 h-5" />
                      </a>
                      <a href="#" className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all hover:-translate-y-1 ${isDarkMode ? 'bg-transparent border-white/20 hover:bg-[#229ED9] hover:border-[#229ED9]' : 'bg-white border-slate-300 hover:bg-[#229ED9] hover:border-[#229ED9] hover:text-white'}`}>
                        <Send className="w-5 h-5" />
                      </a>
                      <a href="#" className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all hover:-translate-y-1 ${isDarkMode ? 'bg-transparent border-white/20 hover:bg-[#FF0000] hover:border-[#FF0000]' : 'bg-white border-slate-300 hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white'}`}>
                        <Youtube className="w-5 h-5" />
                      </a>
                      <a href="#" className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all hover:-translate-y-1 ${isDarkMode ? 'bg-transparent border-white/20 hover:bg-[#E4405F] hover:border-[#E4405F]' : 'bg-white border-slate-300 hover:bg-[#E4405F] hover:border-[#E4405F] hover:text-white'}`}>
                        <Instagram className="w-5 h-5" />
                      </a>
                   </div>
                </div>

             </div>
          </div>
        </section>

        {/* 3. PARTNERSHIP & QUICK HELP (Split Grid) */}
        <section className={`py-24 px-6 border-b ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
           <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Partnership */}
              <div className={`p-10 rounded-3xl border flex flex-col justify-between relative overflow-hidden group ${isDarkMode ? 'bg-[#0B1120] border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-[#EBC176]/50'} transition-colors`}>
                 <div className="relative z-10">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${isDarkMode ? 'bg-[#EBC176]/10 text-[#EBC176]' : 'bg-[#EBC176]/10 text-[#D97706]'}`}>
                     <Handshake className="w-7 h-7" />
                   </div>
                   <h3 className="text-2xl font-bold mb-4">Work With Us</h3>
                   <p className={`text-[15px] leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                     We welcome partnerships with educators, institutions, and organizations who share our vision of improving education and creating opportunities.
                   </p>
                 </div>
                 <Link to="/register?role=partner" className="inline-flex items-center gap-2 font-bold text-[#EBC176] hover:gap-3 transition-all relative z-10 w-fit">
                   Become a Partner <ArrowRight className="w-4 h-4" />
                 </Link>
                 
                 {/* Decorative background image */}
                 <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-[0.03] pointer-events-none transition-opacity duration-500 group-hover:opacity-[0.08]">
                    <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80" alt="Partnership" className="w-full h-full object-cover" />
                 </div>
              </div>

              {/* Quick Help */}
              <div className={`p-10 rounded-3xl border flex flex-col justify-between relative overflow-hidden group ${isDarkMode ? 'bg-[#0B1120] border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-blue-500/50'} transition-colors`}>
                 <div className="relative z-10">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-500/10 text-blue-600'}`}>
                     <HelpCircle className="w-7 h-7" />
                   </div>
                   <h3 className="text-2xl font-bold mb-4">Need Quick Answers?</h3>
                   <p className={`text-[15px] leading-relaxed mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                     Find answers to common questions about courses, sponsorship, and platform usage in our comprehensive Help Center.
                   </p>
                 </div>
                 <Link to="/help" className={`inline-flex items-center gap-2 font-bold hover:gap-3 transition-all relative z-10 w-fit ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                   Visit Help Center <ArrowRight className="w-4 h-4" />
                 </Link>
              </div>

           </div>
        </section>

        {/* 4. MAP SECTION */}
        <section className={`py-24 px-6 ${isDarkMode ? 'bg-[#0B1120]' : 'bg-white'}`}>
           <div className="max-w-[1200px] mx-auto text-center">
              <h2 className="text-4xl font-bold mb-12">Our Location</h2>
              <div className={`w-full h-[450px] rounded-[2rem] overflow-hidden border shadow-lg ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d252230.02028974562!2d38.61332804021528!3d8.963479542403238!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85cef5ab402d%3A0x8467b6b037a24d49!2sAddis%20Ababa%2C%20Ethiopia!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="EDOT Location"
                ></iframe>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
}