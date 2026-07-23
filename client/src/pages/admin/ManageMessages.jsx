import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSyncAlt, FaEnvelope, FaReply, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ManageMessages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [toastShown, setToastShown] = useState(false);

  const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://smart-parking-backend-tefg.onrender.com/api/v1'
    : 'http://localhost:5001/api/v1';

  // ✅ Wrapped fetchMessages in useCallback
  const fetchMessages = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/messages/admin/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data && data.success) {
        setMessages(data.data || []);
        if (!toastShown) {
          toast.success(`Loaded ${data.data?.length || 0} messages`);
          setToastShown(true);
        }
      }
    } catch (error) {
      console.error('❌ Error:', error);
      if (!toastShown) {
        toast.error('Failed to load messages');
        setToastShown(true);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, API_URL, toastShown]);

  // ✅ Added fetchMessages to dependency array
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/messages/reply/${selectedMessage._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reply: replyText })
      });
      const data = await response.json();

      if (data && data.success) {
        toast.success('Reply sent successfully!');
        setShowReplyModal(false);
        setReplyText('');
        setSelectedMessage(null);
        fetchMessages();
      } else {
        toast.error('Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/admin-dashboard')} 
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100"
      >
        <FaArrowLeft className="text-sm" /> Back to Dashboard
      </button>

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-6 mb-8 shadow-xl">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3"><FaEnvelope /> Manage Messages</h1>
            <p className="text-blue-100 mt-1">View and reply to user messages</p>
          </div>
          <button onClick={fetchMessages} className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-2 rounded-full text-white font-semibold flex items-center gap-2 transition-all">
            <FaSyncAlt /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500">No messages found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((msg) => (
              <div key={msg._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-800">{msg.userId?.name || 'Unknown User'}</span>
                      <span className="text-sm text-gray-500">{msg.userId?.email || ''}</span>
                      {!msg.isRead && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">New</span>
                      )}
                      {msg.status === 'replied' && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Replied</span>
                      )}
                    </div>
                    <p className="text-gray-700">{msg.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(msg.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </p>
                    {msg.reply && (
                      <div className="mt-3 bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                        <p className="text-sm text-gray-600"><span className="font-semibold">Reply:</span> {msg.reply}</p>
                      </div>
                    )}
                  </div>
                  {!msg.reply && (
                    <button
                      onClick={() => {
                        setSelectedMessage(msg);
                        setShowReplyModal(true);
                      }}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-2"
                    >
                      <FaReply /> Reply
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Reply to Message</h3>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600"><span className="font-semibold">From:</span> {selectedMessage.userId?.name}</p>
              <p className="text-sm text-gray-600 mt-1"><span className="font-semibold">Message:</span> {selectedMessage.message}</p>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows="4"
              placeholder="Type your reply here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={handleReply} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <FaCheck /> Send Reply
              </button>
              <button onClick={() => { setShowReplyModal(false); setReplyText(''); setSelectedMessage(null); }} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMessages;
