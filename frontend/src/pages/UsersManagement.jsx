import React, { useEffect, useState } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { ShieldCheck, Users, CheckCircle2, XCircle, Search } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';
import UserIntelligenceModal from '../components/UserIntelligenceModal';
import CustomDropdown from '../components/CustomDropdown';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function UsersManagement() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [notice, setNotice] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { data: usersList = [], isLoading: loading, refetch: fetchUsers } = useQuery({
    queryKey: ['adminUsersList'],
    queryFn: async () => {
      try {
        setErrorMsg(null);
        const { data } = await api.get('/admin/users', { params: { limit: 200 } });
        return data.data || [];
      } catch (err) {
        console.error('Failed to fetch users', err);
        setErrorMsg(err.response?.data?.message || err.message || 'Error occurred fetching users');
        return [];
      }
    }
  });

  const instructorOptions = React.useMemo(() => {
    return usersList
      .filter(u => u.role === 'instructor')
      .map(u => ({ value: u.id, label: u.name }));
  }, [usersList]);

  const parentOptions = React.useMemo(() => {
    return usersList
      .filter(u => u.role === 'parent')
      .map(u => ({ value: u.id, label: u.name }));
  }, [usersList]);

  const sponsorOptions = React.useMemo(() => {
    return usersList
      .filter(u => u.role !== 'student')
      .map(u => ({ value: u.id, label: `${u.name} (${u.role})` }));
  }, [usersList]);

  const updateRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      fetchUsers();
    } catch (err) {
      console.error('Failed to update role', err);
    }
  };

  const updateUserStatus = async (userId, status) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status });
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user status', err);
    }
  };

  const assignInstructor = async (studentId, instructorId) => {
    if (!instructorId) return;
    try {
      await api.put(`/admin/student/${studentId}/assign`, { instructorId });
      fetchUsers();
    } catch (err) {
      console.error('Failed to assign instructor', err);
    }
  };

  const assignParent = async (studentId, parentId) => {
    try {
      await api.put(`/admin/student/${studentId}/assign-parent`, { parentId });
      fetchUsers();
    } catch (err) {
      console.error('Failed to assign parent', err);
    }
  };

  const assignSponsor = async (studentId, sponsorId) => {
    try {
      await api.put(`/admin/student/${studentId}/assign-sponsor`, { sponsorId });
      fetchUsers();
    } catch (err) {
      console.error('Failed to assign sponsor', err);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      const { name, email, password, role } = newUser;
      if (!name || !email || !password) {
        setNotice('Name, email, and password are required.');
        return;
      }
      await api.post('/admin/users', { name, email, password, role });
      setNewUser({ name: '', email: '', password: '', role: 'student' });
      setShowAddForm(false);
      setNotice('User added successfully.');
      fetchUsers();
    } catch (err) {
      console.error('Failed to create user', err);
      setNotice(err.response?.data?.message || 'Could not create user');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete user permanently? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setNotice('User deleted.');
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
      setNotice('Failed to delete user.');
    }
  };

  const resetUserPassword = async (userId) => {
    const tempPassword = `${Math.random().toString(36).slice(-8)}A!`;
    try {
      await api.post(`/admin/users/${userId}/reset-password`, { newPassword: tempPassword });
      window.alert(`Temporary password set: ${tempPassword}`);
    } catch (err) {
      console.error('Failed to reset password', err);
      setNotice('Failed to reset password.');
    }
  };

  const showUserDetails = (user) => {
    setSelectedUser(user);
  };



  const filteredUsers = React.useMemo(() => {
    const query = searchQuery.toLowerCase();
    return usersList.filter(u => {
      const matchesSearch = (u.name || '').toLowerCase().includes(query) || (u.email || '').toLowerCase().includes(query);
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [usersList, searchQuery, roleFilter]);

  return (
    <div className="animate-in fade-in flex flex-col space-y-8 min-h-screen -mx-4 md:-mx-8 lg:-mx-12 -mt-4 md:-mt-8 p-6 md:p-8">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 pt-2 mb-4 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
        <div>
          <h1 className={`text-4xl font-display font-black flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
             <div className="p-2.5 bg-gradient-to-tr from-[#00D4FF]/20 to-[#2563EB]/20 rounded-2xl border border-[#00D4FF]/30">
               <Users className="w-8 h-8 text-[#00D4FF] drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]" />
             </div>
             Global User Management
          </h1>
          <p className={`text-sm mt-3 font-medium flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
             <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse"></span>
             Approve registrations and promote user roles across the platform.
          </p>
        </div>
        <div className="bg-gradient-to-r from-[#00D4FF]/10 to-[#2563EB]/10 px-6 py-3 rounded-2xl text-sm font-black tracking-wide text-[#00D4FF] flex items-center gap-2 border border-[#00D4FF]/30 shadow-[0_0_20px_rgba(0,212,255,0.15)] animate-in slide-in-from-right">
          <ShieldCheck className="w-5 h-5 drop-shadow-md" /> Super Admin Access Active
        </div>
      </div>

      <div className={`rounded-[2.5rem] p-8 border backdrop-blur-2xl shadow-2xl overflow-hidden relative transition-all duration-500 ${isDarkMode ? 'border-white/10 bg-[#0B1120]/80' : 'border-slate-200 bg-white/90 hover:border-[#2563EB]/30'}`}>
         <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#00D4FF]/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen"></div>
         <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#2563EB]/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen"></div>
         
        <div className={`pb-6 border-b flex flex-wrap justify-between items-center gap-4 relative z-10 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
          <div className="relative w-full sm:w-80 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00D4FF] to-[#2563EB] rounded-full opacity-0 group-hover:opacity-30 transition duration-300 blur-sm pointer-events-none"></div>
            <Search className={`w-[18px] h-[18px] absolute left-5 top-1/2 -translate-y-1/2 ml-0.5 z-10 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`} />
            <input 
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full relative z-10 !pl-14 !pr-4 !py-3 border !rounded-full text-sm font-bold outline-none focus:ring-2 focus:ring-[#00D4FF]/50 transition-all shadow-sm placeholder-slate-400 ${isDarkMode ? 'bg-black/60 border-white/10 text-white hover:bg-black/80' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'}`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto mt-3 sm:mt-0">
            <div className={`flex gap-1 p-1.5 rounded-2xl border transition-colors ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              {['all', 'student', 'instructor', 'parent', 'admin'].map(r => (
                <button 
                  key={r} 
                  onClick={() => setRoleFilter(r)} 
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 ${roleFilter === r ? 'bg-gradient-to-r from-[#00D4FF] to-[#2563EB] text-white shadow-[0_5px_15px_rgba(0,212,255,0.3)] scale-105' : isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm'}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddForm((prev) => !prev)}
              className={`group relative overflow-hidden px-6 py-3 rounded-full font-black text-sm shadow-lg transition-all hover:scale-105 border ${showAddForm ? (isDarkMode ? 'bg-slate-700/80 text-white border-white/20 hover:bg-slate-600' : 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300') : 'bg-gradient-to-r from-[#00D4FF] to-[#2563EB] text-white border-white/20 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]'}`}
            >
              {!showAddForm && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>}
              <span className="relative z-10 drop-shadow-md">{showAddForm ? 'Close Interface' : '+ Initialize User'}</span>
            </button>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={createUser} className="mt-6 mb-8 grid grid-cols-1 md:grid-cols-5 gap-4 items-end relative z-10 animate-in slide-in-from-top-4">
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Full name"
              className={`col-span-1 md:col-span-1 !px-5 !py-3 !rounded-full border font-bold text-sm outline-none focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 transition-all shadow-sm ${isDarkMode ? 'bg-black/60 border-white/10 text-white hover:bg-black/80' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'}`}
              required
            />
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email address"
              className={`col-span-1 md:col-span-1 !px-5 !py-3 !rounded-full border font-bold text-sm outline-none focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 transition-all shadow-sm ${isDarkMode ? 'bg-black/60 border-white/10 text-white hover:bg-black/80' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'}`}
              required
            />
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Temporary password"
              className={`col-span-1 md:col-span-1 !px-5 !py-3 !rounded-full border font-bold text-sm outline-none focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 transition-all shadow-sm ${isDarkMode ? 'bg-black/60 border-white/10 text-white hover:bg-black/80' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'}`}
              required
            />
            <CustomDropdown
              value={newUser.role}
              onChange={(val) => setNewUser((prev) => ({ ...prev, role: val }))}
              options={[
                { label: 'Student', value: 'student' },
                { label: 'Parent', value: 'parent' },
                { label: 'Instructor', value: 'instructor' },
                { label: 'Admin', value: 'admin' }
              ]}
              className="col-span-1 md:col-span-1"
            />
            <button
              type="submit"
              className={`col-span-1 md:col-span-1 group relative overflow-hidden px-6 py-3 rounded-full font-black text-sm shadow-lg transition-all hover:scale-105 border border-white/20 bg-gradient-to-r from-[#00D4FF] to-[#2563EB] text-white hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]`}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 drop-shadow-md">Provision User</span>
            </button>
          </form>
        )}

        {notice && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#00D4FF]/10 to-[#2563EB]/10 border border-[#00D4FF]/30 text-[#00D4FF] text-sm font-black tracking-wide flex items-center gap-2 shadow-[0_0_20px_rgba(0,212,255,0.15)] relative z-10">
             <CheckCircle2 className="w-5 h-5 drop-shadow-md" /> {notice}
          </div>
        )}

        <div className="overflow-x-auto relative z-10 custom-scrollbar pb-6">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
                <tr className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'bg-[#0B1120]/40 text-slate-400' : 'bg-slate-100/80 text-slate-500'} border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                  <th className="px-6 py-5 rounded-tl-2xl">User Identity</th>
                  <th className="px-6 py-5">Contact Details</th>
                  <th className="px-6 py-5">Access State</th>
                  <th className="px-6 py-5">Provisioned</th>
                  <th className="px-6 py-5 text-center">Badges</th>
                  <th className="px-6 py-5">Role Tier</th>
                  <th className="px-6 py-5">Network Map</th>
                  <th className="px-6 py-5 rounded-tr-2xl">Admin Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-sm font-bold ${isDarkMode ? 'divide-white/5 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="p-16 text-center">
                      <div className="w-12 h-12 border-4 border-t-[#00D4FF] rounded-full animate-spin mx-auto shadow-[0_0_15px_rgba(0,212,255,0.5)]"></div>
                    </td>
                  </tr>
                ) : errorMsg ? (
                  <tr>
                    <td colSpan="8" className="p-12 text-center text-[#E30A17] font-black tracking-wide drop-shadow-md">System Error: {errorMsg}</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className={`p-12 text-center font-bold italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No users registered matching these parameters.</td>
                  </tr>
                ) : filteredUsers.map((u) => (
                  <tr key={u.id} className={`transition-colors duration-300 ${isDarkMode ? 'hover:bg-[#00D4FF]/5' : 'hover:bg-[#2563EB]/5'}`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                           <UserAvatar user={u} className="w-10 h-10 text-sm shadow-md border border-white/10" />
                           {u.role === 'admin' && <ShieldCheck className="w-4 h-4 text-[#00D4FF] absolute -bottom-1 -right-1 drop-shadow-md bg-[#0B1120] rounded-full" />}
                        </div>
                        <span className={`font-black text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{u.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-5 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{u.email}</td>
                    
                    {/* Status Control */}
                    <td className="px-6 py-5">
                      {u.status === 'pending' ? (
                        <div className="flex gap-2 relative z-10 w-max">
                            <button onClick={() => updateUserStatus(u.id, 'approved')} className="text-[11px] uppercase tracking-wider font-black bg-gradient-to-r from-[#00D4FF]/20 to-[#00D4FF]/10 text-[#00D4FF] hover:from-[#00D4FF]/30 hover:to-[#00D4FF]/20 px-4 py-2 rounded-xl border border-[#00D4FF]/30 transition-all shadow-[0_0_10px_rgba(0,212,255,0.1)] hover:scale-105">Approve</button>
                            <button onClick={() => updateUserStatus(u.id, 'rejected')} className="text-[11px] uppercase tracking-wider font-black bg-gradient-to-r from-[#E30A17]/20 to-[#E30A17]/10 text-[#E30A17] hover:from-[#E30A17]/30 hover:to-[#E30A17]/20 px-4 py-2 rounded-xl border border-[#E30A17]/30 transition-all shadow-[0_0_10px_rgba(227,10,23,0.1)] hover:scale-105">Reject</button>
                        </div>
                      ) : (
                        <span className={`inline-flex w-max items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm border ${
                          u.status === 'approved' ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/30' : 
                          u.status === 'rejected' ? 'bg-[#E30A17]/10 text-[#E30A17] border-[#E30A17]/30' : 
                          'bg-[#0B1120]/20 text-slate-400 border-white/10'
                        }`}>
                          {u.status === 'approved' ? <CheckCircle2 className="w-4 h-4 drop-shadow-sm" /> : u.status === 'rejected' ? <XCircle className="w-4 h-4 drop-shadow-sm" /> : null}
                          {u.status}
                        </span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-5 whitespace-nowrap font-bold">
                      {new Date(u.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>

                    {/* Certificates Info */}
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center items-center">
                        <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-1.5 rounded-full text-[11px] font-black tracking-wider shadow-sm border ${u.certificates && u.certificates.length > 0 ? 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]' : isDarkMode ? 'bg-[#0B1120]/40 text-slate-500 border-slate-700' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                          {u.certificates ? u.certificates.length : 0}
                        </span>
                      </div>
                    </td>
                  
                  {/* Role Control */}
                  <td className="px-6 py-5">
                      {u.id === user?.id ? (
                        <div className="opacity-50 cursor-not-allowed">
                           <CustomDropdown value={u.role} onChange={() => {}} options={[{ label: u.role, value: u.role }]} className="w-36" />
                        </div>
                      ) : (
                        <CustomDropdown
                          value={u.role}
                          onChange={(val) => updateRole(u.id, val)}
                          options={[
                            { label: 'Student', value: 'student' },
                            { label: 'Parent', value: 'parent' },
                            { label: 'Instructor', value: 'instructor' },
                            { label: 'Admin', value: 'admin' }
                          ]}
                          className="w-36 font-bold"
                        />
                      )}
                  </td>

                  {/* Assignment Control */}
                  <td className="px-6 py-5">
                    {u.role === 'student' ? (
                      <div className="flex flex-col gap-2 w-44">
                        <CustomDropdown
                          value={u.assignedInstructor?.id || u.assignedInstructor || ''}
                          onChange={(val) => assignInstructor(u.id, val)}
                          options={instructorOptions}
                          placeholder="Assign Inst..."
                          searchable={true}
                        />
                        <CustomDropdown
                          value={u.parent?.id || u.parentId || ''}
                          onChange={(val) => assignParent(u.id, val)}
                          options={parentOptions}
                          placeholder="Assign Parent..."
                          searchable={true}
                        />
                        {user?.role === 'admin' && (
                          <CustomDropdown
                            value={u.sponsorships?.[0]?.sponsor?.id || ''}
                            onChange={(val) => assignSponsor(u.id, val)}
                            options={sponsorOptions}
                            placeholder="Assign Sponsor..."
                            searchable={true}
                          />
                        )}
                      </div>
                    ) : (
                      <span className={`text-[11px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => resetUserPassword(u.id)} className={`text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-xl border font-black transition-all hover:scale-105 shadow-sm ${isDarkMode ? 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30 hover:bg-[#F97316]/20' : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'}`}>Reset PW</button>
                      <button onClick={() => deleteUser(u.id)} className={`text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-xl border font-black transition-all hover:scale-105 shadow-sm ${isDarkMode ? 'bg-[#E30A17]/10 text-[#E30A17] border-[#E30A17]/30 hover:bg-[#E30A17]/20' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}>Delete</button>
                      <button onClick={() => showUserDetails(u)} className={`text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-xl border font-black transition-all hover:scale-105 shadow-sm ${isDarkMode ? 'bg-gradient-to-r from-[#00D4FF]/10 to-[#2563EB]/10 text-[#00D4FF] border-[#00D4FF]/30 hover:border-[#00D4FF]/50 hover:shadow-[0_0_15px_rgba(0,212,255,0.2)]' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 shadow-sm'}`}>Details</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <UserIntelligenceModal 
          isOpen={!!selectedUser} 
          userId={selectedUser?.id} 
          onClose={() => setSelectedUser(null)} 
          onRefreshUsers={fetchUsers} 
          globalUsersList={usersList} 
        />
      </div>
    </div>
  );
}
