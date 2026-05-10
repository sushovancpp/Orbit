import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { getSocket } from '../services/socket';
import { formatDistanceToNow } from 'date-fns';

export default function ChatPage() {
  const { id: chatId } = useParams();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const socket = getSocket();

  const { data: chatsData } = useQuery({ queryKey: ['chats'], queryFn: () => api.get('/chats') });
  const chats = chatsData?.chats || [];

  useEffect(() => {
    if (!chatId) return;
    api.get(`/chats/${chatId}/messages`).then(d => setMessages(d.messages || []));
  }, [chatId]);

  useEffect(() => {
    if (!socket) return;
    socket.on('chat:message', ({ chatId: cid, message }) => {
      if (cid === chatId) setMessages(prev => [...prev, message]);
    });
    return () => socket.off('chat:message');
  }, [socket, chatId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => {
    if (!input.trim() || !socket || !chatId) return;
    socket.emit('chat:send', { chatId, content: input });
    setInput('');
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-4">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 card overflow-y-auto">
        <div className="p-3 font-semibold border-b border-gray-100 dark:border-gray-800">Messages</div>
        {chats.map(c => {
          const other = c.members?.find(m => m._id !== user?._id);
          return (
            <a key={c._id} href={`/chat/${c._id}`}
              className={`flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${chatId === c._id ? 'bg-orbit-50 dark:bg-orbit-900/20' : ''}`}>
              <img src={other?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${other?.username}`}
                className="w-9 h-9 avatar" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{c.isGroup ? c.name : other?.name}</p>
                <p className="text-xs text-gray-400 truncate">@{other?.username}</p>
              </div>
            </a>
          );
        })}
      </div>

      {/* Chat area */}
      {chatId ? (
        <div className="flex-1 card flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => {
              const isMe = (m.sender?._id || m.sender) === user?._id;
              return (
                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${isMe ? 'bg-orbit-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    {m.content}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 p-3 flex gap-2">
            <input className="input text-sm" placeholder="Type a message…" value={input}
              onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
            <button onClick={send} className="btn-primary p-2"><Send size={16} /></button>
          </div>
        </div>
      ) : (
        <div className="flex-1 card flex items-center justify-center text-gray-400 text-sm">
          Select a conversation
        </div>
      )}
    </div>
  );
}
