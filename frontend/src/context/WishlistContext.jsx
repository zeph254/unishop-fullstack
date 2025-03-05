import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRemovingFromWishlist, setIsRemovingFromWishlist] = useState(false);

  // Function to get the JWT token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch wishlist items from the backend
  const fetchWishlistItems = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No token found. User must be logged in.');
        return;
      }

      const response = await axios.get('https://unishop-fullstack.onrender.com/wishlist', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWishlistItems(response.data || []);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load wishlist items on component mount
  useEffect(() => {
    fetchWishlistItems();
  }, []);

  // Add an item to the wishlist
  const addToWishlist = async (product) => {
    try {
      const token = getToken();
      if (!token) {
        alert('You must be logged in to add items to your wishlist.');
        return;
      }
  
      console.log('Payload:', { product_id: product.id }); // Debugging
      const response = await axios.post(
        'https://unishop-fullstack.onrender.com/wishlist',
        { product_id: product.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchWishlistItems(); // Refresh the wishlist
      alert('Product added to wishlist!'); // Notify the user
    } catch (error) {
      console.error('Error:', error.response?.data || error.message); // Debugging
      if (error.response && error.response.status === 400) {
        alert('This product is already in your wishlist.');
      } else {
        alert('Failed to add product to wishlist. Please try again.');
      }
    }
  };
  
  const removeFromWishlist = async (wishlistItemId) => {
    if (isRemovingFromWishlist) return; // Prevent duplicate requests
    setIsRemovingFromWishlist(true);
  
    const token = getToken();
    if (!token) {
      alert('You must be logged in to perform this action.');
      setIsRemovingFromWishlist(false);
      return;
    }
  
    try {
      console.log('Wishlist Item ID:', wishlistItemId); // Debugging
      const response = await axios.delete(`https://unishop-fullstack.onrender.com/wishlist/${wishlistItemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Response:', response.data); // Debugging
      await fetchWishlistItems(); // Refresh the wishlist
      alert('Product removed from wishlist!'); // Notify the user
    } catch (error) {
      console.error('Error:', error.response?.data || error.message); // Debugging
      alert('Failed to remove product from wishlist. Please try again.');
    } finally {
      setIsRemovingFromWishlist(false); // Re-enable the button
    }
  };

  // Check if a product is in the wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.product_id === productId);
  };

  // Provide context values
  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isRemovingFromWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};