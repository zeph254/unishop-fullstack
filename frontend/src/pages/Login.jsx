import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaGoogle, FaGithub } from "react-icons/fa";
import { useUser } from '../context/UserContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

// Update your component to:
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, login_with_google } = useUser(); // Import login_with_google from context
  const navigate = useNavigate();
  
  // Then update your handleGoogleLogin function:
  
  // Handle form login
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      if (response) {
        toast.success("Login successful!");
        navigate('/');
      }
    } catch (error) {
      toast.error(error.message || "Login failed");
    }
  };

  // Handle Google Login response
  // To this:
  const handleGoogleLogin = (credential) => {
    try {
      const user_details = jwtDecode(credential);
      console.log("Decoded Google token:", user_details); // Add this for debugging
      
      login_with_google(user_details.email)
        .then((response) => {
          toast.success("Google login successful!");
          navigate('/');
        })
        .catch((error) => {
          console.error("Google login error:", error);
          toast.error(error.message || "Google login failed");
        });
    } catch (error) {
      console.error("Failed to decode Google token:", error);
      toast.error("Failed to process Google login");
    }
  };
  // Function to authenticate user via Google email
  // const loginWithGoogle = async (email) => {
  //   try {
  //     const response = await fetch("https://unishop-fullstack.onrender.com/api/auth/google-login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email }),
  //     });

  //     const data = await response.json();
  //     if (response.ok) {
  //       toast.success("Google login successful!");
  //       navigate('/');
  //     } else {
  //       throw new Error(data.message || "Google login failed");
  //     }
  //   } catch (error) {
  //     console.error("Google login error:", error);
  //     toast.error(error.message);
  //   }
  // };

  // Handle GitHub login
  const handleGitHubLogin = () => {
    window.location.href = "https://unishop-fullstack.onrender.com/api/auth/github";
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <form
        onSubmit={handleSubmit}
        className="w-[40%] bg-white p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-2xl my-4 font-bold font-mono text-center">Login</h3>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            placeholder="Enter Email"
            required
            aria-label="Email Address"
          />
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <label className="block text-gray-600 text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            placeholder="Password"
            required
            aria-label="Password"
          />
        </div>

        {/* Forgot Password Link */}
        <div className="text-right mb-4">
          <Link to="/forgot-password" className="text-orange-500 hover:underline">
            Forgot Password?
          </Link>
        </div>

        {/* Sign in Button */}
        <button
          type="submit"
          className="w-full h-12 bg-orange-600 hover:bg-orange-800 transition-all duration-700 rounded-lg text-white text-base font-semibold mb-4"
          aria-label="Sign in"
        >
          Sign in
        </button>

        {/* OR Divider */}
        <div className="flex items-center my-4">
          <div className="border-b border-gray-300 w-full"></div>
          <span className="px-2 text-gray-500 text-sm">OR</span>
          <div className="border-b border-gray-300 w-full"></div>
        </div>

        {/* Google Login Button */}
        <GoogleLogin
  onSuccess={(credentialResponse) => { 
    handleGoogleLogin(credentialResponse.credential)
  }}
  onError={() => {toast.error("Google login failed")}}
/>

        {/* GitHub Login */}
        {/* <button
          type="button"
          onClick={handleGitHubLogin}
          className="flex items-center justify-center w-full h-12 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-all"
          aria-label="Sign in with GitHub"
        >
          <FaGithub className="text-black mr-2" /> Sign in with GitHub
        </button> */}

        {/* Register Link */}
        <div className="text-center mt-4">
          Not yet registered? <Link to="/signin" className="text-orange-500">Register</Link>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}
