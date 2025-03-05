import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faSignInAlt,
  faUserCircle,
  faListAlt,
  faHeart,
  faQuestionCircle,
  faLifeRing,
  faShoppingBag,
  faCreditCard,
  faTruck,
  faUndo,
  faShieldAlt,
  faComments,
  faShoppingCart,
  faChevronDown,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../context/UserContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-black text-white shadow-lg">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 text-2xl font-extrabold tracking-wider">
            <Link to="/" className="flex items-center space-x-2 hover:text-gray-400">
              <span className="text-blue-500">Uni</span>
              <span className="text-purple-500">Shop</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {/* Show Admin Dashboard only for Admin */}
            {user?.role === 'admin' ? (
              <Link to="/admin" className="hover:text-red-400">Admin Dashboard</Link>
            ) : (
              <>
                {/* Show regular links for non-admin users */}
                <Link to="/orders" className="hover:text-blue-400">Orders</Link>
                <Link to="/shop" className="hover:text-blue-400">Shop</Link>
                <Link to="/wishlist" className="hover:text-purple-400">Wishlist</Link>
              </>
            )}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-6">
            {/* Show Help and Cart only for non-admin users */}
            {user?.role !== 'admin' && (
              <>
                {/* Help Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-1 focus:outline-none">
                    <FontAwesomeIcon icon={faQuestionCircle} className="text-white" />
                    <span>Help</span>
                    <FontAwesomeIcon icon={faChevronDown} />
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800 text-white border border-gray-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 z-50">
                    <ul className="py-2">
                      <li>
                        <Link to="/help-center" className="block px-4 py-2 hover:bg-gray-700">Help Center</Link>
                      </li>
                      <li>
                        <Link to="/livechat" className="block px-4 py-2 hover:bg-gray-700">Live Chat</Link>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Cart */}
                <Link to="/cart" className="flex items-center hover:text-blue-400">
                  <FontAwesomeIcon icon={faShoppingCart} className="text-white" />
                  <span className="ml-1">Cart</span>
                </Link>
              </>
            )}

            {/* Account Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-1 focus:outline-none">
                <FontAwesomeIcon icon={faUser} className="text-white" />
                <span>Account</span>
                <FontAwesomeIcon icon={faChevronDown} />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white border border-gray-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 z-50">
                <ul className="py-2">
                  {!isAuthenticated ? (
                    <>
                      <li>
                        <Link to="/signin" className="block px-4 py-2 hover:bg-gray-700">Sign Up</Link>
                      </li>
                      <li>
                        <Link to="/login" className="block px-4 py-2 hover:bg-gray-700">Login</Link>
                      </li>
                    </>
                  ) : (
                    <>
                      {user?.role !== 'admin' && (
                        <li>
                          <Link to="/account" className="block px-4 py-2 hover:bg-gray-700">My Account</Link>
                        </li>
                      )}
                      <li>
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-700">Logout</button>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}