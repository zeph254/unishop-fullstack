import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useProduct } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, isAuthenticated, safeStorageGet, logout } = useUser();
  const { products, fetchProducts, addProduct, updateProduct, deleteProduct } = useProduct();
  const [users, setUsers] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [revenueData, setRevenueData] = useState({ totalRevenue: 0, revenueByCategory: [] });
  const [customerTrends, setCustomerTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const token = safeStorageGet('token');
      const response = await fetch('https://unishop-fullstack.onrender.com/users/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Promote a user to admin
  const promoteUser = async (userId) => {
    try {
      const token = safeStorageGet('token');
      const response = await fetch(`https://unishop-fullstack.onrender.com/users/${userId}/promote`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to promote user');
      }
      await fetchUsers(); // Refresh the users list
    } catch (error) {
      setError(error.message);
    }
  };

  // Delete a user
  const deleteUser = async (userId) => {
    try {
      const token = safeStorageGet('token');
      const response = await fetch(`https://unishop-fullstack.onrender.com/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      await fetchUsers(); // Refresh the users list
    } catch (error) {
      setError(error.message);
    }
  };

  // Fetch best-selling products
  const fetchBestSellingProducts = async () => {
    try {
      const token = safeStorageGet('token');
      const response = await fetch('https://unishop-fullstack.onrender.com/analytics/best_selling', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setBestSellingProducts(data || []); // Fallback to an empty array
      } else {
        throw new Error(data.error || 'Failed to fetch best-selling products');
      }
    } catch (error) {
      setError(error.message);
      setBestSellingProducts([]); // Fallback to an empty array
    }
  };

  // Fetch revenue analytics
  const fetchRevenueAnalytics = async () => {
    try {
      const token = safeStorageGet('token');
      const response = await fetch('https://unishop-fullstack.onrender.com/analytics/revenue', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("Revenue Data Response:", data); // Debugging
      if (response.ok) {
        setRevenueData({
          totalRevenue: data.totalRevenue || 0,
          revenueByCategory: data.revenueByCategory || [], // Fallback to an empty array
        });
      } else {
        throw new Error(data.error || 'Failed to fetch revenue analytics');
      }
    } catch (error) {
      setError(error.message);
      setRevenueData({ totalRevenue: 0, revenueByCategory: [] }); // Fallback to default values
    }
  };

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
        setCustomerTrends(data || []); // Fallback to an empty array
      } else {
        throw new Error(data.error || 'Failed to fetch customer trends');
      }
    } catch (error) {
      setError(error.message);
      setCustomerTrends([]); // Fallback to an empty array
    }
  };

  useEffect(() => {
    console.log("User in AdminDashboard:", user);
    console.log("Is Authenticated in AdminDashboard:", isAuthenticated);

    if (!isAuthenticated || user?.role !== 'admin') {
      console.warn("Redirecting to login. User role:", user?.role);
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchUsers(),
          fetchProducts(),
          fetchBestSellingProducts(),
          fetchRevenueAnalytics(),
          fetchCustomerTrends(),
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
          {/* <li className="mb-4">
            <button
              onClick={() => navigate('/product')}
              className="w-full text-left hover:bg-blue-700 p-2 rounded"
            >
              Product Management
            </button>
          </li> */}
          <li className="mb-4">
            <button onClick={() => navigate('/admin/best-selling')} className="w-full text-left hover:bg-blue-700 p-2 rounded">
              Best-Selling Products
            </button>
          </li>
          <li className="mb-4">
            <button onClick={() => navigate('/admin/revenue')} className="w-full text-left hover:bg-blue-700 p-2 rounded">
              Revenue Analytics
            </button>
          </li>
          <li className="mb-4">
            <button onClick={() => navigate('/admin/customer-trends')} className="w-full text-left hover:bg-blue-700 p-2 rounded">
              Customer Purchase Trends
            </button>
            <li className="mb-4">
            <button onClick={() => navigate('/account')} className="w-full text-left hover:bg-blue-700 p-2 rounded">
              Profile
            </button>
          </li>
          <li className="mb-4">
            <button onClick={() => navigate('/product')} className="w-full text-left hover:bg-blue-700 p-2 rounded">
              Products
            </button>
          </li>
          </li>
          <li className="mb-4">
            <button
              onClick={logout}
              className="w-full text-left hover:bg-red-700 p-2 rounded"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {/* User Management */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">User Management</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Username</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Role</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="p-2">{user.username}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.role}</td>
                    <td className="p-2">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => promoteUser(user.id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                        >
                          Promote
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminDashboard;