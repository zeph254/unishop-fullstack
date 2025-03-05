import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from "../context/UserContext";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    repeatPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useUser();
  const navigate = useNavigate(); // ✅ Moved useNavigate here

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.repeatPassword) {
      newErrors.repeatPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach(msg => toast.error(msg));
      return;
    }
    setIsLoading(true);
    try {
      const response = await register(formData.username, formData.email, formData.password);
      if (response) {
        toast.success('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  function signUpWithGoogle(token) {
    console.log("Sign up token:", token);

    const decoded = jwtDecode(token);
    register(decoded.given_name, decoded.email, formData.password);

    console.log(decoded);

    // Redirect to login page
    navigate("/login"); // ✅ Now works correctly
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 to-gray-100">
      <div className="w-full max-w-lg p-8 transform transition-all duration-500 hover:scale-[1.02]">
        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100"
        >
          <h3 className="text-3xl mb-6 font-bold text-center bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Create Account
          </h3>

          {[
            { name: 'username', label: 'Username', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'password', label: 'Password', type: 'password' },
            { name: 'repeatPassword', label: 'Repeat Password', type: 'password' }
          ].map((field) => (
            <div key={field.name} className="mb-6">
              <label className="block mb-2 text-gray-700 text-sm font-semibold">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={`Enter ${field.label}`}
                className={`w-full h-12 px-5 py-2 border ${
                  errors[field.name] ? 'border-red-500' : 'border-gray-200'
                } rounded-xl placeholder-gray-400 text-gray-800 transition-all duration-300 
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                hover:border-orange-300`}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 
            rounded-xl text-white font-semibold
            transform transition-all duration-300
            hover:from-orange-600 hover:to-red-600
            hover:shadow-lg hover:-translate-y-0.5
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isLoading ? 'animate-pulse' : ''}`}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <div className="text-center text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-orange-500 font-medium hover:text-orange-600 transition-colors duration-300"
            >
              Log in
            </Link>
          </div>
        </form>
        <div className="mt-4 text-center">
          <GoogleLogin
            onSuccess={credentialResponse => {
              signUpWithGoogle(credentialResponse.credential);
            }}
            onError={() => {
              console.log('Google Sign-In Failed');
              toast.error("Google Sign-In Failed. Please try again.");
            }}
            useOneTap
          />
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
