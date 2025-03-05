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
      const response = await fetch('http://127.0.0.1:5000/analytics/best_selling', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        <h1 className="text-2xl font-bold mb-6">Best-Selling Products</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ul>
            {bestSellingProducts.map((product) => (
              <li key={product.product_id} className="mb-2">
                {product.product_name} - Sold: {product.total_sold}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BestSellingProducts;