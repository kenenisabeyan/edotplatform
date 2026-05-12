import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Send, CreditCard, ChevronRight, FileText } from 'lucide-react';
import api from '../utils/api';

export default function ParentInsightGrid({ studentId }) {
  const isDarkMode = useThemeMode();
  const [insights, setInsights] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  void motion;

  useEffect(() => {
    if (!studentId) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [insightsRes, invoiceRes] = await Promise.all([
          api.get(`/parent/student/${studentId}/insights`),
          api.get(`/parent/student/${studentId}/invoice`)
        ]);
        
        if (insightsRes.data.success) setInsights(insightsRes.data.data);
        if (invoiceRes.data.success) setInvoice(invoiceRes.data.data);
      } catch (error) {
        console.error("Failed to fetch parent insights", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [studentId]);

  if (loading || !insights) {
    return <div className="animate-pulse space-y-6">
       <div className={`h-64 backdrop-blur-xl dark:bg-[#0B1120] rounded-3xl ${isDarkMode ? 'bg-[#0B1120]/5' : 'bg-slate-50'}`}></div>
    </div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Activity Timeline Stepper */}
      <Card hover={false} className={`lg:col-span-1 dark:bg-[#0B1120] shadow-xl ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <CardHeader>
           <h3 className="font-display font-extrabold text-lg text-slate-100 dark:text-white">Activity Timeline</h3>
           <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Milestones for {insights.studentName}</p>
        </CardHeader>
        <CardContent className="pt-0 relative">
           <div className={`absolute left-9 top-0 bottom-6 w-0.5 backdrop-blur-xl dark:bg-[#0B1120] z-0 ${isDarkMode ? 'bg-[#0B1120]/5' : 'bg-slate-50'}`}></div>
           <div className="space-y-6 relative z-10">
             {insights.timeline.map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.1 }}
                  key={item.id} 
                  className="flex items-start gap-4"
                >
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-white dark:border-[#0B1120] shadow-sm ${item.status === 'Completed' ? 'bg-[#10B981] ' : 'bg-[#0B1120]/10 dark:bg-slate-700 '} ${isDarkMode ? 'text-white text-slate-200' : 'text-slate-900 text-slate-600'}`}>
                     {item.status === 'Completed' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                   </div>
                   <div className="flex-1 pt-1">
                     <p className="text-sm font-bold text-slate-100 dark:text-slate-200">{item.courseName}</p>
                     <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{item.status} &bull; {item.progress}%</p>
                     <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{new Date(item.date).toLocaleDateString()}</p>
                   </div>
                </motion.div>
             ))}
           </div>
           <Button variant="ghost" className="w-full mt-6 text-xs text-[#6366F1]">View Full History <ChevronRight className="w-3 h-3" /></Button>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Support Connector */}
        <Card hover={false} className={`dark:bg-[#0B1120] shadow-xl bg-gradient-to-br from-indigo-50/50 to-white dark:from-[#6366F1]/5 dark:to-[#0B1120] ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
          <CardHeader>
             <h3 className="font-display font-extrabold text-lg text-slate-100 dark:text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-[#6366F1]" /> Request Advice
             </h3>
             <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Directly message instructors securely.</p>
          </CardHeader>
          <CardContent className="pt-0">
             <textarea 
               className={`w-full bg-[#0B1120] dark:bg-[#0B1120]/50 border dark:border-slate-800 !rounded-[32px] !px-6 py-4 text-sm focus:ring-2 focus:ring-[#6366F1] focus:border-transparent outline-none transition-all shadow-inner resize-none h-24 dark:text-slate-300 ${isDarkMode ? 'border-white/10 text-slate-200' : 'border-slate-200 text-slate-600'}`}
               placeholder={`Hello, I'd like an update regarding ${insights.studentName}'s recent performance in...`}
             ></textarea>
             <div className="flex justify-end mt-4">
                <Button variant="primary" className="shadow-[#6366F1]/30">Send Secure Message</Button>
             </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        {invoice && (
          <Card hover={false} className={`dark:bg-[#0B1120] shadow-xl relative overflow-hidden group ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/10 rounded-full blur-2xl group-hover:bg-[#10B981]/20 transition-colors"></div>
            <CardHeader className="flex flex-row justify-between items-start">
               <div>
                 <h3 className="font-display font-extrabold text-lg text-slate-100 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#10B981]" /> Mini-Invoice
                 </h3>
                 <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Ref #${Math.random().toString(36).substring(7).toUpperCase()}</p>
               </div>
               <span className="bg-amber-100 dark:bg-amber-500/100/20 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full  ">
                 {invoice.status}
               </span>
            </CardHeader>
            <CardContent className="pt-0 relative z-10 flex flex-col sm:flex-row items-end justify-between gap-6">
               <div className="flex-1 w-full">
                 <p className={`text-sm font-medium dark:text-slate-200 border-b dark:border-slate-800 pb-3 mb-3 ${isDarkMode ? 'text-slate-300 border-white/5' : 'text-slate-500 border-slate-100'}`}>
                   {invoice.description}
                 </p>
                 <div className="flex justify-between items-baseline">
                    <span className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                    <h2 className="text-4xl font-display font-extrabold tracking-tight text-slate-100 dark:text-white">
                      ${invoice.pendingFees}<span className={`text-base font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>.{invoice.currency}</span>
                    </h2>
                 </div>
               </div>
               <Button variant="success" icon={CreditCard} size="lg" className="w-full sm:w-auto shadow-[#10B981]/30">
                 Quick Pay
               </Button>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}
