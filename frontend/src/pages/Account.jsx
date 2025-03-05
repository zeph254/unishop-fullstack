import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

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
      let updatedProfile = { username: profileData.username }; // Start with only username
  
      // Include email only if it's different from the current email
      if (profileData.email !== user.email) {
        updatedProfile.email = profileData.email;
      }
  
      // Upload profile image if a new file is selected
      if (file) {
        console.log("File selected for upload:", file); // Debugging log
        const uploadData = await uploadProfilePicture(file);
        console.log("Upload response:", uploadData); // Debugging log
        updatedProfile.profile_image = uploadData.url;
      }
  
      console.log("Sending profile update:", updatedProfile); // Debugging log
  
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
        const response = await fetch(`http://127.0.0.1:5000/users/${user.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ user_id: user.id }), // If backend expects a body
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

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not authorized</div>;
  if (!user) return <div>User not found. Please log in again.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-3xl font-semibold text-gray-700 mb-6">Profile</h2>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="space-y-4">
        <div className="flex justify-between">
          <h3 className="text-xl font-medium text-gray-600">Username</h3>
          <p className="text-gray-800">{profileData.username}</p>
        </div>

        <div className="flex justify-between">
          <h3 className="text-xl font-medium text-gray-600">Email</h3>
          <p className="text-gray-800">{profileData.email}</p>
        </div>

        <div className="flex justify-between">
          <h3 className="text-xl font-medium text-gray-600">Profile Picture</h3>
          {profileData.profile_image ? (
            <img src={profileData.profile_image} alt="Profile" className="w-20 h-20 rounded-full" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600">No Image</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
        <button
          onClick={handleDeleteAccount}
          className="px-6 py-2 bg-red-600 text-white rounded-md"
        >
          Delete Account
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
            <input type="file" onChange={handleFileChange} className="mt-1 block w-full" />
          </div>
          <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-md">
            Save Changes
          </button>
        </form>
      )}
    </div>
  );
}