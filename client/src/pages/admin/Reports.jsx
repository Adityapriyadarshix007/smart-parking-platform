import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRevenueReport = async () => {
    try {
      const response = await api.get('/admin/revenue', { params: dateRange });
      alert(`Total Revenue: ₹${response.data.data.totalRevenue}`);
    } catch (error) {
      alert('Error fetching revenue report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Platform Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">{stats?.totalUsers || 0}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">{stats?.totalOwners || 0}</div>
            <div className="text-sm text-gray-600">Parking Owners</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded">
            <div className="text-2xl font-bold text-purple-600">{stats?.totalSlots || 0}</div>
            <div className="text-sm text-gray-600">Total Slots</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded">
            <div className="text-2xl font-bold text-orange-600">₹{stats?.totalEarnings || 0}</div>
            <div className="text-sm text-gray-600">Total Earnings</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Revenue Report</h2>
        <div className="flex gap-4 mb-4">
          <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="border rounded px-3 py-2" />
          <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="border rounded px-3 py-2" />
          <button onClick={fetchRevenueReport} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Generate Report</button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
