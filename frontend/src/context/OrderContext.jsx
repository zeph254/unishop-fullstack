import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create the context
const OrderContext = createContext();

// Create a provider component
export const OrderProvider = ({ children }) => {
  const [ongoingOrders, setOngoingOrders] = useState([]); // State for ongoing/delivered orders
  const [canceledOrders, setCanceledOrders] = useState([]); // State for canceled/returned orders
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling

  // Fetch order history from the backend
  const fetchOrderHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:5000/order/history", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true, // Include credentials (cookies, authorization headers)
      });

      if (response.data) {
        const orders = response.data;
        const ongoing = orders.filter(
          (order) => order.status !== "Canceled" && order.status !== "Returned"
        );
        const canceled = orders.filter(
          (order) => order.status === "Canceled" || order.status === "Returned"
        );
        setOngoingOrders(ongoing);
        setCanceledOrders(canceled);
      }
    } catch (error) {
      console.error("Error fetching order history:", error);
      setError("Failed to fetch order history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Create a new order
  const createOrder = async (cartItems) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/order/create",
        { cart_items: cartItems },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      if (response.data) {
        // Refresh order history after creating a new order
        await fetchOrderHistory();
        return response.data; // Return the created order data
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setError("Failed to create order. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `http://127.0.0.1:5000/order/update/${orderId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      if (response.data) {
        // Refresh order history after updating the order status
        await fetchOrderHistory();
        return response.data; // Return the updated order data
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("Failed to update order status. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Track order status by order ID
  const trackOrderStatus = async (orderId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/order/track/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      if (response.data) {
        return response.data; // Return the order tracking data
      }
    } catch (error) {
      console.error("Error tracking order:", error);
      setError("Failed to track order. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Delete an order (if needed)
  const deleteOrder = async (orderId) => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `http://127.0.0.1:5000/order/delete/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      if (response.data) {
        // Refresh order history after deleting the order
        await fetchOrderHistory();
        return response.data; // Return the deletion confirmation
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      setError("Failed to delete order. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch order history on component mount
  useEffect(() => {
    fetchOrderHistory();
  }, []);

  // Provide the context value
  const value = {
    ongoingOrders,
    canceledOrders,
    loading,
    error,
    fetchOrderHistory,
    createOrder,
    updateOrderStatus,
    trackOrderStatus,
    deleteOrder,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

// Custom hook to use the context
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};