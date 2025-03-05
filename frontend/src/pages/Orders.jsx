import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // Import UserContext to access user information
import axios from 'axios'; // Use axios for API calls

export default function Orders() {
  const { user, isAuthenticated } = useUser(); // Get user and authentication status
  const [ongoingOrders, setOngoingOrders] = useState([]); // State for ongoing/delivered orders
  const [canceledOrders, setCanceledOrders] = useState([]); // State for canceled/returned orders
  const [selectedTab, setSelectedTab] = useState('ongoing'); // State for active tab
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling

  // Fetch order history from the backend
  const fetchOrderHistory = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/history", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true, // Include credentials (cookies, authorization headers)
      });
  
      if (response.data) {
        const orders = response.data;
        const ongoing = orders.filter((order) => order.status !== 'Canceled' && order.status !== 'Returned');
        const canceled = orders.filter((order) => order.status === 'Canceled' || order.status === 'Returned');
        setOngoingOrders(ongoing);
        setCanceledOrders(canceled);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
      setError('Failed to fetch order history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Track order status by order ID
  const trackOrderStatus = async (orderId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/track/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Include JWT token
        },
      });

      if (response.data) {
        const { status, shipping_status, estimated_delivery } = response.data;
        const deliveryDate = new Date(estimated_delivery).toLocaleDateString();
        alert(`Order Status: ${status}\nShipping Status: ${shipping_status}\nEstimated Delivery: ${deliveryDate}`);
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      alert('Failed to track order. Please try again later.');
    }
  };

  // Fetch order history on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrderHistory();
    }
  }, [isAuthenticated]);

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <div className="text-center p-8">
          <p className="text-lg font-semibold mb-2 text-red-500">{error}</p>
          <button
            onClick={fetchOrderHistory}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      {/* Tab Buttons */}
      <div className="border-b mb-6 flex space-x-8">
        <button
          className={`pb-2 text-sm font-semibold transition-colors
            ${selectedTab === 'ongoing' 
              ? 'text-orange-500 border-b-2 border-orange-500' 
              : 'text-gray-500 border-b-2 border-transparent'
            }`}
          onClick={() => setSelectedTab('ongoing')}
        >
          Ongoing/Delivered ({ongoingOrders.length})
        </button>
        <button
          className={`pb-2 text-sm font-semibold transition-colors
            ${selectedTab === 'canceled' 
              ? 'text-orange-500 border-b-2 border-orange-500' 
              : 'text-gray-500 border-b-2 border-transparent'
            }`}
          onClick={() => setSelectedTab('canceled')}
        >
          Canceled/Returned ({canceledOrders.length})
        </button>
      </div>

      {/* Ongoing/Delivered Tab */}
      {selectedTab === 'ongoing' && (
        <>
          {ongoingOrders.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-lg font-semibold mb-2">
                You have no ongoing or delivered orders!
              </p>
              <p className="mb-4 text-gray-600">
                All your orders will be saved here for you to access their status anytime.
              </p>
              <Link
                to="/"
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {ongoingOrders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div className="mb-2 md:mb-0">
                    <p className="font-semibold">Order ID: {order.id}</p>
                    <p className="text-sm text-gray-500">Placed on: {new Date(order.created_at).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">Status: {order.status}</p>
                    <p className="text-sm text-gray-500">Shipping Status: {order.shipping_status}</p>
                    <p className="text-sm text-gray-500">Total Price: ${order.total_price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      Estimated Delivery: {new Date(order.estimated_delivery).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => trackOrderStatus(order.id)}
                      className="text-blue-600 hover:underline"
                    >
                      Track Order
                    </button>
                    <Link
                      to={`/account/orders/${order.id}/invoice`}
                      className="text-blue-600 hover:underline"
                    >
                      View Invoice
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Canceled/Returned Tab */}
      {selectedTab === 'canceled' && (
        <>
          {canceledOrders.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-lg font-semibold mb-2">
                You have no canceled or returned orders!
              </p>
              <p className="mb-4 text-gray-600">
                All your orders will be saved here for you to access their status anytime.
              </p>
              <Link
                to="/"
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {canceledOrders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div className="mb-2 md:mb-0">
                    <p className="font-semibold">Order ID: {order.id}</p>
                    <p className="text-sm text-gray-500">Placed on: {new Date(order.created_at).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">Status: {order.status}</p>
                    <p className="text-sm text-gray-500">Total Price: ${order.total_price.toFixed(2)}</p>
                  </div>
                  <div>
                    <Link
                      to={`/account/orders/${order.id}/invoice`}
                      className="text-blue-600 hover:underline"
                    >
                      View Invoice
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}