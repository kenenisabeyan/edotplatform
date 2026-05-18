import React, { useState, useEffect, useRef } from 'react';
import useThemeMode from '../hooks/useThemeMode';
import { 
  Search, Smile, Paperclip, Send, Loader2, ArrowLeft, MoreVertical, Edit, Trash2, Ban, Mic, Menu, Users, PhoneCall, Phone, Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PremiumModal from '../components/PremiumModal';
import { io } from 'socket.io-client';
import AgendaCreationModal from '../components/AgendaCreationModal';
import LiveRoom from './LiveRoom';

const SOCKET_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5005'
  : `${window.location.protocol}//${window.location.hostname}`;

const socket = io(SOCKET_BASE_URL, {
  withCredentials: true
});

export default function MessagesView() {
  const isDarkMode = useThemeMode();
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showLeftMenu, setShowLeftMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [callType, setCallType] = useState('video'); // 'video' or 'audio'
  const [isCalling, setIsCalling] = useState(false);
  const [agendaDefaults, setAgendaDefaults] = useState({});
  const [groupActionLoading, setGroupActionLoading] = useState(false);
  const [activeGroupDetails, setActiveGroupDetails] = useState(null);
  const [livekitSession, setLivekitSession] = useState(null);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [groupSearch, setGroupSearch] = useState('');
  const [groupType, setGroupType] = useState('group'); // group or channel
  
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  
  const [editMessageId, setEditMessageId] = useState(null);
  const [editMessageContent, setEditMessageContent] = useState('');
  const [messageMenuOpenId, setMessageMenuOpenId] = useState(null);

  const isChannelReadOnly = activeContact?.type === 'channel' && activeContact.adminId !== user?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadContacts = async () => {
    try {
      const [contactRes, groupRes] = await Promise.all([
        api.get('/messages/contacts'),
        api.get('/messages/groups')
      ]);

      const users = contactRes.data.success ? contactRes.data.data.map(contact => ({
        ...contact,
        type: 'user',
        unreadCount: contact.unreadCount || 0,
        isOnline: true,
      })) : [];

      const groups = groupRes.data.success ? groupRes.data.data.map(group => ({
        ...group,
        unreadCount: 0,
        isOnline: true,
        type: group.type || (group.isChannel ? 'channel' : 'group'),
        role: group.type === 'channel' ? 'Channel' : 'Group',
      })) : [];

      const allItems = [...groups, ...users];
      setContacts(allItems);
      if (!activeContact && allItems.length > 0) {
        setActiveContact(allItems[0]);
      }
    } catch (err) {
      console.error('Failed to load contacts and groups:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    loadContacts();
    const intervalId = setInterval(loadContacts, 5000);
    return () => clearInterval(intervalId);
  }, [activeContact]);

  const fetchMessages = async (contactId, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const { data } = await api.get(`/messages/conversation/${contactId}`);
      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeContact && user) {
      setContacts(prev => prev.map(c => 
        c.id === activeContact.id ? { ...c, unreadCount: 0 } : c
      ));
      
      fetchMessages(activeContact.id);

      const roomId = activeContact.type === 'group' || activeContact.type === 'channel'
        ? `group_${activeContact.id}`
        : [user.id, activeContact.id].sort().join('_');
      socket.emit('join_room', roomId);

      const receiveMessageHandler = (liveMsg) => {
        setMessages(prev => {
          if (prev.some(m => m.id === liveMsg.id)) return prev;
          return [...prev, liveMsg];
        });
        scrollToBottom();
      };

      socket.on('receive_message', receiveMessageHandler);

      return () => {
        socket.off('receive_message', receiveMessageHandler);
      };
    }
  }, [activeContact, user]);

  useEffect(() => {
    if (activeContact?.type === 'group' || activeContact?.type === 'channel') {
      fetchGroupDetails(activeContact.id);
    } else {
      setActiveGroupDetails(null);
    }
  }, [activeContact]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !activeContact || isChannelReadOnly) return;

    const messageText = newMessage;
    const fileToUpload = selectedFile;
    setNewMessage(''); // optimistic clear
    setSelectedFile(null);

    try {
      let attachmentUrl = null;
      let attachmentType = null;

      if (fileToUpload) {
         const formData = new FormData();
         formData.append('image', fileToUpload); // existing upload route looks for 'image' fieldname
         
         const uploadRes = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
         });

         if (uploadRes.data.success) {
            attachmentUrl = uploadRes.data.filePath;
            attachmentType = fileToUpload.type.startsWith('image/') ? 'image' : 'file';
         }
      }

      const payload = {
        content: messageText,
        attachmentUrl,
        attachmentType
      };

      if (activeContact?.type === 'group' || activeContact?.type === 'channel') {
        payload.groupId = activeContact.id;
      } else {
        payload.receiverId = activeContact.id;
      }

      const { data } = await api.post('/messages', payload);
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        const roomId = activeContact?.type === 'group' || activeContact?.type === 'channel'
          ? `group_${activeContact.id}`
          : [user.id, activeContact.id].sort().join('_');
        socket.emit('send_message', { ...data.data, roomId });
        scrollToBottom();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setNewMessage(messageText);
      setSelectedFile(fileToUpload);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleStartCall = (type) => {
     setCallType(type);
     setShowCallModal(true);
     setIsCalling(true);
     setTimeout(() => setIsCalling(false), 8000); 
  };

  const handleOpenScheduleMeet = () => {
    setAgendaDefaults({
      defaultType: 'meeting',
      defaultTitle: activeContact ? `Meeting with ${activeContact.name}` : 'Schedule Meet',
      contextName: activeContact ? activeContact.name : 'Workspace'
    });
    setShowAgendaModal(true);
  };

  const handleJoinCall = async (targetUserId) => {
     try {
       const { data } = await api.post('/messages/call-token', { targetUserId });
       if (data.success) {
         setLivekitSession({ token: data.token, url: data.livekitUrl, roomName: data.roomName });
       }
     } catch (err) {
       console.error(err);
       alert('Failed to join call');
     }
  };

  const handleSendSMS = async () => {
    if (!activeContact || activeContact.type !== 'user') return;
    const msg = window.prompt('Enter real-life SMS to send:');
    if (!msg) return;
    
    const phone = window.prompt('Enter destination phone number (e.g., +1234567890):', '+1');
    if (!phone) return;

    try {
       const { data } = await api.post('/messages/sms', { phone, message: msg });
       if (data.success) {
          alert(data.message);
       }
    } catch (err) {
       alert('SMS Gateway Error');
    }
  };

  const fetchGroupDetails = async (groupId) => {
    if (!groupId) {
      setActiveGroupDetails(null);
      return;
    }

    try {
      const { data } = await api.get(`/messages/groups/${groupId}`);
      if (data.success) {
        setActiveGroupDetails(data.data);
      }
    } catch (err) {
      console.error('Failed to load group details:', err);
      setActiveGroupDetails(null);
    }
  };

  const handleLeaveGroup = async () => {
    if (!activeContact) return;
    const confirmText = activeContact.type === 'channel' ? 'Leave this channel?' : 'Leave this group?';
    const confirmed = window.confirm(confirmText);
    if (!confirmed) return;

    setGroupActionLoading(true);
    try {
      const res = await api.post(`/messages/groups/${activeContact.id}/leave`);
      if (res.data.success) {
        alert(res.data.message);
        await loadContacts();
        setActiveContact(null);
        setActiveGroupDetails(null);
      }
    } catch (err) {
      console.error('Failed to leave group:', err);
      alert('Unable to leave the group/channel.');
    } finally {
      setGroupActionLoading(false);
    }
  };

  const handleRemoveGroupMember = async (memberId) => {
    if (!activeContact || !memberId) return;
    const confirmed = window.confirm('Remove this participant from the group?');
    if (!confirmed) return;

    setGroupActionLoading(true);
    try {
      const res = await api.delete(`/messages/groups/${activeContact.id}/members/${memberId}`);
      if (res.data.success) {
        alert(res.data.message);
        await fetchGroupDetails(activeContact.id);
      }
    } catch (err) {
      console.error('Failed to remove member:', err);
      alert('Unable to remove member from this chat.');
    } finally {
      setGroupActionLoading(false);
    }
  };

  const handleToggleGroupMember = (contact) => {
    setSelectedGroupMembers(prev => {
      if (prev.some(member => member.id === contact.id)) {
        return prev.filter(member => member.id !== contact.id);
      }
      return [...prev, contact];
    });
  };

  const resetGroupForm = () => {
    setNewGroupName('');
    setNewGroupDescription('');
    setSelectedGroupMembers([]);
    setGroupSearch('');
    setGroupType('group');
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      alert('Group name is required');
      return;
    }

    if (groupType === 'group' && selectedGroupMembers.length === 0) {
      alert('Please select at least one participant for the group.');
      return;
    }

    try {
      const res = await api.post('/messages/groups', {
        name: newGroupName.trim(),
        description: newGroupDescription.trim(),
        isChannel: groupType === 'channel',
        memberIds: selectedGroupMembers.map(member => member.id)
      });
      if (res.data.success) {
        const createdGroup = res.data.data;
        await loadContacts();
        setShowGroupModal(false);
        resetGroupForm();
        setActiveContact({
          id: createdGroup.id,
          name: createdGroup.name,
          type: createdGroup.isChannel ? 'channel' : 'group',
          isChannel: createdGroup.isChannel,
          adminId: createdGroup.adminId,
          role: createdGroup.isChannel ? 'Channel' : 'Group'
        });
        alert("Group Successfully Created!");
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create group');
    }
  };

  const loadBlockedUsers = async () => {
    try {
      const res = await api.get('/messages/blocked');
      if (res.data.success) {
        setBlockedUsers(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load blocked users', err);
    }
  };

  useEffect(() => {
    if (activeContact) {
      setIsBlocked(blockedUsers.some(blocked => blocked.id === activeContact.id));
    }
  }, [activeContact, blockedUsers]);

  const handleBlockUser = async (targetId = null) => {
    const userId = targetId || activeContact?.id;
    if (!userId) return;
    try {
      const res = await api.post(`/messages/block/${userId}`);
      if (res.data.success) {
        setIsBlocked(res.data.isBlocked);
        if (showBlockedModal) await loadBlockedUsers();
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating block status");
    }
  };

  const handleEditMessage = (message) => {
    setEditMessageId(message.id);
    setEditMessageContent(message.content);
    setMessageMenuOpenId(null);
  };

  const handleCancelEdit = () => {
    setEditMessageId(null);
    setEditMessageContent('');
  };

  const handleUpdateMessage = async (e) => {
    e.preventDefault();
    if (!editMessageId || !editMessageContent.trim()) return;
    try {
      const res = await api.put(`/messages/${editMessageId}`, {
        content: editMessageContent.trim()
      });
      if (res.data.success) {
        setMessages(prev => prev.map(msg => msg.id === editMessageId ? { ...msg, content: editMessageContent.trim() } : msg));
        setEditMessageId(null);
        setEditMessageContent('');
      }
    } catch (err) {
      console.error('Failed to update message', err);
      alert('Unable to edit message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!messageId) return;
    const confirmed = window.confirm('Delete this message for everyone?');
    if (!confirmed) return;
    try {
      const res = await api.delete(`/messages/${messageId}`);
      if (res.data.success) {
        setMessages(prev => prev.filter(message => message.id !== messageId));
        setMessageMenuOpenId(null);
      }
    } catch (err) {
      console.error('Failed to delete message', err);
      alert('Unable to delete message');
    }
  };

  const groupableContacts = contacts.filter(contact => contact.type === 'user' && contact.id !== user?.id);
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [activeTab, setActiveTab] = useState('All');

  const filteredByTab = filteredContacts.filter(c => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Groups') return c.type === 'group';
    if (activeTab === 'Channels') return c.type === 'channel';
    if (activeTab === 'Direct') return c.type === 'user';
    return true;
  });

  return (
    <div className="h-[calc(100vh-88px)] md:h-[calc(100vh-88px)] flex flex-col md:-mx-8 lg:-mx-12 -mt-4 md:-mt-8 -mb-4 md:-mb-8 -mx-4 font-sans bg-[#F8FAFC]">
      <div className={`flex-1 flex h-full relative overflow-hidden ${isDarkMode ? 'bg-[#0B1120]' : 'bg-[#F8FAFC]'}`}>
         
         {/* Left Sidebar - Chat List */}
         <div className={`w-full md:w-[340px] flex-col shrink-0 z-10 ${activeContact ? 'hidden md:flex' : 'flex'} ${isDarkMode ? 'bg-[#0B1120] border-r border-white/5' : 'bg-white border-r border-slate-200'}`}>
           {/* Sidebar Header */}
           <div className={`pt-4 px-4 pb-2 flex flex-col gap-4 bg-transparent`}>
             <div className="flex items-center gap-3">
               <button onClick={() => setShowLeftMenu(prev => !prev)} className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all ${isDarkMode ? 'text-slate-300 hover:bg-[#1E293B]' : 'text-slate-600'}`}>
                  <Menu className="w-5 h-5" />
               </button>
               <div className="relative flex-1">
                 <input 
                   type="text" 
                   placeholder="Search messages..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className={`w-full !pl-14 !pr-4 !py-2.5 !rounded-full border text-[14px] focus:outline-none transition-all ${isDarkMode ? 'bg-[#1E293B] border-white/10 text-white placeholder-slate-400 focus:border-[#00D4FF]' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/20'}`}
                 />
                 <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] ml-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
               </div>
               
               {showLeftMenu && (
                 <div className={`absolute left-4 top-16 w-64 rounded-2xl shadow-2xl py-2 z-50 border ${isDarkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white border-slate-200'}`}>
                   <button onClick={() => {
                      resetGroupForm(); setGroupType('group'); setNewGroupName('New Study Group'); setShowGroupModal(true); setShowLeftMenu(false);
                   }} className={`w-full text-left px-4 py-3 flex items-center gap-3 text-[14px] font-medium transition-colors ${isDarkMode ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}><Users className="w-4 h-4 text-[#00D4FF]" /> New Group</button>
                   <button onClick={() => {
                      resetGroupForm(); setGroupType('channel'); setNewGroupName('New Announcement Channel'); setShowGroupModal(true); setShowLeftMenu(false);
                   }} className={`w-full text-left px-4 py-3 flex items-center gap-3 text-[14px] font-medium transition-colors ${isDarkMode ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}><Users className="w-4 h-4 text-[#00D4FF]" /> New Channel</button>
                   <div className="h-px bg-slate-200 dark:bg-white/5 my-1"></div>
                   <button onClick={() => { handleOpenScheduleMeet(); setShowLeftMenu(false); }} className={`w-full text-left px-4 py-3 flex items-center gap-3 text-[14px] font-medium transition-colors ${isDarkMode ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}><PhoneCall className="w-4 h-4 text-green-500" /> Meetings & Calls</button>
                 </div>
               )}
             </div>
             
             {/* Tabs */}
             <div className="flex items-center justify-between px-1">
               {['All', 'Groups', 'Channels', 'Direct'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`relative pb-2 text-[13px] font-semibold transition-colors ${activeTab === tab ? (isDarkMode ? 'text-[#00D4FF]' : 'text-[#00D4FF]') : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')}`}
                 >
                   {tab}
                   {activeTab === tab && (
                     <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#00D4FF] rounded-t-full"></span>
                   )}
                 </button>
               ))}
             </div>
           </div>
           
           {/* Contact List */}
           <div className="flex-1 overflow-y-auto custom-scrollbar">
             {loadingContacts ? (
               <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[#00D4FF]" /></div>
             ) : filteredByTab.length === 0 ? (
               <div className="text-center p-8 text-slate-500 text-sm font-medium">No conversations found.</div>
             ) : (
               filteredByTab.map(contact => (
                 <div 
                   key={contact.id} 
                   onClick={() => setActiveContact(contact)}
                   className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors relative ${activeContact?.id === contact.id ? (isDarkMode ? 'bg-[#1E293B]' : 'bg-[#E0F2FE]/50') : (isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50')} ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                 >
                   {activeContact?.id === contact.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#00D4FF] rounded-r-full"></div>
                   )}
                   <div className="relative ml-2">
                     <div className={`p-[2px] rounded-full shadow-sm shrink-0 bg-gradient-to-tr from-[#4ade80] via-[#fb923c] to-[#facc15]`}>
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden border-[3px] ${isDarkMode ? 'border-[#0B1120] bg-[#1E293B] text-[#00D4FF]' : 'border-white bg-[#E0F2FE] text-[#007AFF]'}`}>
                         {contact.avatar && contact.avatar !== 'default-avatar.png' ? (
                            <img src={contact.avatar?.startsWith('http') ? contact.avatar : `http://localhost:5000${contact.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                         ) : (
                            contact.name.charAt(0).toUpperCase()
                         )}
                       </div>
                     </div>
                     {contact.isOnline && contact.type === 'user' && <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 rounded-full z-10 ${isDarkMode ? 'border-[#0B1120]' : 'border-white'}`}></div>}
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-center mb-0.5">
                       <h4 className={`font-semibold text-[15px] truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{contact.name}</h4>
                       <span className={`text-[11px] font-medium ${contact.unreadCount > 0 ? 'text-[#007AFF]' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                         Today
                       </span>
                     </div>
                     <div className="flex justify-between items-center">
                       <p className={`text-[13px] truncate pr-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                         {contact.role === 'Channel' ? 'Announcement Channel' : contact.role === 'Group' ? 'Group Chat' : contact.role || 'User'}
                       </p>
                       {contact.unreadCount > 0 && (
                         <span className="bg-[#007AFF] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shrink-0">
                           {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                         </span>
                       )}
                     </div>
                  </div>
                 </div>
               ))
             )}
           </div>
         </div>

         {/* Right Area - Chat Interface */}
         <div className={`flex-1 flex flex-col relative z-10 ${activeContact ? 'flex' : 'hidden md:flex'} ${isDarkMode ? 'bg-[#0B1120]' : 'bg-[#F8FAFC]'}`}>
            
            {/* Minimal Background Pattern for Chat Area */}
            <div className={`absolute inset-0 z-0 pointer-events-none ${isDarkMode ? 'opacity-[0.02]' : 'opacity-[0.03]'}`} style={{backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>
            
            {!activeContact ? (
              <div className={`flex-1 flex flex-col items-center justify-center relative z-10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <div className="w-20 h-20 mb-4 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-800">
                  <span className="text-3xl">💬</span>
                </div>
                <h2 className="text-xl font-semibold mb-1">Select a chat to start messaging</h2>
                <p className="text-sm text-slate-500">Connect with your network and collaborate seamlessly.</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className={`h-[68px] border-b flex justify-between items-center px-4 md:px-6 shrink-0 z-20 ${isDarkMode ? 'border-white/5 bg-[#1E293B]' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setActiveContact(null)}
                      className={`md:hidden p-2 rounded-full transition-colors flex items-center justify-center ${isDarkMode ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="relative cursor-pointer">
                      <div className={`p-[2px] rounded-full shrink-0 bg-gradient-to-tr from-[#4ade80] via-[#fb923c] to-[#facc15]`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[15px] shrink-0 overflow-hidden border-[2.5px] ${isDarkMode ? 'border-[#1E293B] bg-[#1E293B] text-[#00D4FF]' : 'border-white bg-[#E0F2FE] text-[#007AFF]'}`}>
                          {activeContact.avatar && activeContact.avatar !== 'default-avatar.png' ? (
                            <img src={activeContact.avatar?.startsWith('http') ? activeContact.avatar : `http://localhost:5000${activeContact.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            activeContact.name.charAt(0).toUpperCase()
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="cursor-pointer" onClick={() => activeContact?.type !== 'user' && setShowMembersModal(true)}>
                      <h3 className={`font-semibold text-[15px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{activeContact.name}</h3>
                      {activeContact.type === 'group' || activeContact.type === 'channel' ? (
                        <p className={`text-[12px] ${isDarkMode ? 'text-[#00D4FF]' : 'text-[#007AFF]'}`}>
                           {activeGroupDetails?.members?.length || 1} members
                           <span className="text-slate-400 mx-1">•</span> 
                           <span className="text-slate-400">{activeContact.type === 'channel' ? 'Announcement Channel' : 'Group Chat'}</span>
                        </p>
                      ) : (
                        <p className={`text-[12px] ${activeContact?.isOnline ? (isDarkMode ? 'text-[#00D4FF]' : 'text-[#007AFF]') : 'text-slate-400'}`}>
                           {activeContact?.isOnline ? 'Online' : 'Offline'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <button onClick={handleSendSMS} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`} title="Send Real SMS"><Smile className="w-5 h-5 text-green-500" /></button>
                    <button onClick={() => handleStartCall('audio')} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}><Phone className="w-5 h-5" /></button>
                    <button onClick={() => handleStartCall('video')} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}><Video className="w-5 h-5" /></button>
                    <button className={`w-10 h-10 hidden sm:flex items-center justify-center rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}><Search className="w-5 h-5" /></button>
                    <div className="relative">
                      <button onClick={() => setShowMoreMenu(prev => !prev)} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {showMoreMenu && (
                        <div className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border overflow-hidden z-[100] ${isDarkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white border-slate-200'}`}>
                          <button onClick={() => { handleOpenScheduleMeet(); setShowMoreMenu(false); }} className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 text-[14px] ${isDarkMode ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}><PhoneCall className="w-4 h-4 text-green-500" /> Schedule Meet</button>
                          {activeContact?.type !== 'user' && (
                            <>
                              <button onClick={() => { setShowMembersModal(true); setShowMoreMenu(false); }} className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 text-[14px] ${isDarkMode ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}><Users className="w-4 h-4 text-blue-500" /> Manage Members</button>
                              <button onClick={() => { handleLeaveGroup(); setShowMoreMenu(false); }} className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 text-[14px] ${isDarkMode ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}><ArrowLeft className="w-4 h-4 text-red-500" /> {activeContact?.adminId === user?.id ? 'Leave or Transfer' : 'Leave Chat'}</button>
                            </>
                          )}
                          {activeContact?.type === 'user' && (
                             <button onClick={() => { setShowPrivacyModal(true); setShowMoreMenu(false); }} className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 text-[14px] ${isDarkMode ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}><Ban className="w-4 h-4 text-red-500" /> Block User</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chat Bubbles Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 relative z-10 flex flex-col gap-4 custom-scrollbar">
                  {loadingMessages ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[#00D4FF]" /></div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full mt-10 opacity-70">
                       <div className={`rounded-full w-16 h-16 flex items-center justify-center mb-4 ${isDarkMode ? 'bg-[#1E293B]' : 'bg-slate-200'}`}>
                          <span className="text-2xl">👋</span>
                       </div>
                       <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Say hello and start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMine = msg.senderId === user?.id;
                      const timeString = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const showAvatar = !isMine && (idx === 0 || messages[idx-1].senderId !== msg.senderId);

                      return (
                        <div key={msg.id || idx} className={`flex w-full items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                          
                          {!isMine && (
                            <div className="w-8 h-8 shrink-0 flex items-end">
                               {showAvatar && (
                                <div className={`p-[1.5px] rounded-full shrink-0 bg-gradient-to-tr from-[#4ade80] via-[#fb923c] to-[#facc15]`}>
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] overflow-hidden border-2 ${isDarkMode ? 'border-[#0B1120] bg-[#1E293B] text-[#00D4FF]' : 'border-[#F8FAFC] bg-[#E0F2FE] text-[#007AFF]'}`}>
                                    {msg.sender?.avatar && msg.sender.avatar !== 'default-avatar.png' ? (
                                      <img src={msg.sender?.avatar?.startsWith('http') ? msg.sender.avatar : `http://localhost:5000${msg.sender.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                      (msg.sender?.name || activeContact.name).charAt(0).toUpperCase()
                                    )}
                                  </div>
                                </div>
                               )}
                            </div>
                          )}

                          <div className={`flex flex-col max-w-[85%] md:max-w-[65%] ${isMine ? 'items-end' : 'items-start'}`}>
                            {/* Message Bubble Telegram Style */}
                            <div className={`px-4 py-2.5 text-[15px] leading-relaxed relative shadow-sm ${isMine ? (isDarkMode ? 'bg-[#00D4FF]/20 border border-[#00D4FF]/30 text-white rounded-[20px] rounded-br-[4px]' : 'bg-[#E0F2FE] text-slate-900 rounded-[20px] rounded-br-[4px]') : (isDarkMode ? 'bg-[#1E293B] text-white rounded-[20px] rounded-bl-[4px]' : 'bg-white text-slate-900 rounded-[20px] rounded-bl-[4px] border border-slate-100')}`} style={{ wordBreak: 'break-word' }}>
                              
                              {/* Group sender name if applicable */}
                              {!isMine && showAvatar && (activeContact.type === 'group' || activeContact.type === 'channel') && (
                                <p className={`text-[13px] font-semibold mb-1 ${isDarkMode ? 'text-[#00D4FF]' : 'text-[#007AFF]'}`}>
                                   {msg.sender?.name || 'User'}
                                </p>
                              )}

                              <button onClick={() => setMessageMenuOpenId(prev => prev === msg.id ? null : msg.id)} className={`absolute top-2 ${isMine ? '-left-8' : '-right-8'} w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {messageMenuOpenId === msg.id && (
                                <div className={`absolute top-8 ${isMine ? 'right-0' : 'left-0'} w-36 border rounded-xl shadow-xl z-40 overflow-hidden ${isDarkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white border-slate-200'}`}>
                                  {isMine && <button onClick={() => handleEditMessage(msg)} className={`w-full text-left px-3 py-2 transition-colors flex items-center gap-2 text-[13px] ${isDarkMode ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}> <Edit className="w-4 h-4" /> Edit</button>}
                                  {(isMine || user?.role === 'admin') && <button onClick={() => handleDeleteMessage(msg.id)} className={`w-full text-left px-3 py-2 transition-colors flex items-center gap-2 text-[13px] ${isDarkMode ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}> <Trash2 className="w-4 h-4 text-red-500" /> Delete</button>}
                                </div>
                              )}
                              
                              {msg.attachmentUrl && msg.attachmentType === 'image' && (
                                <div className="mb-2 max-w-[280px] md:max-w-[340px] rounded-xl overflow-hidden mt-1">
                                   <img src={msg.attachmentUrl?.startsWith('http') ? msg.attachmentUrl : `http://localhost:5000${msg.attachmentUrl}`} alt="Attachment" className="w-full h-auto object-cover cursor-pointer" />
                                </div>
                              )}
                              {msg.attachmentUrl && msg.attachmentType === 'file' && (
                                <a href={msg.attachmentUrl?.startsWith('http') ? msg.attachmentUrl : `http://localhost:5000${msg.attachmentUrl}`} target="_blank" rel="noreferrer" className={`flex items-center gap-3 mb-2 p-2.5 rounded-full transition-all ${isMine ? (isDarkMode ? 'bg-black/20' : 'bg-blue-100/50') : (isDarkMode ? 'bg-white/5' : 'bg-slate-50')}`}>
                                   <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isMine ? (isDarkMode ? 'bg-[#00D4FF]/30 text-[#00D4FF]' : 'bg-blue-200 text-blue-600') : (isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-600')}`}>
                                      <Paperclip className="w-5 h-5" />
                                   </div>
                                   <div className="flex-1 min-w-0 pr-2">
                                      <p className="text-[14px] font-medium truncate">File Attachment</p>
                                   </div>
                                </a>
                              )}

                              {editMessageId === msg.id ? (
                                <form onSubmit={handleUpdateMessage} className="mt-1">
                                  <textarea
                                    value={editMessageContent}
                                    onChange={(e) => setEditMessageContent(e.target.value)}
                                    className={`w-full min-w-[200px] min-h-[60px] resize-none !rounded-[32px] !px-4 py-2 text-sm focus:outline-none ${isDarkMode ? 'bg-black/20 text-white' : 'bg-white text-slate-900 border border-slate-200'}`}
                                  />
                                  <div className="flex justify-end gap-2 mt-2">
                                    <button type="button" onClick={handleCancelEdit} className="text-xs font-semibold opacity-80">Cancel</button>
                                    <button type="submit" className="text-xs font-semibold">Save</button>
                                  </div>
                                </form>
                              ) : (
                                <div className="flex items-end gap-3 flex-wrap">
                                  <span className="whitespace-pre-wrap">{msg.content}</span>
                                  {msg.content.includes('📞 Incoming') && (
                                    <button onClick={() => handleJoinCall(isMine ? msg.receiverId : msg.senderId)} className={`ml-2 px-3 py-1 text-xs rounded-full bg-green-500 text-white font-bold hover:bg-green-600 transition-colors`}>
                                      Join Call
                                    </button>
                                  )}
                                  <div className="flex items-center gap-1 ml-auto mt-1 shrink-0">
                                    <span className={`text-[10px] font-medium ${isMine ? (isDarkMode ? 'text-[#00D4FF]' : 'text-blue-500') : (isDarkMode ? 'text-slate-400' : 'text-slate-400')}`}>
                                      {timeString}
                                    </span>
                                    {isMine && (
                                      <span className={`text-[14px] leading-none ${msg.isRead ? 'text-[#007AFF]' : (isDarkMode ? 'text-[#00D4FF]' : 'text-blue-400')}`}>
                                        {msg.isRead ? '✓✓' : '✓'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Modern Chat Composer */}
                <form onSubmit={handleSendMessage} className={`p-4 bg-transparent shrink-0 z-20 flex flex-col items-center ${isDarkMode ? 'bg-[#0B1120]' : 'bg-[#F8FAFC]'}`}>
                  
                  {selectedFile && (
                     <div className={`w-full max-w-4xl rounded-2xl p-3 flex items-center justify-between mb-2 shadow-sm ${isDarkMode ? 'bg-[#1E293B] border border-white/10' : 'bg-white border border-slate-200'}`}>
                        <div className="flex items-center gap-3 min-w-0">
                           <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden ${isDarkMode ? 'bg-[#0B1120]' : 'bg-slate-100'}`}>
                              {selectedFile.type.startsWith('image/') ? (
                                  <img src={URL.createObjectURL(selectedFile)} alt="preview" className="w-full h-full object-cover" />
                              ) : (
                                  <Paperclip className="w-5 h-5 text-slate-500" />
                              )}
                           </div>
                           <div className="min-w-0">
                             <p className={`text-[13px] font-medium truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedFile.name}</p>
                           </div>
                        </div>
                        <button type="button" onClick={() => setSelectedFile(null)} className={`w-8 h-8 flex items-center justify-center rounded-full ${isDarkMode ? 'bg-white/10 hover:bg-red-500/20 text-slate-300' : 'bg-slate-100 hover:bg-red-50 text-slate-500'}`}>✕</button>
                     </div>
                  )}

                  <div className={`flex items-end gap-2 p-2.5 w-full max-w-4xl shadow-md transition-all duration-300 ${isDarkMode ? 'bg-[#1E293B] border border-white/20 rounded-full' : 'bg-[#F8FAFC] border border-slate-300 rounded-full'}`}>
                      <button type="button" className={`p-2 rounded-full-full transition-colors shrink-0 outline-none self-end mb-0.5 ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}><Smile className="w-6 h-6" /></button>
                      <textarea 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                        placeholder={isChannelReadOnly ? "Only channel admins may post here." : "Type a message or paste code/links here..."} 
                        rows={1}
                        disabled={isChannelReadOnly}
                        className={`flex-1 border transition-all duration-200 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/20 text-[15px] font-medium !py-3 !px-4 placeholder-slate-400 min-w-0 resize-none max-h-36 overflow-auto custom-scrollbar leading-[1.4] disabled:cursor-not-allowed ${isDarkMode ? 'bg-[#0B1120] border-white/10 text-white !rounded-full' : 'bg-white border-slate-200 text-slate-800 !rounded-full'}`}
                      />
                      <div className="flex items-center gap-1 self-end mb-0.5">
                        <button type="button" disabled={isChannelReadOnly} onClick={() => fileInputRef.current?.click()} className={`p-2 rounded-full transition-colors shrink-0 outline-none ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}>
                           <Paperclip className="w-5 h-5" />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        {(newMessage.trim() || selectedFile) && !isChannelReadOnly ? (
                          <button type="submit" className="w-[44px] h-[44px] rounded-full transition-all flex items-center justify-center shrink-0 outline-none bg-[#00D4FF] hover:bg-[#00bfe6] text-slate-900 shadow-md ml-1 hover:shadow-lg">
                            <Send className="w-[20px] h-[20px] ml-1" />
                          </button>
                        ) : (
                          <button type="button" disabled={isChannelReadOnly} className={`w-[44px] h-[44px] rounded-full transition-all flex items-center justify-center shrink-0 outline-none ${isChannelReadOnly ? 'opacity-50 cursor-not-allowed' : ''} bg-[#00D4FF] hover:bg-[#00bfe6] text-slate-900 shadow-md ml-1 hover:shadow-lg`}>
                            <Mic className="w-[22px] h-[22px]" />
                          </button>
                        )}
                      </div>
                  </div>
                </form>
              </>
            )}
         </div>
      </div>
      
      {/* Existing Modals and logic handlers rendered below... */}
      {showAgendaModal && (
        <AgendaCreationModal 
           isOpen={showAgendaModal}
           defaultType={agendaDefaults.defaultType}
           defaultTitle={agendaDefaults.defaultTitle}
           contextName={agendaDefaults.contextName}
           onClose={() => setShowAgendaModal(false)}
           onAgendaCreated={(evt) => {
              setShowAgendaModal(false);
              if (!activeContact) return;
              const payload = { content: `📅 I have scheduled a meet: "${evt.title}". Please check your calendar.` };
              if (activeContact?.type === 'group' || activeContact?.type === 'channel') { payload.groupId = activeContact.id; }
              else { payload.receiverId = activeContact.id; }
              api.post('/messages', payload).then(res => {
                 if (res.data.success) {
                    setMessages(prev => [...prev, res.data.data]);
                    const roomId = activeContact?.type === 'group' || activeContact?.type === 'channel' ? `group_${activeContact.id}` : [user.id, activeContact.id].sort().join('_');
                    socket.emit('send_message', { ...res.data.data, roomId });
                    scrollToBottom();
                 }
              });
           }}
        />
      )}
      
      {/* Call Modal */}
      <PremiumModal isOpen={showCallModal} onClose={() => setShowCallModal(false)} maxWidth="max-w-sm">
                 <div className="flex flex-col w-full h-full p-6 md:p-8">
                 {/* Brand Background Decorative Elements */}
                 <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#00D4FF]/10 to-transparent pointer-events-none z-0"></div>
                 <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00D4FF]/20 blur-[80px] pointer-events-none z-0"></div>
                 <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#00D4FF]/20 blur-[80px] pointer-events-none z-0"></div>

               <div className="p-8 flex flex-col items-center relative z-10">
                  <div className={`p-[3px] rounded-full mb-6 bg-gradient-to-tr from-[#4ade80] via-[#fb923c] to-[#facc15]`}>
                     <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold overflow-hidden relative border-4 ${isDarkMode ? 'border-[#1E293B] bg-[#0B1120] text-[#00D4FF]' : 'border-white bg-[#E0F2FE] text-[#007AFF]'}`}>
                        {activeContact?.avatar && activeContact.avatar !== 'default-avatar.png' ? (
                           <img src={activeContact.avatar?.startsWith('http') ? activeContact.avatar : `http://localhost:5000${activeContact.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                           activeContact?.name.charAt(0).toUpperCase()
                        )}
                     </div>
                  </div>
                  <h3 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{activeContact?.name}</h3>
                  <p className="text-[#00D4FF] text-sm font-semibold mb-10">
                     {isCalling ? `Dialing ${callType}...` : 'No Answer'}
                  </p>
                  
                  <div className="flex items-center gap-6">
                     <button className="w-14 h-14 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center transition-colors">
                        {callType === 'video' ? <Video className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                     </button>
                     <button onClick={() => setShowCallModal(false)} className="w-16 h-16 bg-red-500 text-white hover:bg-red-600 rounded-full flex items-center justify-center transition-all hover:scale-105">
                        <Phone className="w-7 h-7 rotate-[135deg]" />
                     </button>
                  </div>
               </div>
                 </div>
      </PremiumModal>
      {/* LiveKit Room Modal */}
      {livekitSession && (
        <LiveRoom 
          token={livekitSession.token} 
          url={livekitSession.url} 
          roomName={livekitSession.roomName} 
          onClose={() => setLivekitSession(null)} 
        />
      )}
    </div>
  );
}

