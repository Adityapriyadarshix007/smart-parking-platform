import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BASE_URL } from '../../config/apiConfig';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const MyMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const fetchDebounceRef = useRef(null);
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  const API_URL = `${BASE_URL}/api/v1`;

  const updateUnreadCount = useCallback((newUnreadCount) => {
    setUnreadCount(newUnreadCount);
    localStorage.setItem('unreadMessageCount', newUnreadCount);
    window.dispatchEvent(new CustomEvent('unreadCountUpdate', { detail: { count: newUnreadCount } }));
  }, []);

  const fetchMessages = useCallback(async (showToast = false) => {
    if (isFetchingRef.current) {
      console.log('⏳ Fetch already in progress, skipping...');
      return;
    }
    
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 2000) {
      console.log('⏳ Rate limited, skipping fetch...');
      if (showToast) {
        toast.error('Please wait before refreshing');
      }
      return;
    }
    
    isFetchingRef.current = true;
    lastFetchTimeRef.current = now;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/messages/my-messages`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      });
      const messageData = response.data.data;
      setMessages(messageData);
      
      const unread = messageData.filter(msg => msg.status === 'replied' && !msg.userRead).length;
      updateUnreadCount(unread);
      
      if (showToast) {
        toast.success('Messages refreshed!');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment.');
      } else if (showToast) {
        toast.error('Failed to refresh messages');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [updateUnreadCount, API_URL]);

  const debouncedFetchMessages = useCallback(() => {
    if (fetchDebounceRef.current) {
      clearTimeout(fetchDebounceRef.current);
    }
    fetchDebounceRef.current = setTimeout(() => {
      fetchMessages();
    }, 500);
  }, [fetchMessages]);

  const markMessageAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/messages/mark-read/${messageId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, userRead: true, status: 'read' } : msg
      ));
      
      const newUnreadCount = Math.max(0, unreadCount - 1);
      updateUnreadCount(newUnreadCount);
      
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllMessagesAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const unreadMessages = messages.filter(msg => msg.status === 'replied' && !msg.userRead);
      
      for (const msg of unreadMessages) {
        await axios.put(`${API_URL}/messages/mark-read/${msg._id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      if (unreadMessages.length > 0) {
        setMessages(prev => prev.map(msg => 
          msg.status === 'replied' && !msg.userRead 
            ? { ...msg, userRead: true, status: 'read' } 
            : msg
        ));
        
        updateUnreadCount(0);
      }
      
    } catch (error) {
      console.error('Error marking all messages as read:', error);
    }
  }, [messages, updateUnreadCount, API_URL]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => debouncedFetchMessages(), 15000);
    return () => {
      clearInterval(interval);
      if (fetchDebounceRef.current) {
        clearTimeout(fetchDebounceRef.current);
      }
    };
  }, [fetchMessages, debouncedFetchMessages]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      markAllMessagesAsRead();
    }
  }, [loading, messages.length, markAllMessagesAsRead]);

  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);
    if (message.status === 'replied' && !message.userRead) {
      await markMessageAsRead(message._id);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMessages(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status, isUserRead) => {
    if (status === 'replied' && !isUserRead) {
      return 'bg-green-500 text-white animate-pulse';
    }
    const badges = {
      unread: 'bg-red-100 text-red-700',
      read: 'bg-yellow-100 text-yellow-700',
      replied: 'bg-gray-100 text-gray-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status, isUserRead) => {
    if (status === 'replied' && !isUserRead) return 'New Reply!';
    const texts = {
      unread: 'Not yet read',
      read: 'Read by admin',
      replied: 'Replied'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">My Messages</h1>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full animate-pulse shadow-md">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {refreshing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    ↻ Refresh
                  </>
                )}
              </button>
              <Link to="/contact" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                + New Message
              </Link>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📧</div>
              <p className="text-gray-500">No messages yet</p>
              <Link to="/contact" className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                Send your first message
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    onClick={() => handleSelectMessage(message)}
                    className={`p-4 rounded-lg cursor-pointer transition-all border ${
                      selectedMessage?._id === message._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    } ${
                      message.status === 'replied' && !message.userRead ? 'bg-green-50 border-green-400 shadow-md' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-800 truncate flex-1 flex items-center gap-2">
                        {message.subject}
                        {message.status === 'replied' && !message.userRead && (
                          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                            New
                          </span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ml-2 ${getStatusBadge(message.status, message.userRead)}`}>
                        {getStatusText(message.status, message.userRead)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 truncate">{message.message.substring(0, 80)}</div>
                    <div className="text-xs text-gray-400 mt-2">{formatDate(message.createdAt)}</div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-5 min-h-[400px]">
                {selectedMessage ? (
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-800">{selectedMessage.subject}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(selectedMessage.status, selectedMessage.userRead)}`}>
                        {getStatusText(selectedMessage.status, selectedMessage.userRead)}
                      </span>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {selectedMessage.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{selectedMessage.name}</div>
                          <div className="text-xs text-gray-500">Sent: {formatDate(selectedMessage.createdAt)}</div>
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
                    </div>
                    
                    {selectedMessage.adminReply && (
                      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                            A
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">Admin Support</div>
                            <div className="text-xs text-gray-500">Replied: {formatDate(selectedMessage.repliedAt)}</div>
                          </div>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedMessage.adminReply}</p>
                      </div>
                    )}
                    
                    {!selectedMessage.adminReply && selectedMessage.status !== 'replied' && (
                      <div className="bg-yellow-50 rounded-lg p-4 text-center">
                        <div className="text-2xl mb-2">⏳</div>
                        <p className="text-yellow-700 text-sm">Awaiting admin response. We'll get back to you soon!</p>
                      </div>
                    )}
                    
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="mt-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      {refreshing ? (
                        <>
                          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          Refreshing...
                        </>
                      ) : (
                        '↻ Refresh to see new replies'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-5xl mb-3">📧</div>
                    <p className="text-gray-500">Select a message to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyMessages;
