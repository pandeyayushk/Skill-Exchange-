import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Send, UserMinus } from 'lucide-react';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const Chat = () => {
  const [connections, setConnections] = useState([]);
  const [activeConnection, setActiveConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUserId = JSON.parse(localStorage.getItem('user'))?._id;
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef();

  useEffect(() => {
    fetchConnections();

    // Initialize Socket.io
    const token = localStorage.getItem('token');
    socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: { token }
    });

    socketRef.current.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (activeConnection) {
      fetchMessages(activeConnection._id);
    }
  }, [activeConnection]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const fetchConnections = async () => {
    try {
      const res = await api.get('/users/connections');
      setConnections(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (connectionId) => {
    try {
      const res = await api.get(`/chat/${connectionId}`);
      setMessages(res.data);
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const handleDisconnect = async () => {
    if (!activeConnection) return;
    try {
      await api.post('/users/disconnect', { targetUserId: activeConnection._id });
      toast.success('Disconnected successfully');
      setActiveConnection(null);
      setShowDisconnectModal(false);
      fetchConnections();
    } catch (err) {
      toast.error('Failed to disconnect');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConnection) return;

    try {
      const res = await api.post('/chat/send', { receiverId: activeConnection._id, text: newMessage });
      // Add immediately to local state for faster UI feel
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  return (
    <>
      <div className="page container" style={{ maxWidth: '1250px', height: 'calc(100vh - 120px)', display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
      
      {/* Sidebar: Connections List */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0 }}>Connections</h3>
        </div>
        <div style={{ overflowY: 'auto', flexGrow: 1 }}>
          {connections.length === 0 ? (
            <div style={{ padding: '18px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>No connections yet</div>
              <div style={{ fontSize: '14px' }}>Go to Home (Matches) and connect with someone.</div>
            </div>
          ) : (
            connections.map(conn => (
              <div 
                key={conn._id} 
                onClick={() => setActiveConnection(conn)}
                style={{ 
                  padding: '15px 20px', 
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  background: activeConnection?._id === conn._id ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ 
                  background: 'linear-gradient(135deg, var(--primary), #ec4899)', 
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  fontWeight: 'bold',
                  color: 'white',
                  fontSize: '14px',
                  flexShrink: 0
                }}>
                  {getInitials(conn.name)}
                </div>
                <div>
                  <div style={{ fontWeight: '500' }}>{conn.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{conn.skillsOffered?.[0] || 'No skills listed'}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeConnection ? (
          <>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, var(--primary), #ec4899)', 
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  fontWeight: 'bold',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  {getInitials(activeConnection.name)}
                </div>
                <h3 style={{ margin: 0 }}>{activeConnection.name}</h3>
              </div>
              <button 
                onClick={() => setShowDisconnectModal(true)}
                className="glass-button"
                style={{ width: 'auto', padding: '8px 15px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}
                title="Disconnect"
              >
                <UserMinus size={18} /> Disconnect
              </button>
            </div>
            
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {messages.map(msg => {
                const isMine = msg.sender === currentUserId;
                return (
                  <div key={msg._id} style={{ 
                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                    background: isMine ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    padding: '12px 18px',
                    borderRadius: '16px',
                    borderBottomRightRadius: isMine ? '4px' : '16px',
                    borderBottomLeftRadius: isMine ? '16px' : '4px',
                    maxWidth: '70%'
                  }}>
                    {msg.text}
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="Type a message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="glass-button" style={{ width: 'auto', padding: '12px', borderRadius: '50%' }}>
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 650, color: 'var(--text-main)', marginBottom: '8px' }}>Pick a connection</div>
              <div style={{ fontSize: '14px' }}>Select someone on the left to start chatting.</div>
            </div>
          </div>
        )}
      </div>
    </div>
      
      {/* Disconnect Modal */}
      {showDisconnectModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div className="glass-panel" style={{ padding: '30px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Disconnect?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px', lineHeight: '1.5' }}>
              Are you sure you want to disconnect from <strong>{activeConnection?.name}</strong>? You will no longer be able to message them.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowDisconnectModal(false)}
                className="glass-button"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDisconnect}
                className="glass-button"
                style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
              >
                Yes, Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
