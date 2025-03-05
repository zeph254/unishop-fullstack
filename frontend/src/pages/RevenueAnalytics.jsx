import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

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
      const response = await fetch('http://127.0.0.1:5000/analytics/revenue', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white p-4">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
        <ul>
          <li className="mb-4">
            <button
              onClick={() => navigate('/admin')}
              className="w-full text-left hover:bg-blue-700 p-2 rounded"
            >
              Dashboard
            </button>
          </li>
          <li className="mb-4">
            <button
              onClick={() => navigate('/admin/best-selling')}
              className="w-full text-left hover:bg-blue-700 p-2 rounded"
            >
              Best-Selling Products
            </button>
          </li>
          <li className="mb-4">
            <button
              onClick={() => navigate('/admin/revenue')}
              className="w-full text-left hover:bg-blue-700 p-2 rounded"
            >
              Revenue Analytics
            </button>
          </li>
          <li className="mb-4">
            <button
              onClick={() => navigate('/admin/customer-trends')}
              className="w-full text-left hover:bg-blue-700 p-2 rounded"
            >
              Customer Purchase Trends
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Revenue Analytics</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p>Total Revenue: ${revenueData.totalRevenue}</p>
          <ul>
            {revenueData.revenueByCategory.map((category) => (
              <li key={category.category} className="mb-2">
                {category.category}: ${category.revenue}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;