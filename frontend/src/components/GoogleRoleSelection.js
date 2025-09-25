import React from 'react';
import { FaGoogle } from 'react-icons/fa';

const GoogleRoleSelection = ({ onRoleSelect }) => {
  const handleGoogleLogin = () => {
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    // Remove trailing slash and ensure proper URL construction
    const baseUrl = backendUrl.replace(/\/$/, '');
    // If the base URL already includes /api, don't add it again
    const apiPath = baseUrl.includes('/api') ? '/auth/google' : '/api/auth/google';
    window.location.href = `${baseUrl}${apiPath}`;
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleGoogleLogin}
        className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded font-semibold transition hover:bg-gray-50 flex items-center justify-center gap-2"
      >
        <FaGoogle className="text-red-500" />
        Sign in with Google
      </button>
    </div>
  );
};

export default GoogleRoleSelection;
