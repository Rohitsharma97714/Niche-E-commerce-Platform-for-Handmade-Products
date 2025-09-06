import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiShield, FiCalendar, FiEdit, FiSave, FiX, FiLogOut } from 'react-icons/fi';

const ProfilePage = ({ darkMode }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          // Fetch updated user data from backend
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setUser(res.data);
        }
      } catch (err) {
        toast.error('Failed to load profile');
        // Fallback to stored user data
        setUser(JSON.parse(localStorage.getItem('user')));
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

  // Start editing profile
  const handleEditProfile = () => {
    setEditForm({ name: user.name, email: user.email });
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({ name: '', email: '' });
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    setUpdating(true);
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/profile`,
        editForm,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'} flex items-center justify-center`}>
        <div className="text-center">
          <FiUser size={48} className="mx-auto text-gray-400 mb-4" />
          <p>Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">👤 My Profile</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          {/* Profile Header */}
          <div className="flex items-center mb-8">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              <span className={`inline-block px-3 py-1 text-sm rounded-full font-medium mt-2 ${
                user.role === 'admin'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : user.role === 'artisan'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FiUser className="text-orange-500 mr-4" size={24} />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="font-semibold">{user.name}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FiMail className="text-orange-500 mr-4" size={24} />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email Address</p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter your email"
                    />
                  ) : (
                    <p className="font-semibold">{user.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FiShield className="text-orange-500 mr-4" size={24} />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Account Type</p>
                  <p className="font-semibold">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FiCalendar className="text-orange-500 mr-4" size={24} />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                  <p className="font-semibold">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Additional fields can be added here */}
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FiEdit className="text-orange-500 mr-4" size={24} />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                  <p className="font-semibold">
                    {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            {!isEditing ? (
              <>
                <button
                  onClick={handleEditProfile}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <FiEdit /> Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <FiLogOut /> Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveProfile}
                  disabled={updating}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FiSave /> {updating ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={updating}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FiX /> Cancel
                </button>
              </>
            )}
            <button
              onClick={() => window.location.href = '/update-password'}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Update Password
            </button>
            <button
              onClick={() => window.location.href = '/orders'}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
