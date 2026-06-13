import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ManageMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://smart-parking-backend-tefg.onrender.com/api/v1/messages/admin/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch messages');
    }
    setLoading(false);
  };

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    try {
      const token = localStorage.getItem('token');
      await axios.get(`https://smart-parking-backend-tefg.onrender.com/api/v1/messages/admin/messages/${message._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleReply = async (messageId) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://smart-parking-backend-tefg.onrender.com/api/v1/messages/admin/messages/${messageId}/reply`,
        { reply: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Reply sent successfully!');
      setReplyingTo(null);
      setReplyText('');
      fetchMessages();
      if (selectedMessage?._id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const handleDelete = async (messageId) => {
    if (window.confirm('Delete this message?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://smart-parking-backend-tefg.onrender.com/api/v1/messages/admin/messages/${messageId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Message deleted');
        fetchMessages();
        if (selectedMessage?._id === messageId) {
          setSelectedMessage(null);
        }
      } catch (error) {
        toast.error('Failed to delete message');
      }
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      unread: 'bg-red-100 text-red-700',
      read: 'bg-yellow-100 text-yellow-700',
      replied: 'bg-green-100 text-green-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Customer Messages</h1>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-1 border-r pr-4">
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No messages yet</p>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message._id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleViewMessage(message)}
                      className={`p-4 rounded-lg cursor-pointer transition ${
                        selectedMessage?._id === message._id
                          ? 'bg-blue-50 border-l-4 border-blue-600'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-gray-800">{message.name}</div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(message.status)}`}>
                          {message.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 truncate">{message.subject}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
            
            {/* Message Detail */}
            <div className="lg:col-span-2">
              {selectedMessage ? (
                <div>
                  <div className="mb-4 flex justify-between items-start">
                    <h2 className="text-xl font-bold text-gray-800">Message Details</h2>
                    <button
                      onClick={() => handleDelete(selectedMessage._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div><div className="text-sm text-gray-500">From</div><div className="font-semibold">{selectedMessage.name}</div></div>
                      <div><div className="text-sm text-gray-500">Email</div><div className="font-semibold">{selectedMessage.email}</div></div>
                      <div><div className="text-sm text-gray-500">Subject</div><div className="font-semibold">{selectedMessage.subject}</div></div>
                      <div><div className="text-sm text-gray-500">Received</div><div className="font-semibold">{new Date(selectedMessage.createdAt).toLocaleString()}</div></div>
                    </div>
                    <div><div className="text-sm text-gray-500 mb-1">Message</div><div className="bg-white rounded p-3 border">{selectedMessage.message}</div></div>
                  </div>
                  
                  {selectedMessage.adminReply && (
                    <div className="bg-green-50 rounded-lg p-4 mb-4 border-l-4 border-green-600">
                      <div className="text-sm text-gray-500 mb-1">Admin Reply</div>
                      <div className="text-gray-700">{selectedMessage.adminReply}</div>
                      <div className="text-xs text-gray-400 mt-2">
                        Replied on: {new Date(selectedMessage.repliedAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                  
                  {replyingTo === selectedMessage._id ? (
                    <div className="mt-4">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type your reply here..."
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleReply(selectedMessage._id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Send Reply
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(selectedMessage._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Reply to Message
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  Select a message to view details
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageMessages;
