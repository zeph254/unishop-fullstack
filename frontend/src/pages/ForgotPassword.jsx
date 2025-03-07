import { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous messages

    try {
      const response = await fetch("https://unishop-fullstack-1.onrender.com/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("A reset link has been sent to your email.");
        alert("Success! Check your email for the reset link.");
      } else {
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setMessage("Network error. Please check your connection.");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Forgot Password
        </h2>
        <p className="text-gray-500 text-sm text-center mb-4">
          Enter your email, and we'll send you a reset link.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 text-sm text-center ${
              message.includes("error") || message.includes("wrong")
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
