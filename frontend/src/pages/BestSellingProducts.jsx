import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const BestSellingProducts = () => {
  const { user, isAuthenticated, safeStorageGet } = useUser();
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch best-selling products
  const fetchBestSellingProducts = async () => {
    try {
      const token = safeStorageGet('token');
      const response = await fetch('https://unishop-fullstack-1.onrender.com/analytics/best_selling', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setBestSellingProducts(data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch best-selling products');
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
    fetchBestSellingProducts();
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
            { label: "Customer Purchase Trends", path: "/admin/customer-trends" },
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Best-Selling Products</h1>
        <div className="bg-white p-6 rounded-lg shadow-xl">
          {bestSellingProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bestSellingProducts.map((product) => (
                <div
                  key={product.product_id}
                  className="p-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-md hover:scale-105 transition-transform duration-300"
                >
                  <h3 className="text-xl font-semibold">{product.product_name}</h3>
                  <p className="text-lg">🔥 Sold: <span className="font-bold">{product.total_sold}</span></p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-lg text-center">No best-selling products available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BestSellingProducts;
