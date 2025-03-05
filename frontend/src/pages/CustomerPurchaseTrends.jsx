import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const CustomerPurchaseTrends = () => {
  const { user, isAuthenticated, safeStorageGet } = useUser();
  const [customerTrends, setCustomerTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch customer purchase trends
  const fetchCustomerTrends = async () => {
    try {
      const token = safeStorageGet('token');
      const response = await fetch('https://unishop-fullstack.onrender.com/analytics/customer_trends', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCustomerTrends(data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch customer trends');
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

    fetchCustomerTrends();
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
        <h1 className="text-2xl font-bold mb-6">Customer Purchase Trends</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ul>
            {customerTrends.map((trend) => (
              <li key={trend.user_id} className="mb-2">
                {trend.username} - Orders: {trend.order_count}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CustomerPurchaseTrends;