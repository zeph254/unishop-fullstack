import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useProduct } from '../context/ProductContext';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';

import {
  faTv,
  faMobileAlt,
  faTshirt,
  faBook,
  faUtensils,
  faChevronDown,
  faChevronUp,
  faLaptop,
  faStore,
  faHome,
  faGamepad,
  faBaby,
  faEllipsisH,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

// Categories (unchanged)
const categories = [
  {
    name: 'Official Stores',
    icon: faStore,
    subcategories: [
      'Phones & Accessories (Samsung, Tecno, Infinix, iPhone, Fire/Nord, Oraimo)',
      'Electronics (Vitron, Vision Plus, TCL, Hisense, Mibrochoice)',
      'Appliances (Nunix, Ramtons, Hotpoint, Mika)',
      'Home (Solarmax, Nunix, Anyour, Reberry, Miniso)',
      'Health & Beauty (Garnier, Nivea, Maybelline, MAC, Nice & Lovely)',
      'Computing (Hp, Lenovo, Dell, Canon, Asus)',
      'Fashion (Adidas, Ecko Unltd)',
      'Baby Products (Huggies)',
      'Grocery (Coca Cola)',
    ],
  },

{
  name: 'Phones & Tablets',
  icon: faMobileAlt,
  subcategories: [
    'Mobile Phones (Smartphones, iOS Phones, Feature Phones, Smartphones under 10k, Feature phones under 2,000)',
    'Accessories (Bluetooth Headsets, Smart Watches, Cases & Sleeves, Portable Powerbanks, etc.)',
    'Tablets (Tablet Accessories, Tablet Bags & Covers)',
    'Top Smartphone Brands (Samsung, Xiaomi, Nokia, iPhone, Infinix, Huawei, Oppo)',
  ],
},
{
  name: 'TVs & Audio',
  icon: faTv,
  subcategories: ['LED TVs', 'Smart TVs', 'Home Theatre', 'Speakers', 'Sound Bars', 'DVD Players'],
},
{
  name: 'Appliances',
  icon: faLaptop,
  subcategories: ['Microwaves', 'Blenders', 'Mixers', 'Toasters', 'Vacuum Cleaners'],
},
{
  name: 'Health & Beauty',
  icon: faHeart,
  subcategories: ['Makeup', 'Skincare', 'Hair Care', 'Fragrances'],
},
{
  name: 'Home & Office',
  icon: faHome,
  subcategories: ['Furniture', 'Bedding', 'Decor', 'Office Supplies'],
},
{
  name: 'Fashion',
  icon: faTshirt,
  subcategories: ['Men', 'Women', 'Kids', 'Accessories'],
},
{
  name: 'Computing',
  icon: faLaptop,
  subcategories: ['Laptops', 'Desktops', 'Components', 'Accessories'],
},// Add other categories here...
];

// Sidebar Component (unchanged)
function Sidebar() {
  const [expanded, setExpanded] = useState({});

  const toggleCategory = (categoryName) => {
    setExpanded((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  return (
    <nav className="w-full md:w-64 bg-white shadow-xl rounded-lg p-4 transition-all duration-500 ease-in-out overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Categories</h2>
      <ul>
        {categories.map((category, index) => (
          <li key={index} className="mb-3">
            <button
              onClick={() => toggleCategory(category.name)}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors duration-200 focus:outline-none"
              aria-expanded={expanded[category.name] ? 'true' : 'false'}
            >
              <div className="flex items-center">
                <FontAwesomeIcon icon={category.icon} className="mr-3 text-blue-500" />
                <span className="font-medium text-gray-700">{category.name}</span>
              </div>
              <FontAwesomeIcon
                icon={expanded[category.name] ? faChevronUp : faChevronDown}
                className="text-gray-500"
              />
            </button>
            {expanded[category.name] && (
              <ul className="mt-2 ml-6 border-l border-gray-200 pl-4 transition-all duration-500 ease-in-out">
                {category.subcategories.map((sub, idx) => (
                  <li
                    key={idx}
                    className="py-1 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors duration-200"
                  >
                    {sub}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

// RecommendedProducts Component (unchanged)
function RecommendedProducts() {
  const images = [
    {
      src: 'https://img.freepik.com/free-vector/fashion-store-banner-template_1361-1248.jpg',
      alt: 'Flash Sale 1',
    },
    {
      src: 'https://www.shutterstock.com/image-vector/car-tires-shop-banner-discount-260nw-1785186701.jpg',
      alt: 'Flash Sale 2',
    },
    {
      src: 'https://www.foodandwine.com/thmb/wtSAc8XIifwjyd8BMFZbErAOyQc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/faw-product-breville-smart-rkilgore-44-c5a16502b0084c71aca178479399f2b8.jpg',
      alt: 'Flash Sale 3',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(intervalId);
  }, [images.length]);

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="relative mt-8 bg-white p-6 rounded-lg shadow-xl transition-transform duration-300 hover:scale-105">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Recommended Products</h2>
      <div className="relative w-full h-64 overflow-hidden rounded-lg">
        {images.map((image, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ))}
      </div>
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all duration-300"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all duration-300"
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
}

// ProductCard Component (updated)
const ProductCard = ({ product, onAddToCart, onWishlistToggle, isInWishlist, isRemovingFromWishlist }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image_url || 'https://via.placeholder.com/150'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-blue-600 font-bold mt-2">Ksh{product.price}</p>
        <div className="flex space-x-2 mt-4">
          {/* Add to Cart Button */}
          <button
            onClick={onAddToCart}
            className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Add to Cart
          </button>

          {/* Wishlist Toggle Button with Heart Icon */}
          <button
            onClick={onWishlistToggle}
            disabled={isRemovingFromWishlist}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
          >
{isInWishlist ? (
  <FontAwesomeIcon icon={faHeart} className="h-6 w-6 text-red-500" />
) : (
  <FontAwesomeIcon icon={regularHeart} className="h-6 w-6 text-gray-500" />
)}

          </button>
        </div>
      </div>
    </motion.div>
  );
};
// Home Component (updated)
function HomeImproved() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, isRemovingFromWishlist } = useWishlist();
  const { products, loading, error } = useProduct();
  const { wishlistItems } = useWishlist();
  const [mostSoldProducts, setMostSoldProducts] = useState([]);
  const [isLoadingMostSoldProducts, setIsLoadingMostSoldProducts] = useState(true);
  const [mostSoldProductsError, setMostSoldProductsError] = useState(null);

  // Fetch most sold products
  useEffect(() => {
    const fetchMostSoldProducts = async () => {
      try {
        const response = await fetch('https://unishop-fullstack.onrender.com/products/most-sold');
        if (!response.ok) {
          throw new Error('Failed to fetch most sold products');
        }
        const data = await response.json();
        setMostSoldProducts(data);
        setMostSoldProductsError(null);
      } catch (error) {
        console.error('Error fetching most sold products:', error);
        setMostSoldProductsError(error.message);
      } finally {
        setIsLoadingMostSoldProducts(false);
      }
    };
    fetchMostSoldProducts();
  }, []);

  // Redirect to shop or signin based on authentication
  const handleShopNow = () => {
    if (isAuthenticated) {
      navigate('/shop');
    } else {
      navigate('/signin');
    }
  };

  // Handle "Add to Cart" for featured products
  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      navigate('/signin');
    } else {
      addToCart(product);
      alert(`${product.name} added to cart!`);
    }
  };

  // Handle "Wishlist" toggle for featured products
  const handleWishlistToggle = (product) => {
    if (!isAuthenticated) {
      navigate('/signin');
    } else {
      if (isInWishlist(product.id)) {
        // Find the wishlist item ID corresponding to the product ID
        const wishlistItem = wishlistItems.find((item) => item.product_id === product.id);
        if (wishlistItem) {
          removeFromWishlist(wishlistItem.id); // Pass the wishlist item ID
        } else {
          console.error('Wishlist item not found for product:', product.id);
        }
      } else {
        addToWishlist(product);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Banner */}
        <section className="relative rounded-xl overflow-hidden">
          <img
            src="https://i.fbcd.co/products/original/cover-image-5ab7dfe09c8f35b3a3f31172bea3de8b10867d445e1a8ede691a7bd4c6ab779d.jpg"
            alt="Hero Banner"
            className="w-full h-96 object-cover transition-transform duration-500 ease-out hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
            <div className="ml-12 text-white transform transition-all duration-700 ease-in-out hover:scale-105">
              <h2 className="text-4xl font-bold mb-4">Summer Sale</h2>
              <p className="text-xl mb-6">Up to 50% off on selected items</p>
              <button
                onClick={handleShopNow}
                className="bg-blue-600 px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 animate-bounce"
                aria-label="Shop Now"
              >
                Shop Now
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-1/4">
            <Sidebar />
          </aside>
          {/* Main Content */}
          <section className="w-full md:w-3/4 space-y-6">
            <h1 className="text-4xl font-extrabold text-gray-800">Welcome to UniShop</h1>
            <p className="text-lg text-gray-600">
              Explore our extensive range of products and enjoy exclusive deals!
            </p>
            <RecommendedProducts />
          </section>
        </div>

        {/* Featured Products Section */}
        <section className="mt-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Featured Products</h2>
          {mostSoldProductsError ? (
            <div className="text-red-500 text-center my-4">
              Error fetching most sold products: {mostSoldProductsError}
            </div>
          ) : isLoadingMostSoldProducts ? (
            <div className="text-center my-4">Loading most sold products...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {mostSoldProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                  onWishlistToggle={() => handleWishlistToggle(product)}
                  isInWishlist={isInWishlist(product.id)}
                  isRemovingFromWishlist={isRemovingFromWishlist}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default HomeImproved;