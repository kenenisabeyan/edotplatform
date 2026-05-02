import React, { useState, useEffect } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { useAuth } from '../context/AuthContext';
import api, { performanceService } from '../services/api';
import SummaryCard from '../components/cards/SummaryCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Target, Users, BookOpen, Award, Filter } from 'lucide-react';

export default function Performance() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [engagementData, setEngagementData] = useState([]);
  const [activeLearners, setActiveLearners] = useState(0);
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [topPerformers, setTopPerformers] = useState([]);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const role = user?.role ? user.role.toLowerCase() : 'student';
        const [perfRes, reportsRes] = await Promise.all([
           performanceService.getPerformanceData(role),
           api.get('/attendance/reports').catch(() => ({ data: { data: [] } }))
        ]);
        
        const data = perfRes || {};
        setEngagementData(data.engagementData || []);
        setActiveLearners(data.totalActiveLearners || 0);
        setTotalCompletions(data.totalCourseCompletions || 0);

        const reports = reportsRes.data?.data || [];
        let totalScore = 0;
        let scoreCount = 0;
        let allStudents = [];

        reports.forEach(report => {
           if (report.studentRecords && report.studentRecords.length > 0) {
              report.studentRecords.forEach(sr => {
                 if (sr.attendancePercentage) {
                    totalScore += Number(sr.attendancePercentage);
                    scoreCount++;
                 }
                 if (sr.student && sr.student.name) {
                    allStudents.push({
                       name: sr.student.name,
                       score: Number(sr.attendancePercentage) || 0,
                       course: report.course?.title || 'Course',
                       grade: sr.finalGrade || 'Pending'
                    });
                 }
              });
           }
        });

        setAvgScore(scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0);

        const sorted = allStudents.sort((a, b) => b.score - a.score).slice(0, 5);
        const uniquePerformers = [];
        const seen = new Set();
        sorted.forEach(s => {
           if (!seen.has(s.name)) {
              seen.add(s.name);
              uniquePerformers.push(s);
           }
        });
        setTopPerformers(uniquePerformers);

      } catch (error) {
        console.error("Failed to load performance data", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchPerformance();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className={`w-8 h-8 border-4 border-t-[#FFD700] rounded-full animate-spin ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className={`flex justify-between items-center mb-6 backdrop-blur-xl p-6 rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-[#1E293B]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
        <div>
          <h1 className={`text-2xl font-display font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Performance Insights</h1>
          <p className="text-[#FFD700] text-xs font-bold   mt-1">Analyze learner growth, attendance accuracy, and engagement</p>
        </div>
        <button className={`flex items-center gap-2 border px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors bg-[#E67E22] hover:bg-[#CF711F] shadow-md border-[#E67E22] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <Filter className="w-4 h-4" /> Filter Analytics
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard 
          title="Active Learners" 
          value={activeLearners} 
          icon={Users} 
          colorTheme="blue" 
        />
        <SummaryCard 
          title="Total Completions" 
          value={totalCompletions} 
          icon={Award} 
          colorTheme="purple" 
        />
        <SummaryCard 
          title="Avg. Performance Score" 
          value={`${avgScore}%`} 
          icon={Target} 
          colorTheme="green" 
        />
        <SummaryCard 
          title="Enrolled Activity" 
          value={activeLearners} 
          icon={BookOpen} 
          colorTheme="orange" 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Engagement Trend */}
        <div className={`xl:col-span-2 backdrop-blur-xl p-8 rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-[#1E293B]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
          <h3 className={`text-xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Engagement vs Enrollment Timeline</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', background: '#0B0E14', color: '#fff', fontWeight: 'bold' }} />
                <Bar dataKey="students" name="Active Students" fill="#4B5563" radius={[6, 6, 0, 0]} />
                <Bar dataKey="teachers" name="Active Instructors" fill="#FFD700" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers Table */}
        <div className={`backdrop-blur-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${isDarkMode ? 'bg-[#1E293B]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
          <div className={`p-6 border-b ${isDarkMode ? 'border-white/10 bg-[#1E293B]/5' : 'border-slate-200 bg-slate-50'}`}>
             <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Top Course Performers</h3>
             <p className={`text-[10px] font-bold mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>Based on aggregated historic metrics</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-4">
             {topPerformers.length > 0 ? (
                topPerformers.map((student, idx) => (
                   <div key={idx} className={`flex justify-between items-center bg-[#1E293B] border px-4 py-3 rounded-2xl hover:border-white/10 transition-colors ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                      <div>
                         <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{student.name}</h4>
                         <p className="text-[10px] font-bold   text-[#FFD700]">{student.course}</p>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-[#E67E22] font-black text-sm">{student.score}%</span>
                         <span className={`text-[9px] font-bold px-2 py-0.5 rounded border mt-1 ${isDarkMode ? 'text-slate-300 bg-[#1E293B]/5 border-white/5' : 'text-slate-500 bg-slate-50 border-slate-100'}`}>{student.grade}</span>
                      </div>
                   </div>
                ))
             ) : (
                <div className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl w-full h-full shadow-inner ${isDarkMode ? 'border-white/10 bg-[#1E293B]/5' : 'border-slate-200 bg-slate-50'}`}>
                    <p className={`font-bold text-xs text-center ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No historic performance data recorded yet</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
