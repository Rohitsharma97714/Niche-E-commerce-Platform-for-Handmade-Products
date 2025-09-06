import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import '../index.css';
import { useNavigate } from "react-router-dom";

const UpdatePasswordPage = ({ darkMode }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Get token and user email from localStorage
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let email = "";

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      email = user?.email || "";
    } catch {
      email = "";
    }
  }

  const getPasswordError = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(password)) return 'Must include at least one uppercase letter.';
    if (!/[a-z]/.test(password)) return 'Must include at least one lowercase letter.';
    if (!/\d/.test(password)) return 'Must include at least one number.';
    if (!/[\W_]/.test(password)) return 'Must include at least one special character.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("You are not logged in. Please log in again.");
      return;
    }

    const passwordError = getPasswordError(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/update-password`,
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.message === 'Password updated successfully') {
        setSuccess(true);
        toast.success('Password updated successfully!');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        toast.error(response.data.message || 'Password update failed');
      }
    } catch (err) {
      console.error("Password update failed", err);
      toast.error(err.response?.data?.message || 'Password update failed. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-100 to-pink-100'}`}>
      <div className={`shadow-lg rounded-lg p-8 w-full ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold text-center mb-4 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>Update Password 🔐</h2>

        {email && (
          <input
            type="email"
            value={email}
            readOnly
            className={`w-full px-4 py-2 border rounded cursor-not-allowed mb-4 ${darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700'}`}
          />
        )}

        {success ? (
          <p className={`text-center font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>Password updated successfully!</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                placeholder="Current Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
              />
              <span
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-2.5 cursor-pointer text-lg"
              >
                {showOld ? '🙈' : '👁️'}
              </span>
            </div>

            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
              />
              <span
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 cursor-pointer text-lg"
              >
                {showNew ? '🙈' : '👁️'}
              </span>
            </div>

            {newPassword && getPasswordError(newPassword) && (
              <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{getPasswordError(newPassword)}</p>
            )}

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-semibold transition"
            >
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
