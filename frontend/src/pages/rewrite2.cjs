const fs = require('fs');

const filePath = 'c:/Users/kenenisa/Documents/futurelearning/frontend/src/pages/MessagesView.jsx';
const content = fs.readFileSync(filePath, 'utf-8');

const splitMarker = '  const groupableContacts = contacts.filter(contact => contact.type === \\\'user\\\' && contact.id !== user?.id);\n  const filteredContacts = contacts.filter(c => \n    c.name.toLowerCase().includes(searchQuery.toLowerCase())\n  );\n\n  return (';

const lastReturnIndex = content.lastIndexOf('  return (');

if (lastReturnIndex === -1) {
    console.error("Could not find '  return (' in the file.");
    process.exit(1);
}

const logicPart = content.substring(0, lastReturnIndex);

const newReturnBlock = `  const [activeTab, setActiveTab] = useState('All');

  const filteredByTab = filteredContacts.filter(c => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Groups') return c.type === 'group';
    if (activeTab === 'Channels') return c.type === 'channel';
    if (activeTab === 'Direct') return c.type === 'user';
    return true;
  });

  return (
    <div className="h-[calc(100vh-88px)] md:h-[calc(100vh-88px)] flex flex-col md:-mx-8 lg:-mx-12 -mt-4 md:-mt-8 -mb-4 md:-mb-8 -mx-4 font-sans bg-[#F8FAFC]">
      <div className={\`flex-1 flex h-full relative overflow-hidden \${isDarkMode ? 'bg-[#0B1120]' : 'bg-[#F8FAFC]'}\`}>
         
         {/* Left Sidebar - Chat List */}
         <div className={\`w-full md:w-[340px] flex-col shrink-0 z-10 \${activeContact ? 'hidden md:flex' : 'flex'} \${isDarkMode ? 'bg-[#0B1120] border-r border-white/5' : 'bg-white border-r border-slate-200'}\`}>
           {/* Sidebar Header */}
           <div className={\`pt-4 px-4 pb-2 flex flex-col gap-4 bg-transparent\`}>
             <div className="flex items-center gap-3">
               <button onClick={() => setShowLeftMenu(prev => !prev)} className={\`w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all \${isDarkMode ? 'text-slate-300 hover:bg-[#1E293B]' : 'text-slate-600'}\`}>
                  <Menu className="w-5 h-5" />
               </button>
               <div className="relative flex-1">
                 <input 
                   type="text" 
                   placeholder="Search messages..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className={\`w-full pl-10 pr-4 py-2.5 rounded-full text-[14px] focus:outline-none transition-all \${isDarkMode ? 'bg-[#1E293B] text-white placeholder-slate-400' : 'bg-slate-100 text-slate-900 placeholder-slate-500'}\`}
                 />
                 <Search className={\`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`} />
               </div>
               
               {showLeftMenu && (
                 <div className={\`absolute left-4 top-16 w-64 rounded-2xl shadow-2xl py-2 z-50 border \${isDarkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white border-slate-200'}\`}>
                   <button onClick={() => {
                      resetGroupForm(); setGroupType('group'); setNewGroupName('New Study Group'); setShowGroupModal(true); setShowLeftMenu(false);
                   }} className={\`w-full text-left px-4 py-3 flex items-center gap-3 text-[14px] font-medium transition-colors \${isDarkMode ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}\`}><Users className="w-4 h-4 text-[#00D4FF]" /> New Group</button>
                   <button onClick={() => {
                      resetGroupForm(); setGroupType('channel'); setNewGroupName('New Announcement Channel'); setShowGroupModal(true); setShowLeftMenu(false);
                   }} className={\`w-full text-left px-4 py-3 flex items-center gap-3 text-[14px] font-medium transition-colors \${isDarkMode ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}\`}><Users className="w-4 h-4 text-[#00D4FF]" /> New Channel</button>
                   <div className="h-px bg-slate-200 dark:bg-white/5 my-1"></div>
                   <button onClick={() => { handleOpenScheduleMeet(); setShowLeftMenu(false); }} className={\`w-full text-left px-4 py-3 flex items-center gap-3 text-[14px] font-medium transition-colors \${isDarkMode ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}\`}><PhoneCall className="w-4 h-4 text-green-500" /> Meetings & Calls</button>
                 </div>
               )}
             </div>
             
             {/* Tabs */}
             <div className="flex items-center justify-between px-1">
               {['All', 'Groups', 'Channels', 'Direct'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={\`relative pb-2 text-[13px] font-semibold transition-colors \${activeTab === tab ? (isDarkMode ? 'text-[#00D4FF]' : 'text-[#00D4FF]') : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')}\`}
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
                   className={\`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors relative \${activeContact?.id === contact.id ? (isDarkMode ? 'bg-[#1E293B]' : 'bg-[#E0F2FE]/50') : (isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50')} \${isDarkMode ? 'text-white' : 'text-slate-900'}\`}
                 >
                   {activeContact?.id === contact.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#00D4FF] rounded-r-full"></div>
                   )}
                   <div className="relative">
                     <div className={\`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden shadow-sm \${activeContact?.id === contact.id ? 'bg-[#00D4FF] text-white' : (isDarkMode ? 'bg-[#334155] text-slate-300' : 'bg-slate-100 text-slate-500')}\`}>
                       {contact.avatar && contact.avatar !== 'default-avatar.png' ? (
                          <img src={\`http://localhost:5000\${contact.avatar}\`} alt="Avatar" className="w-full h-full object-cover" />
                       ) : (
                          contact.name.charAt(0).toUpperCase()
                       )}
                     </div>
                     {contact.isOnline && contact.type === 'user' && <div className={\`absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 rounded-full \${isDarkMode ? 'border-[#0B1120]' : 'border-white'}\`}></div>}
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-center mb-0.5">
                       <h4 className={\`font-semibold text-[15px] truncate \${isDarkMode ? 'text-white' : 'text-slate-800'}\`}>{contact.name}</h4>
                       <span className={\`text-[11px] font-medium \${contact.unreadCount > 0 ? 'text-[#007AFF]' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}\`}>
                         Today
                       </span>
                     </div>
                     <div className="flex justify-between items-center">
                       <p className={\`text-[13px] truncate pr-2 \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`}>
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
         <div className={\`flex-1 flex flex-col relative z-10 \${activeContact ? 'flex' : 'hidden md:flex'} \${isDarkMode ? 'bg-[#0B1120]' : 'bg-[#F8FAFC]'}\`}>
            
            {/* Minimal Background Pattern for Chat Area */}
            <div className={\`absolute inset-0 z-0 pointer-events-none \${isDarkMode ? 'opacity-[0.02]' : 'opacity-[0.03]'}\`} style={{backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>
            
            {!activeContact ? (
              <div className={\`flex-1 flex flex-col items-center justify-center relative z-10 \${isDarkMode ? 'text-white' : 'text-slate-900'}\`}>
                <div className="w-20 h-20 mb-4 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-800">
                  <span className="text-3xl">💬</span>
                </div>
                <h2 className="text-xl font-semibold mb-1">Select a chat to start messaging</h2>
                <p className="text-sm text-slate-500">Connect with your network and collaborate seamlessly.</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className={\`h-[68px] border-b flex justify-between items-center px-4 md:px-6 shrink-0 z-20 \${isDarkMode ? 'border-white/5 bg-[#1E293B]' : 'border-slate-200 bg-white'}\`}>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setActiveContact(null)}
                      className={\`md:hidden p-2 rounded-full transition-colors flex items-center justify-center \${isDarkMode ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}\`}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="relative cursor-pointer">
                      <div className={\`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[15px] shrink-0 overflow-hidden \${isDarkMode ? 'bg-[#334155] text-slate-200' : 'bg-slate-100 text-slate-600'}\`}>
                        {activeContact.avatar && activeContact.avatar !== 'default-avatar.png' ? (
                          <img src={\`http://localhost:5000\${activeContact.avatar}\`} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          activeContact.name.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>
                    <div className="cursor-pointer" onClick={() => activeContact?.type !== 'user' && setShowMembersModal(true)}>
                      <h3 className={\`font-semibold text-[15px] \${isDarkMode ? 'text-white' : 'text-slate-900'}\`}>{activeContact.name}</h3>
                      {activeContact.type === 'group' || activeContact.type === 'channel' ? (
                        <p className={\`text-[12px] \${isDarkMode ? 'text-[#00D4FF]' : 'text-[#007AFF]'}\`}>
                           {activeGroupDetails?.members?.length || 1} members
                           <span className="text-slate-400 mx-1">•</span> 
                           <span className="text-slate-400">{activeContact.type === 'channel' ? 'Announcement Channel' : 'Group Chat'}</span>
                        </p>
                      ) : (
                        <p className={\`text-[12px] \${activeContact?.isOnline ? (isDarkMode ? 'text-[#00D4FF]' : 'text-[#007AFF]') : 'text-slate-400'}\`}>
                           {activeContact?.isOnline ? 'Online' : 'Offline'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={\`flex items-center gap-1 \${isDarkMode ? 'text-slate-300' : 'text-slate-600'}\`}>
                    <button onClick={() => handleStartCall('audio')} className={\`w-10 h-10 flex items-center justify-center rounded-full transition-colors \${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}\`}><Phone className="w-5 h-5" /></button>
                    <button onClick={() => handleStartCall('video')} className={\`w-10 h-10 flex items-center justify-center rounded-full transition-colors \${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}\`}><Video className="w-5 h-5" /></button>
                    <button className={\`w-10 h-10 hidden sm:flex items-center justify-center rounded-full transition-colors \${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}\`}><Search className="w-5 h-5" /></button>
                    <div className="relative">
                      <button onClick={() => setShowMoreMenu(prev => !prev)} className={\`w-10 h-10 flex items-center justify-center rounded-full transition-colors \${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}\`}>
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {showMoreMenu && (
                        <div className={\`absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border overflow-hidden z-[100] \${isDarkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white border-slate-200'}\`}>
                          <button onClick={() => { handleOpenScheduleMeet(); setShowMoreMenu(false); }} className={\`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 text-[14px] \${isDarkMode ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}\`}><PhoneCall className="w-4 h-4 text-green-500" /> Schedule Meet</button>
                          {activeContact?.type !== 'user' && (
                            <>
                              <button onClick={() => { setShowMembersModal(true); setShowMoreMenu(false); }} className={\`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 text-[14px] \${isDarkMode ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}\`}><Users className="w-4 h-4 text-blue-500" /> Manage Members</button>
                              <button onClick={() => { handleLeaveGroup(); setShowMoreMenu(false); }} className={\`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 text-[14px] \${isDarkMode ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}\`}><ArrowLeft className="w-4 h-4 text-red-500" /> {activeContact?.adminId === user?.id ? 'Leave or Transfer' : 'Leave Chat'}</button>
                            </>
                          )}
                          {activeContact?.type === 'user' && (
                             <button onClick={() => { setShowPrivacyModal(true); setShowMoreMenu(false); }} className={\`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 text-[14px] \${isDarkMode ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}\`}><Ban className="w-4 h-4 text-red-500" /> Block User</button>
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
                       <div className={\`rounded-full w-16 h-16 flex items-center justify-center mb-4 \${isDarkMode ? 'bg-[#1E293B]' : 'bg-slate-200'}\`}>
                          <span className="text-2xl">👋</span>
                       </div>
                       <p className={\`text-sm font-medium \${isDarkMode ? 'text-slate-400' : 'text-slate-500'}\`}>Say hello and start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMine = msg.senderId === user?.id;
                      const timeString = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const showAvatar = !isMine && (idx === 0 || messages[idx-1].senderId !== msg.senderId);

                      return (
                        <div key={msg.id || idx} className={\`flex w-full items-end gap-2 \${isMine ? 'justify-end' : 'justify-start'}\`}>
                          
                          {!isMine && (
                            <div className="w-8 h-8 shrink-0 flex items-end">
                               {showAvatar && (
                                <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] overflow-hidden \${isDarkMode ? 'bg-[#334155] text-slate-300' : 'bg-slate-200 text-slate-600'}\`}>
                                  {msg.sender?.avatar && msg.sender.avatar !== 'default-avatar.png' ? (
                                    <img src={\`http://localhost:5000\${msg.sender.avatar}\`} alt="Avatar" className="w-full h-full object-cover" />
                                  ) : (
                                    (msg.sender?.name || activeContact.name).charAt(0).toUpperCase()
                                  )}
                                </div>
                               )}
                            </div>
                          )}

                          <div className={\`flex flex-col max-w-[85%] md:max-w-[65%] \${isMine ? 'items-end' : 'items-start'}\`}>
                            {/* Message Bubble Telegram Style */}
                            <div className={\`px-4 py-2.5 text-[15px] leading-relaxed relative shadow-sm \${isMine ? (isDarkMode ? 'bg-[#00D4FF]/20 border border-[#00D4FF]/30 text-white rounded-[20px] rounded-br-[4px]' : 'bg-[#E0F2FE] text-slate-900 rounded-[20px] rounded-br-[4px]') : (isDarkMode ? 'bg-[#1E293B] text-white rounded-[20px] rounded-bl-[4px]' : 'bg-white text-slate-900 rounded-[20px] rounded-bl-[4px] border border-slate-100')}\`} style={{ wordBreak: 'break-word' }}>
                              
                              {/* Group sender name if applicable */}
                              {!isMine && showAvatar && (activeContact.type === 'group' || activeContact.type === 'channel') && (
                                <p className={\`text-[13px] font-semibold mb-1 \${isDarkMode ? 'text-[#00D4FF]' : 'text-[#007AFF]'}\`}>
                                   {msg.sender?.name || 'User'}
                                </p>
                              )}

                              <button onClick={() => setMessageMenuOpenId(prev => prev === msg.id ? null : msg.id)} className={\`absolute top-2 \${isMine ? '-left-8' : '-right-8'} w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity \${isDarkMode ? 'text-slate-400' : 'text-slate-400'}\`}>
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {messageMenuOpenId === msg.id && (
                                <div className={\`absolute top-8 \${isMine ? 'right-0' : 'left-0'} w-36 border rounded-xl shadow-xl z-40 overflow-hidden \${isDarkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white border-slate-200'}\`}>
                                  {isMine && <button onClick={() => handleEditMessage(msg)} className={\`w-full text-left px-3 py-2 transition-colors flex items-center gap-2 text-[13px] \${isDarkMode ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}\`}> <Edit className="w-4 h-4" /> Edit</button>}
                                  {(isMine || user?.role === 'admin') && <button onClick={() => handleDeleteMessage(msg.id)} className={\`w-full text-left px-3 py-2 transition-colors flex items-center gap-2 text-[13px] \${isDarkMode ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}\`}> <Trash2 className="w-4 h-4 text-red-500" /> Delete</button>}
                                </div>
                              )}
                              
                              {msg.attachmentUrl && msg.attachmentType === 'image' && (
                                <div className="mb-2 max-w-[280px] md:max-w-[340px] rounded-xl overflow-hidden mt-1">
                                   <img src={\`http://localhost:5000\${msg.attachmentUrl}\`} alt="Attachment" className="w-full h-auto object-cover cursor-pointer" />
                                </div>
                              )}
                              {msg.attachmentUrl && msg.attachmentType === 'file' && (
                                <a href={\`http://localhost:5000\${msg.attachmentUrl}\`} target="_blank" rel="noreferrer" className={\`flex items-center gap-3 mb-2 p-2.5 rounded-xl transition-all \${isMine ? (isDarkMode ? 'bg-black/20' : 'bg-blue-100/50') : (isDarkMode ? 'bg-white/5' : 'bg-slate-50')}\`}>
                                   <div className={\`w-10 h-10 rounded-full flex items-center justify-center shrink-0 \${isMine ? (isDarkMode ? 'bg-[#00D4FF]/30 text-[#00D4FF]' : 'bg-blue-200 text-blue-600') : (isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-600')}\`}>
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
                                    className={\`w-full min-w-[200px] min-h-[60px] resize-none rounded-lg p-2 text-sm focus:outline-none \${isDarkMode ? 'bg-black/20 text-white' : 'bg-white text-slate-900 border border-slate-200'}\`}
                                  />
                                  <div className="flex justify-end gap-2 mt-2">
                                    <button type="button" onClick={handleCancelEdit} className="text-xs font-semibold opacity-80">Cancel</button>
                                    <button type="submit" className="text-xs font-semibold">Save</button>
                                  </div>
                                </form>
                              ) : (
                                <div className="flex items-end gap-3 flex-wrap">
                                  <span className="whitespace-pre-wrap">{msg.content}</span>
                                  <div className="flex items-center gap-1 ml-auto mt-1 shrink-0">
                                    <span className={\`text-[10px] font-medium \${isMine ? (isDarkMode ? 'text-[#00D4FF]' : 'text-blue-500') : (isDarkMode ? 'text-slate-400' : 'text-slate-400')}\`}>
                                      {timeString}
                                    </span>
                                    {isMine && (
                                      <span className={\`text-[14px] leading-none \${msg.isRead ? 'text-[#007AFF]' : (isDarkMode ? 'text-[#00D4FF]' : 'text-blue-400')}\`}>
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
                <form onSubmit={handleSendMessage} className={\`p-4 bg-transparent shrink-0 z-20 flex flex-col items-center \${isDarkMode ? 'bg-[#0B1120]' : 'bg-[#F8FAFC]'}\`}>
                  
                  {selectedFile && (
                     <div className={\`w-full max-w-4xl rounded-2xl p-3 flex items-center justify-between mb-2 shadow-sm \${isDarkMode ? 'bg-[#1E293B] border border-white/10' : 'bg-white border border-slate-200'}\`}>
                        <div className="flex items-center gap-3 min-w-0">
                           <div className={\`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden \${isDarkMode ? 'bg-[#0B1120]' : 'bg-slate-100'}\`}>
                              {selectedFile.type.startsWith('image/') ? (
                                  <img src={URL.createObjectURL(selectedFile)} alt="preview" className="w-full h-full object-cover" />
                              ) : (
                                  <Paperclip className="w-5 h-5 text-slate-500" />
                              )}
                           </div>
                           <div className="min-w-0">
                             <p className={\`text-[13px] font-medium truncate \${isDarkMode ? 'text-white' : 'text-slate-900'}\`}>{selectedFile.name}</p>
                           </div>
                        </div>
                        <button type="button" onClick={() => setSelectedFile(null)} className={\`w-8 h-8 flex items-center justify-center rounded-full \${isDarkMode ? 'bg-white/10 hover:bg-red-500/20 text-slate-300' : 'bg-slate-100 hover:bg-red-50 text-slate-500'}\`}>✕</button>
                     </div>
                  )}

                  <div className={\`flex items-end gap-2 p-2 w-full max-w-4xl shadow-sm transition-all duration-300 \${isDarkMode ? 'bg-[#1E293B] border border-white/10 rounded-[24px]' : 'bg-white border border-slate-200 rounded-[24px]'}\`}>
                      <button type="button" className={\`p-2.5 rounded-full transition-colors shrink-0 outline-none \${isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}\`}><Smile className="w-6 h-6" /></button>
                      <textarea 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                        placeholder={isChannelReadOnly ? "Only channel admins may post here." : "Type a message or paste code/links here..."} 
                        rows={1}
                        disabled={isChannelReadOnly}
                        className={\`flex-1 bg-transparent border-none focus:outline-none text-[15px] font-medium py-3 px-1 placeholder-slate-400 min-w-0 resize-none max-h-36 overflow-auto custom-scrollbar leading-[1.4] disabled:cursor-not-allowed \${isDarkMode ? 'text-white' : 'text-slate-900'}\`}
                      />
                      <div className="flex items-center self-end mb-1 mr-1">
                        <button type="button" disabled={isChannelReadOnly} onClick={() => fileInputRef.current?.click()} className={\`p-2.5 rounded-full transition-colors shrink-0 outline-none mr-1 \${isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}\`}>
                           <Paperclip className="w-5 h-5" />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        {(newMessage.trim() || selectedFile) && !isChannelReadOnly ? (
                          <button type="submit" className="w-[42px] h-[42px] rounded-full transition-all flex items-center justify-center shrink-0 outline-none bg-[#00D4FF] hover:bg-[#00bfe6] text-white shadow-md">
                            <Send className="w-[18px] h-[18px] ml-0.5" />
                          </button>
                        ) : (
                          <button type="button" disabled={isChannelReadOnly} className={\`w-[42px] h-[42px] rounded-full transition-all flex items-center justify-center shrink-0 outline-none \${isChannelReadOnly ? 'opacity-50 cursor-not-allowed' : ''} bg-[#00D4FF] hover:bg-[#00bfe6] text-white shadow-md\`}>
                            <Mic className="w-[20px] h-[20px]" />
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
              const payload = { content: \`📅 I have scheduled a meet: "\${evt.title}". Please check your calendar.\` };
              if (activeContact?.type === 'group' || activeContact?.type === 'channel') { payload.groupId = activeContact.id; }
              else { payload.receiverId = activeContact.id; }
              api.post('/messages', payload).then(res => {
                 if (res.data.success) {
                    setMessages(prev => [...prev, res.data.data]);
                    const roomId = activeContact?.type === 'group' || activeContact?.type === 'channel' ? \`group_\${activeContact.id}\` : [user.id, activeContact.id].sort().join('_');
                    socket.emit('send_message', { ...res.data.data, roomId });
                    scrollToBottom();
                 }
              });
           }}
        />
      )}
      
      {/* Call Modal */}
      {showCallModal && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className={\`\${isDarkMode ? 'bg-[#1E293B] border-white/10' : 'bg-white border-slate-200'} border w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl relative\`}>
               <div className="p-8 flex flex-col items-center relative z-10">
                  <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-4xl font-bold mb-6 overflow-hidden relative">
                     {activeContact?.avatar && activeContact.avatar !== 'default-avatar.png' ? (
                        <img src={\`http://localhost:5000\${activeContact.avatar}\`} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                        activeContact?.name.charAt(0).toUpperCase()
                     )}
                  </div>
                  <h3 className={\`text-2xl font-bold mb-1 \${isDarkMode ? 'text-white' : 'text-slate-900'}\`}>{activeContact?.name}</h3>
                  <p className="text-[#00D4FF] text-sm font-semibold mb-10">
                     {isCalling ? \`Dialing \${callType}...\` : 'No Answer'}
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
         </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(filePath, logicPart + newReturnBlock);
console.log('Successfully replaced the return block safely.');
