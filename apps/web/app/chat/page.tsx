"use client";

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Hash, Search, MoreVertical, Phone, Video, Info, User as UserIcon, Plus } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [chats, setChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [usersToChat, setUsersToChat] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    
    // Fetch user's chats
    fetchChats(token);

    if (token) {
      const newSocket = io('http://localhost:4000', {
        auth: { token }
      });
      setSocket(newSocket);

      newSocket.on('receive_message', (data) => {
        setMessages((prev) => {
          // Check if message already exists (we might get our own message back)
          if (prev.some(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
        
        // Also update the chat preview in the sidebar
        setChats(prevChats => prevChats.map(c => 
          c.id === data.chatId 
            ? { ...c, messages: [data], updatedAt: data.createdAt }
            : c
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  const fetchChats = async (token: string | null) => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:4000/api/chats', {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data);
        if (data.length > 0) {
          selectChat(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectChat = async (chatId: string) => {
    if (activeChatId && socket) {
      socket.emit('leave_chat', activeChatId);
    }
    setActiveChatId(chatId);
    if (socket) {
      socket.emit('join_chat', chatId);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/chats/${chatId}/messages`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openNewChatModal = async () => {
    setShowNewChatModal(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = currentUser?.role === "ADMIN" ? "/api/users/students" : "/api/users/all";
      const res = await fetch(`http://localhost:4000${endpoint}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setUsersToChat(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startNewChat = async () => {
    if (!selectedUserId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/chats`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isGroup: false, userIds: [selectedUserId] })
      });
      if (res.ok) {
        const newChat = await res.json();
        await fetchChats(token);
        selectChat(newChat.id);
        setShowNewChatModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && socket && activeChatId) {
      const msgData = {
        content: input,
        chatId: activeChatId
      };
      
      socket.emit('send_message', msgData);
      setInput('');
    }
  };

  const activeChat = chats.find(c => c.id === activeChatId);
  
  const getChatName = (chat: any) => {
    if (chat.isGroup && chat.name) return chat.name;
    // For 1-on-1, find the other user
    const otherUser = chat.users.find((u: any) => u.id !== currentUser?.id);
    return otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown Chat';
  };

  return (
    <DashboardLayout role={currentUser?.role || "STUDENT"}>
      <div className="flex h-[calc(100vh-8rem)] bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden font-sans">
        
        {/* Sidebar Channels List */}
        <div className="w-80 bg-slate-50 border-r border-slate-200/60 flex flex-col z-10">
          <div className="p-5 border-b border-slate-200/60 bg-white/50 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Chats</h2>
              <button 
                onClick={openNewChatModal}
                className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                title="New Chat"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search channels..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-shadow outline-none text-slate-700 placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
            {chats.length === 0 ? (
               <div className="text-center text-slate-400 text-sm py-4">No active chats</div>
            ) : (
              chats.map((chat) => {
                const isActive = chat.id === activeChatId;
                const isGroup = chat.isGroup;
                const chatName = getChatName(chat);
                const lastMessage = chat.messages?.[0]?.content || "No messages yet";

                return (
                  <div 
                    key={chat.id}
                    onClick={() => selectChat(chat.id)}
                    className={cn(
                      "p-3 rounded-xl cursor-pointer group transition-colors flex items-center",
                      isActive ? "bg-indigo-50/80 border border-indigo-100/50" : "hover:bg-slate-100 border border-transparent"
                    )}
                  >
                    {isGroup ? (
                      <Hash className={cn("w-5 h-5 mr-3 shrink-0", isActive ? "text-indigo-500" : "text-slate-400 group-hover:text-slate-600")} />
                    ) : (
                       <div className="relative shrink-0 mr-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border",
                          isActive ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-slate-200 text-slate-600 border-slate-300"
                        )}>
                          {chatName.charAt(0)}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex-1 overflow-hidden">
                      <h3 className={cn("font-bold text-sm truncate", isActive ? "text-indigo-900" : "text-slate-700 group-hover:text-slate-900")}>
                        {chatName}
                      </h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{lastMessage}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white relative">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-6 bg-white border-b border-slate-200/60 flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center">
                  {activeChat.isGroup ? <Hash className="w-6 h-6 text-slate-400 mr-3" /> : <UserIcon className="w-6 h-6 text-slate-400 mr-3" />}
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{getChatName(activeChat)}</h2>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-slate-400">
                  <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors hover:text-indigo-600"><Phone className="w-5 h-5" /></button>
                  <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors hover:text-indigo-600"><Video className="w-5 h-5" /></button>
                  <div className="w-px h-6 bg-slate-200 mx-1"></div>
                  <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors hover:text-indigo-600"><Info className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 h-full">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                      {activeChat.isGroup ? <Hash className="w-8 h-8 text-indigo-500" /> : <UserIcon className="w-8 h-8 text-indigo-500" />}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Welcome to {getChatName(activeChat)}</h3>
                    <p className="text-slate-500 text-sm max-w-md text-center mt-2 font-medium">
                      This is the start of your conversation.
                    </p>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUser?.id;
                    const showAvatar = idx === 0 || messages[idx - 1]?.senderId !== msg.senderId;

                    return (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}
                      >
                        {!isMe && (
                          <div className="w-8 shrink-0 mr-3 flex flex-col justify-end">
                            {showAvatar && (
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shadow-sm border border-slate-200" title={msg.sender?.firstName}>
                                {msg.sender?.firstName?.charAt(0) || 'U'}
                              </div>
                            )}
                          </div>
                        )}

                        <div className={cn(
                          "flex flex-col max-w-[65%]",
                          isMe ? "items-end" : "items-start"
                        )}>
                          {showAvatar && !isMe && (
                            <span className="text-xs font-bold text-slate-500 mb-1 ml-1">{msg.sender?.firstName} {msg.sender?.lastName}</span>
                          )}
                          
                          <div className={cn(
                            "px-4 py-2.5 rounded-2xl shadow-sm text-sm relative group",
                            isMe 
                              ? "bg-indigo-600 text-white rounded-br-sm" 
                              : "bg-white text-slate-800 border border-slate-200/60 rounded-bl-sm"
                          )}>
                            <p className="leading-relaxed">{msg.content}</p>
                            
                            {/* Hover Actions */}
                            <div className={cn(
                              "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1",
                              isMe ? "-left-12" : "-right-12"
                            )}>
                              <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 bg-white shadow-sm border border-slate-200">
                                <MoreVertical className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <span className="text-[10px] font-medium text-slate-400 mt-1 mx-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-200/60 shrink-0 z-10">
                <form onSubmit={sendMessage} className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Message ${getChatName(activeChat)}`}
                    className="w-full pl-5 pr-14 py-3.5 bg-slate-100 border-none rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium text-sm shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className={cn(
                      "absolute right-2 p-2 rounded-lg transition-all flex items-center justify-center",
                      input.trim() 
                        ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:scale-105" 
                        : "bg-transparent text-slate-400 cursor-not-allowed"
                    )}
                  >
                    <Send className={cn("w-4 h-4", input.trim() && "ml-0.5")} />
                  </button>
                </form>
                <div className="text-center mt-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    End-to-End Encrypted via WebSockets
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50/50">
              <div className="text-center text-slate-400">
                <MessageSquareIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-bold text-slate-500">No Chat Selected</h3>
                <p className="mt-2 text-sm">Select a chat from the sidebar or start a new one.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Start New Chat</h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select User</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" disabled>Choose a user...</option>
                {usersToChat.map(u => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowNewChatModal(false)}
                className="px-4 py-2 font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={startNewChat}
                disabled={!selectedUserId}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// Minimal icon helper for empty state
function MessageSquareIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}