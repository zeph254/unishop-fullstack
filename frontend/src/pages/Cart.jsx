import React, { useMemo, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useUser } from '../context/UserContext';
import axios from 'axios';

function Cart() {
  const {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    getCartTotalPrice,
    fetchCartItems,
    getCartItemCount,
  } = useCart();

  const { addToWishlist, removeFromWishlist, isInWishlist, wishlistItems } = useWishlist(); // Add wishlistItems
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();

  const [recommendedItems, setRecommendedItems] = useState([]);
  const [error, setError] = useState(null);

  // Fetch most selling products
  useEffect(() => {
    const fetchMostSoldProducts = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/products/most-sold');
        setRecommendedItems(response.data);
      } catch (error) {
        console.error('Error fetching most sold products:', error);
        setError('Failed to fetch recommended products. Please try again.');
      }
    };
    fetchMostSoldProducts();
  }, []);

  // Auto-refetch cart items every 10 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchCartItems();
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchCartItems]);

  // Handle quantity change for a cart item
  const handleQuantityChange = async (productId, newQuantity) => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    try {
      await updateCartItemQuantity(productId, newQuantity);
      setError(null);
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      setError('Failed to update quantity. Please try again.');
    }
  };

  // Handle removing an item from the cart
  const handleRemoveItem = async (productId) => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    try {
      await removeFromCart(productId);
      setError(null);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      setError('Failed to remove item. Please try again.');
    }
  };

  // Handle adding a product to the cart
  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    try {
      await addToCart(product);
      alert(`${product.name} added to cart!`);
      setError(null);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add product to cart. Please try again.');
    }
  };

  // Handle toggling a product in the wishlist
  const handleWishlistToggle = async (product) => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    try {
      if (isInWishlist(product.id)) {
        // Find the wishlist item ID corresponding to the product ID
        const wishlistItem = wishlistItems.find((item) => item.product_id === product.id);
        if (wishlistItem) {
          await removeFromWishlist(wishlistItem.id); // Pass the wishlist item ID
          alert(`${product.name} removed from wishlist!`);
        } else {
          console.error('Wishlist item not found for product:', product.id);
        }
      } else {
        await addToWishlist(product);
        alert(`${product.name} added to wishlist!`);
      }
      setError(null);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      setError('Failed to update wishlist. Please try again.');
    }
  };

  // Calculate subtotal, delivery fee, and total
  const subtotal = useMemo(() => getCartTotalPrice(), [cartItems]);
  const deliveryFee = cartItems && cartItems.length > 0 ? 180 : 0;
  const total = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee]);

  // Format price in Kenyan Shillings
  const formatPrice = (price) =>
    price.toLocaleString('en-KE', { style: 'currency', currency: 'KES' });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Your Cart ({getCartItemCount()})
        </h1>
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          Continue Shopping →
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="w-full lg:w-2/3">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <Link
                to="/"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <img
                      src={item.product.image_url || '/images/placeholder.png'}
                      alt={item.product.name}
                      className="w-24 h-24 object-contain rounded-lg"
                    />
                    <div className="ml-4 flex-1">
                      <h2 className="text-lg font-semibold text-gray-800">
                        {item.product.name}
                      </h2>
                      <p className="text-gray-600">{formatPrice(item.product.price)}</p>
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.product.id, item.quantity - 1)
                        }
                        disabled={item.quantity === 1}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQty = Math.min(
                            Math.max(1, parseInt(e.target.value) || 1),
                            10
                          );
                          handleQuantityChange(item.product.id, newQty);
                        }}
                        className="w-16 text-center border rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="10"
                      />
                      <button
                        onClick={() =>
                          handleQuantityChange(item.product.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= 10}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Recommended for You
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedItems.map((recItem) => (
                    <div
                      key={recItem.id}
                      className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      <img
                        src={recItem.image_url || 'https://via.placeholder.com/150'}
                        alt={recItem.name}
                        className="w-20 h-20 object-contain rounded-lg"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold text-gray-800">{recItem.name}</h3>
                        <p className="text-gray-600 mb-2">{formatPrice(recItem.price)}</p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAddToCart(recItem)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => handleWishlistToggle(recItem)}
                            className={`px-4 py-2 rounded-lg text-sm ${
                              isInWishlist(recItem.id)
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-gray-300 text-black hover:bg-gray-400'
                            }`}
                          >
                            {isInWishlist(recItem.id)
                              ? 'Remove from Wishlist'
                              : 'Add to Wishlist'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-1/3">
          <div className="sticky top-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 z-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-800">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee:</span>
                <span className="font-medium text-gray-800">{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="font-bold text-gray-800">Total:</span>
                <span className="font-bold text-blue-600">{formatPrice(total)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;