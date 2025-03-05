import React from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Wishlist = () => {
  const { addToCart } = useCart();
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();

  // Move an item to the cart and remove from wishlist
  const handleMoveToCart = async (item) => {
    await addToCart(item.product); // Add item to cart
    await removeFromWishlist(item.id); // Use item.id, not item.product_id
  };

  if (loading) {
    return <div>Loading wishlist...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
      {wishlistItems.length === 0 ? (
        <p className="text-gray-600">Your wishlist is empty.</p>
      ) : (
        <div className="space-y-4">
          {wishlistItems.map((item) => (
            <div key={item.id} className="flex items-center border p-3 rounded">
              <img
                src={item.product.image_url || "https://via.placeholder.com/150"}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="ml-4 flex-1">
                <h3 className="font-semibold">{item.product.name}</h3>
                <p className="text-gray-600">${item.product.price}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => removeFromWishlist(item.id)} // Use item.id, not item.product_id
                  className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  Remove
                </button>
                <button
                  onClick={() => handleMoveToCart(item)}
                  className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;