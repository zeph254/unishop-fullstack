import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faImage, faSave, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function ProfilePage() {
  const { user, isAuthenticated, loading, logout, updateProfile, uploadProfilePicture, fetchUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    profile_image: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Initialize profileData when user is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        profile_image: user.profile_image || null,
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');

    if (!user || !user.id) {
      setError("User is not defined or does not have an ID");
      return;
    }

    try {
      let updatedProfile = { username: profileData.username };

      // Include email only if it's different from the current email
      if (profileData.email !== user.email) {
        updatedProfile.email = profileData.email;
      }

      // Upload profile image if a new file is selected
      if (file) {
        const uploadData = await uploadProfilePicture(file);
        updatedProfile.profile_image = uploadData.url;
      }

      const updateResponse = await updateProfile(updatedProfile);

      if (updateResponse) {
        setIsEditing(false);
        await fetchUser(); // Refresh user details
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setError("Failed to update profile. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setError("No file selected.");
      return;
    }

    // Check file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Invalid file type. Allowed: png, jpg, jpeg, gif");
      return;
    }

    setFile(selectedFile);
  };

  const handleDeleteAccount = async () => {
    if (!user || !user.id) {
      setError("User information is not available. Please try logging in again.");
      return;
    }

    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        const response = await fetch(`https://unishop-fullstack.onrender.com/users/${user.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ user_id: user.id }),
        });

        if (response.ok) {
          logout();
          navigate('/signin');
        } else {
          throw new Error("Account deletion failed");
        }
      } catch (error) {
        console.error("Account deletion error:", error);
        setError("Failed to delete account. Please try again.");
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!isAuthenticated) return <div className="flex justify-center items-center h-screen">Not authorized</div>;
  if (!user) return <div className="flex justify-center items-center h-screen">User not found. Please log in again.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-r from-purple-50 to-blue-50 shadow-2xl rounded-xl mt-10">
      <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">Profile</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <FontAwesomeIcon icon={faUser} className="text-2xl text-purple-600" />
            <h3 className="text-xl font-medium text-gray-700">Username</h3>
          </div>
          <p className="text-gray-800 font-semibold">{profileData.username}</p>
        </div>

        <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <FontAwesomeIcon icon={faEnvelope} className="text-2xl text-blue-600" />
            <h3 className="text-xl font-medium text-gray-700">Email</h3>
          </div>
          <p className="text-gray-800 font-semibold">{profileData.email}</p>
        </div>

        <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <FontAwesomeIcon icon={faImage} className="text-2xl text-green-600" />
            <h3 className="text-xl font-medium text-gray-700">Profile Picture</h3>
          </div>
          {profileData.profile_image ? (
            <img src={profileData.profile_image} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
        >
          {isEditing ? (
            <>
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              Cancel
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Edit Profile
            </>
          )}
        </button>
        <button
          onClick={handleDeleteAccount}
          className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all"
        >
          <FontAwesomeIcon icon={faTrash} className="mr-2" />
          Delete Account
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleUpdateProfile} className="mt-8 space-y-6 p-6 bg-white rounded-lg shadow-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all"
          >
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            Save Changes
          </button>
        </form>
      )}
    </div>
  );
}