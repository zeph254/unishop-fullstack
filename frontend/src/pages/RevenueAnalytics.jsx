import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const RevenueAnalytics = () => {
  const { user, isAuthenticated, safeStorageGet } = useUser();
  const [revenueData, setRevenueData] = useState({ totalRevenue: 0, revenueByCategory: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch revenue analytics
  const fetchRevenueAnalytics = async () => {
    try {
      const token = safeStorageGet('token');
      const response = await fetch('https://unishop-fullstack-1.onrender.com/analytics/revenue', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setRevenueData({
          totalRevenue: data.totalRevenue || 0,
          revenueByCategory: data.revenueByCategory || [],
        });
      } else {
        throw new Error(data.error || 'Failed to fetch revenue analytics');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchRevenueAnalytics();
  }, [isAuthenticated, user, navigate]);

  if (loading) {
    return <div className="p-4 text-center text-lg font-semibold">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600 text-center font-semibold">Error: {error}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-gradient-to-b from-blue-900 to-blue-700 text-white p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Panel</h1>
        <ul className="space-y-4">
          {[
            { label: "Dashboard", path: "/admin" },
            { label: "Best-Selling Products", path: "/admin/best-selling" },
            { label: "Revenue Analytics", path: "/admin/revenue" },
            { label: "Customer Trends", path: "/admin/customer-trends" },
          ].map((item, index) => (
            <li key={index}>
              <button
                onClick={() => navigate(item.path)}
                className="w-full text-left bg-blue-800 hover:bg-blue-600 transition duration-300 p-3 rounded-lg text-lg font-medium"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Revenue Analytics</h1>

        {/* Revenue Summary */}
        <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold">Total Revenue</h2>
          <p className="text-4xl font-bold">KES{revenueData.totalRevenue.toLocaleString()}</p>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue by Category</h2>
          {revenueData.revenueByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData.revenueByCategory}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />
                <Bar dataKey="revenue" fill="#4F46E5" barSize={50} radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-center text-lg">No revenue data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
