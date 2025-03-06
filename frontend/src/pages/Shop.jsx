import React, { useState, useEffect } from "react";
import { useProduct } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useNavigate } from "react-router-dom";
import { HeartIcon } from "@heroicons/react/24/solid"; // Filled heart icon
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlistItems } =
    useWishlist();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Re-render component when wishlist changes
  useEffect(() => {}, [wishlistItems]);

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
      toast.success(`${product.name} added to cart!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add product to cart. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  // Handle adding/removing a product from the wishlist
  const handleWishlistToggle = async (product) => {
    try {
      if (isInWishlist(product.id)) {
        const wishlistItem = wishlistItems.find(
          (item) => item.product_id === product.id
        );
        if (!wishlistItem) {
          toast.error("Wishlist item not found.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          return;
        }
        await removeFromWishlist(wishlistItem.id);
        toast.success(`${product.name} removed from wishlist!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        await addToWishlist(product);
        toast.success(`${product.name} added to wishlist!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Failed to update wishlist. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => handleWishlistToggle(product)}
                >
                  {isInWishlist(product.id) ? (
                    <HeartIcon className="h-6 w-6 text-red-500" /> // Filled heart
                  ) : (
                    <HeartOutlineIcon className="h-6 w-6 text-gray-500" /> // Outline heart
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default Shop;