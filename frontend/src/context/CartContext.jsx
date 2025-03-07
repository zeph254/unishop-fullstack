import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to get the JWT token from localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Fetch cart items from the backend
  const fetchCartItems = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No token found. User must be logged in.');
        setCartItems([]);
        setLoading(false);
        return;
      }

      console.log('Fetching cart items...'); // Debug logging
      const response = await axios.get('https://unishop-fullstack-1.onrender.com/cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Cart Items:', response.data); // Debug logging
      setCartItems(response.data || []); // Ensure cartItems is always an array
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setCartItems([]); // Set cartItems to an empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Load cart items on component mount
  useEffect(() => {
    fetchCartItems();
  }, []);

  // Add an item to the cart
  const addToCart = async (product, quantity = 1) => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No token found. User must be logged in.');
        return;
      }

      const response = await axios.post(
        'https://unishop-fullstack-1.onrender.com/cart/add',
        { product_id: product.id, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Backend Response:', response.data); // Debug logging
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.product.id === product.id);
        if (existingItem) {
          return prevItems.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevItems, { product, quantity }];
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Remove an item from the cart
  const removeFromCart = async (productId) => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No token found. User must be logged in.');
        return;
      }

      console.log(`Removing product ${productId} from cart`); // Debug logging
      await axios.delete(`https://unishop-fullstack-1.onrender.com/cart/remove/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  // Update the quantity of an item in the cart
  const updateCartItemQuantity = async (productId, quantity) => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No token found. User must be logged in.');
        return;
      }

      await axios.put(
        `https://unishop-fullstack-1.onrender.com/cart/update/${productId}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
    }
  };

  // Clear the entire cart
  const clearCart = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No token found. User must be logged in.');
        return;
      }

      await axios.delete('https://unishop-fullstack-1.onrender.com/cart/clear', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Calculate the total number of items in the cart
  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Calculate the total price of items in the cart
  const getCartTotalPrice = () => {
    if (!cartItems || cartItems.length === 0) return 0; // Handle empty cart
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  // Provide context values
  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartItemCount,
    getCartTotalPrice,
    fetchCartItems, // Add fetchCartItems to the context
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};