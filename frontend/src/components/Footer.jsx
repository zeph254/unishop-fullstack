import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg m-4 p-6">
      <div className="w-full mx-auto max-w-screen-xl flex flex-col md:flex-row items-center justify-between">
        {/* Brand Section */}
        <span className="text-lg font-semibold">
          © 2024 <a href="https://unishop.com" className="hover:underline">UniShop™</a>. All Rights Reserved.
        </span>

        {/* Links Section */}
        <ul className="flex flex-wrap items-center mt-4 md:mt-0">
          <li className="mx-4">
            <a href="#" className="hover:underline">About</a>
          </li>
          <li className="mx-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
          </li>
          <li className="mx-4">
            <a href="#" className="hover:underline">Licensing</a>
          </li>
          <li className="mx-4">
            <a href="#" className="hover:underline">Contact</a>
          </li>
        </ul>

        {/* Social Media Links */}
        <div className="flex mt-4 md:mt-0 space-x-6 text-xl">
          <a href="#" className="hover:text-gray-200"><FaFacebook /></a>
          <a href="#" className="hover:text-gray-200"><FaTwitter /></a>
          <a href="#" className="hover:text-gray-200"><FaInstagram /></a>
          <a href="#" className="hover:text-gray-200"><FaLinkedin /></a>
        </div>
      </div>
    </footer>
  );
}
