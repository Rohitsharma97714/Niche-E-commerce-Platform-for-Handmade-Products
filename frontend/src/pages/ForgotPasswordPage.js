import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/forgot-password`, { email });
      setSubmitted(true);
      toast.success("Reset link sent (if email exists)");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setSubmitted(true); // still show message even on failure
      toast.info("If this email exists, a reset link has been sent.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-pink-100 dark:from-gray-800 dark:to-gray-900 px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-orange-600 dark:text-orange-400 mb-2">Forgot Password</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Enter your email address and we'll send you a password reset link.
        </p>
        {submitted ? (
          <p className="text-green-600 dark:text-green-400 text-center">If this email exists, a reset link has been sent.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default ForgotPasswordPage;
