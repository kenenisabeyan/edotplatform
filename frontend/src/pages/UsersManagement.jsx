import React, { useEffect, useState } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { ShieldCheck, Users, CheckCircle2, XCircle, Search } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';
import UserIntelligenceModal from '../components/UserIntelligenceModal';
import CustomDropdown from '../components/CustomDropdown';

export default function UsersManagement() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [notice, setNotice] = useState('');

  const instructorOptions = React.useMemo(() => {
    return usersList
      .filter(u => u.role === 'instructor')
      .map(u => ({ value: u.id, label: u.name }));
  }, [usersList]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setErrorMsg(null);
      const { data } = await api.get('/admin/users');
      setUsersList(data.data || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Error occurred fetching users');
    } finally {
      setLoading(false);
    }
  };

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
    return usersList.filter(u => 
      (u.name || '').toLowerCase().includes(query) || 
      (u.email || '').toLowerCase().includes(query)
    );
  }, [usersList, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className={`text-2xl font-display font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Users className="w-6 h-6 text-[#E30A17]" />
            Global User Management
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
            Approve registrations and promote user roles across the platform.
          </p>
        </div>
        <div className="bg-[#00D4FF]/10 px-4 py-2 rounded-xl text-sm font-bold text-[#00D4FF] flex items-center gap-2 border border-[#00D4FF]/20 shadow-sm">
          <ShieldCheck className="w-4 h-4" /> Super Admin Access Active
        </div>
      </div>

      <div className={`rounded-2xl p-6 border backdrop-blur-xl shadow-lg overflow-hidden ${isDarkMode ? 'border-white/5 bg-[#0B1120]/5' : 'border-slate-100 bg-slate-50'}`}>
        <div className={`pb-4 border-b flex flex-wrap justify-between items-center gap-3 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
          <div className="relative w-full sm:w-72">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`} />
            <input 
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#F97316] transition-shadow placeholder-slate-400 ${isDarkMode ? 'bg-[#0B1120]/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            />
          </div>
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="px-4 py-2 rounded-lg border border-[#F97316]/50 bg-[#F97316]/15 text-[#F97316] font-semibold hover:bg-[#F97316]/30"
          >
            {showAddForm ? 'Close Add User' : 'Add New User'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={createUser} className="mt-4 mb-5 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Full name"
              className={`col-span-1 md:col-span-1 px-3 py-2 rounded-lg border bg-black/10 ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
              required
            />
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email address"
              className={`col-span-1 md:col-span-1 px-3 py-2 rounded-lg border bg-black/10 ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
              required
            />
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Temporary password"
              className={`col-span-1 md:col-span-1 px-3 py-2 rounded-lg border bg-black/10 ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
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
              className={`col-span-1 md:col-span-1 px-4 py-2 rounded-lg font-semibold bg-[#00D4FF] hover:bg-[#00A3CC] shadow-md border border-[#00D4FF] text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
            >
              Create User
            </button>
          </form>
        )}

        {notice && (
          <div className="mb-4 p-3 rounded-lg bg-[#F97316]/15 border border-[#F97316]/25 text-[#F97316] text-sm font-semibold">{notice}</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
                <tr className={`text-sm font-semibold ${isDarkMode ? 'bg-[#0B1120]/5 text-slate-200' : 'bg-slate-50 text-slate-600'}`}>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Role Management</th>
                  <th className="px-6 py-4">Assign Target</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm font-normal">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <div className="w-8 h-8 border-4 border-[#E30A17]/30 border-t-[#E30A17] rounded-full animate-spin mx-auto"></div>
                    </td>
                  </tr>
                ) : errorMsg ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-[#E30A17] font-bold">Error: {errorMsg}</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={`p-8 text-center font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>No users found.</td>
                  </tr>
                ) : filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={u} className="w-8 h-8 text-xs" />
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{u.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-slate-200' : 'text-slate-600'}`}>{u.email}</td>
                    
                    {/* Status Control */}
                    <td className="px-6 py-4">
                      {u.status === 'pending' ? (
                        <div className="flex gap-2 relative z-10 w-max">
                            <button onClick={() => updateUserStatus(u.id, 'approved')} className="text-xs font-bold bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 px-3 py-1.5 rounded-lg border border-[#00D4FF]/20 transition-colors shadow-sm">Approve</button>
                            <button onClick={() => updateUserStatus(u.id, 'rejected')} className="text-xs font-bold bg-[#E30A17]/10 text-[#E30A17] hover:bg-[#E30A17]/20 px-3 py-1.5 rounded-lg border border-[#E30A17]/20 transition-colors shadow-sm">Reject</button>
                        </div>
                      ) : (
                        <span className={`inline-flex w-max items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold   border ${
                          u.status === 'approved' ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20' : 
                          u.status === 'rejected' ? 'bg-[#E30A17]/10 text-[#E30A17] border-[#E30A17]/20' : 
                          'bg-[#0B1120]/5 text-slate-300 border-white/10'
                        }`}>
                          {u.status === 'approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : u.status === 'rejected' ? <XCircle className="w-3.5 h-3.5" /> : null}
                          {u.status}
                        </span>
                      )}
                    </td>
                  
                  {/* Role Control */}
                  <td className="px-6 py-4">
                      {u.id === user?.id ? (
                        <div className="opacity-50 cursor-not-allowed">
                           <CustomDropdown value={u.role} onChange={() => {}} options={[{ label: u.role, value: u.role }]} />
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
                          className="w-32"
                        />
                      )}
                  </td>

                  {/* Assignment Control */}
                  <td className="px-6 py-4">
                    {u.role === 'student' ? (
                      <CustomDropdown
                        value={u.assignedInstructor?.id || u.assignedInstructor || ''}
                        onChange={(val) => assignInstructor(u.id, val)}
                        options={instructorOptions}
                        placeholder="Assign Inst..."
                        searchable={true}
                        className="w-44"
                      />
                    ) : (
                      <span className={`text-sm italic ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => resetUserPassword(u.id)} className="text-xs px-2.5 py-1 rounded-lg bg-orange-500/15 text-yellow-300 hover:bg-orange-500/25 border border-orange-500/20">Reset PW</button>
                      <button onClick={() => deleteUser(u.id)} className="text-xs px-2.5 py-1 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/20">Delete</button>
                      <button onClick={() => showUserDetails(u)} className={`text-xs px-2.5 py-1 rounded-lg backdrop-blur-xl0/15 hover:bg-white/5/40 backdrop-blur-xl0/25 border border-slate-500/20 ${isDarkMode ? 'bg-[#0B1120]/40 text-slate-300' : 'bg-slate-50 text-slate-500'}`}>Details</button>
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
