import React, { useState, useMemo, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { CircleDollarSign, Plus, ArrowDownRight, Briefcase, Server, Megaphone, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumModal from '../components/PremiumModal';

const StatBox = ({ title, value, subtitle, type, icon: Icon }) => {
  const isDarkMode = useThemeMode();
  return (
    <div className={`p-4 md:p-6 rounded-3xl border shadow-sm overflow-hidden flex flex-col justify-center relative ${type === 'primary' ? 'bg-gradient-to-r from-rose-500 to-rose-700 border-rose-400/50' : (isDarkMode ? 'bg-[#0B1120]/90 backdrop-blur-xl' : 'bg-white')} ${isDarkMode ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'}`}>
      <div className="flex justify-between items-start mb-2 md:mb-4 relative z-10">
        <h3 className={`font-black text-[10px] truncate ${type === 'primary' ? 'text-white/80' : (isDarkMode ? 'text-slate-200' : 'text-slate-500')}`}>{title}</h3>
        {Icon && (
           <div className={`p-1.5 rounded-lg border ${type === 'primary' ? 'bg-white/20 border-white/30 text-white' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
             <Icon className="w-4 h-4" />
           </div>
        )}
      </div>
      <h2 className={`text-2xl md:text-3xl lg:text-4xl font-black truncate w-full relative z-10 ${type === 'primary' ? 'text-white' : (isDarkMode ? 'text-rose-500' : 'text-rose-600')}`} title={value}>{value}</h2>
      <p className={`text-[9px] md:text-[10px] mt-1 md:mt-2 font-bold truncate relative z-10 ${type === 'primary' ? 'text-white/70' : (isDarkMode ? 'text-slate-300' : 'text-slate-500')}`}>{subtitle}</p>
      
      {/* Background Graphic */}
      {type === 'primary' && (
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl z-0 pointer-events-none"></div>
      )}
    </div>
  );
};

export default function FinanceExpenses() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: 'Marketing', amount: '', description: '' });

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const { data } = await api.get('/expenses');
        if (data.success) {
          setExpenses(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch expenses', err);
        toast.error('Failed to load expenses');
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  const { totalExpenses, pendingPayouts } = useMemo(() => {
    return {
      totalExpenses: expenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
      pendingPayouts: expenses.filter(e => e.status === 'pending').reduce((sum, exp) => sum + Number(exp.amount), 0)
    };
  }, [expenses]);

  const expenseData = useMemo(() => {
    // Generate simple mock trajectory for visual purposes based on actual total
    return [
      { name: 'Jan', cost: totalExpenses * 0.2 },
      { name: 'Feb', cost: totalExpenses * 0.4 },
      { name: 'Mar', cost: totalExpenses * 0.6 },
      { name: 'Apr', cost: totalExpenses * 0.8 },
      { name: 'May', cost: totalExpenses }
    ];
  }, [totalExpenses]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) {
       toast.error('Please fill all fields');
       return;
    }
    
    try {
      const { data } = await api.post('/expenses', {
         category: newExpense.category,
         amount: Number(newExpense.amount),
         description: newExpense.description,
         status: 'paid'
      });

      if (data.success) {
        setExpenses([data.data, ...expenses]);
        setShowAddModal(false);
        setNewExpense({ category: 'Marketing', amount: '', description: '' });
        toast.success('Expense recorded securely in the ledger.');
      }
    } catch (err) {
      console.error('Failed to record expense', err);
      toast.error('Server error creating expense');
    }
  };

  return (
    <div className="animate-in fade-in flex flex-col space-y-8 min-h-screen p-0 md:p-6 w-full">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6 pt-2 mb-8 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <ArrowDownRight className="w-8 h-8 text-rose-500" />
            Operating Expenses
          </h1>
          <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Track outbound capital, infrastructure costs, and instructor payouts.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className={`px-6 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-sm transition-all ${isDarkMode ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}`}
        >
          <Plus className="w-5 h-5" /> Record Expense
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 backdrop-blur-xl p-6 md:p-8 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-[#0B1120]/90 border-white/10' : 'bg-white border-slate-200'}`}>
           <div className="flex justify-between items-center mb-6">
             <h3 className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Outbound Trajectory</h3>
             <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-bold px-3 py-1 rounded-full">YTD Burn Rate</span>
           </div>
           
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={expenseData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.05} />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                 <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', background: '#0B1120', color: '#fff', fontWeight: 'bold' }} />
                 <Area type="monotone" dataKey="cost" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
           <StatBox title="Gross Outbound (YTD)" value={`$${totalExpenses.toLocaleString()}`} subtitle="Total computed expenses" type="primary" icon={ArrowDownRight} />
           <StatBox title="Pending Liabilities" value={`$${pendingPayouts.toLocaleString()}`} subtitle="Unpaid instructor shares" type="default" icon={Briefcase} />
        </div>
      </div>

      <div className={`backdrop-blur-xl rounded-3xl border shadow-xl overflow-hidden ${isDarkMode ? 'bg-[#0B1120]/90 border-white/10' : 'bg-white border-slate-200'}`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-white/10 bg-[#0B1120]/5' : 'border-slate-200 bg-slate-50'}`}>
          <h3 className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Expense Ledger</h3>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className={`bg-[#0B1120] text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>
                <th className={`px-6 py-5 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>Date</th>
                <th className={`px-6 py-5 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>Category</th>
                <th className={`px-6 py-5 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>Description</th>
                <th className={`px-6 py-5 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>Amount</th>
                <th className={`px-6 py-5 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-white/5 text-sm font-normal ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-white/5 transition-colors">
                  <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>{exp.date}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2 font-bold text-[13px]">
                      {exp.category === 'Server Hosting' && <Server className="w-4 h-4 text-blue-500" />}
                      {exp.category === 'Marketing' && <Megaphone className="w-4 h-4 text-[#00D4FF]" />}
                      {exp.category === 'Instructor Payouts' && <Briefcase className="w-4 h-4 text-emerald-500" />}
                      {exp.category}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{exp.description}</td>
                  <td className="px-6 py-4 font-black text-rose-500">${exp.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-wider ${
                      exp.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20'
                    }`}>
                      {exp.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                      {exp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <PremiumModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="max-w-md">
             <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
             <h2 className={`text-2xl font-black mb-6 relative z-10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Record Expense</h2>
             <form onSubmit={handleAddExpense} className="space-y-4">
               <div>
                 <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Expense Category</label>
                 <select 
                   value={newExpense.category} 
                   onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                   className={`w-full px-4 py-3 rounded-xl border outline-none font-medium ${isDarkMode ? 'bg-[#151B2B] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                 >
                   <option value="Marketing">Marketing & Ads</option>
                   <option value="Server Hosting">Server & Infrastructure</option>
                   <option value="Instructor Payouts">Instructor Payouts</option>
                   <option value="Software Licenses">Software Licenses</option>
                 </select>
               </div>
               <div>
                 <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Amount ($)</label>
                 <input 
                   type="number" 
                   value={newExpense.amount}
                   onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                   placeholder="e.g. 500"
                   className={`w-full px-4 py-3 rounded-xl border outline-none font-medium ${isDarkMode ? 'bg-[#151B2B] border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                 />
               </div>
               <div>
                 <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Description</label>
                 <input 
                   type="text" 
                   value={newExpense.description}
                   onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                   placeholder="e.g. Facebook Ads Campaign"
                   className={`w-full px-4 py-3 rounded-xl border outline-none font-medium ${isDarkMode ? 'bg-[#151B2B] border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                 />
               </div>
               
               <div className="flex gap-3 pt-4">
                 <button type="button" onClick={() => setShowAddModal(false)} className={`flex-1 py-3 rounded-xl font-bold transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}>Cancel</button>
                 <button type="submit" className={`flex-1 py-3 rounded-xl font-bold transition-colors shadow-lg ${isDarkMode ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}`}>Record Ledger</button>
               </div>
             </form>
      </PremiumModal>
    </div>
  );
}
