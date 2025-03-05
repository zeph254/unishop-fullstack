import React, { useState, useEffect, useContext } from "react";
import { useProduct } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useNavigate } from "react-router-dom";

const Shop = () => {
  const {
    products,
    categories,
    loading,
    error,
    filterByCategory,
    searchProducts,
  } = useProduct();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlistItems } = useWishlist(); // Add wishlistItems
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Handle category filter change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterByCategory(category);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchProducts(query);
  };

  // Handle adding a product to the cart
  const handleAddToCart = async (product) => {
    try {
      await addToCart(product);
      alert(`${product.name} added to cart!`);
    } 
    catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart. Please try again.");
    }
  };

  // Handle adding/removing a product from the wishlist
  const handleWishlistToggle = async (product) => {
    try {
      if (isInWishlist(product.id)) {
        // Find the wishlist item ID for the product
        const wishlistItem = wishlistItems.find((item) => item.product_id === product.id);
        if (!wishlistItem) {
          alert('Wishlist item not found.');
          return;
        }
        await removeFromWishlist(wishlistItem.id); // Pass the wishlist item ID
        alert(`${product.name} removed from wishlist!`);
      } else {
        await addToWishlist(product);
        alert(`${product.name} added to wishlist!`);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      alert("Failed to update wishlist. Please try again.");
    }
  };

  // Navigate to product details page
  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mt-10">
        <div className="bg-red-500 text-white p-4 rounded">{error}</div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h1 className="text-center text-3xl font-bold mb-10">Shop</h1>

      {/* Category Filter */}
      <div className="mb-8">
        <select
          className="form-select w-full p-2 border border-gray-300 rounded"
          aria-label="Filter by category"
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="form-input w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => (
          <div key={product.id} className="card h-full">
            <img
              src={product.image_url || "https://via.placeholder.com/150"}
              alt={product.name}
              className="w-full h-48 object-cover cursor-pointer"
              onClick={() => handleProductClick(product.id)}
            />
            <div className="p-4">
              <h2 className="text-lg font-bold">{product.name}</h2>
              <p>{product.description}</p>
              <p className="font-bold text-xl">Ksh{product.price}</p>
              <div className="flex space-x-2 mt-2">
                <button
                  className="bg-blue-500 text-white p-2 rounded"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
                <button
                  className={`p-2 rounded ${
                    isInWishlist(product.id)
                      ? "bg-red-500 text-white"
                      : "bg-gray-300 text-black"
                  }`}
                  onClick={() => handleWishlistToggle(product)}
                >
                  {isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;