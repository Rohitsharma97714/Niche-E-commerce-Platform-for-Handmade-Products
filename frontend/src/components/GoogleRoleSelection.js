import React from 'react';
import { FaGoogle } from 'react-icons/fa';

const GoogleRoleSelection = ({ onRoleSelect }) => {
  const handleGoogleLogin = () => {
    // Use BACKEND_URL instead of API_URL
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleGoogleLogin}
        className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded font-semibold transition hover:bg-gray-50 flex items-center justify-center gap-2"
      >
        <FaGoogle className="text-red-500" />
        Sign in with Google (for customers only)
      </button>
    </div>
  );
};

export default GoogleRoleSelection;
