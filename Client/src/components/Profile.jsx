// Profile.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/user/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        setIsLoggedIn(true);
        setUser(data.data); // Assuming your API returns {success: true, data: user}
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Fetch error:", error.message);
      setIsLoggedIn(false);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/user-login");
  };

  return (
    <div className="p-4 text-gray-800">
      {loading ? (
        <p>Loading...</p>
      ) : !isLoggedIn ? (
        <>
          <p className="font-semibold">Hello User</p>
          <p className="text-sm text-gray-500 mb-2">To access your account</p>
          <button className="w-full bg-purple-700 text-white py-2 rounded-md mb-2 hover:bg-purple-800">
            <Link
              to="/user-login"
              className="flex items-center justify-center gap-2"
            >
              <span className="text-white font-semibold">Sign Up / Log In</span>
            </Link>
          </button>
          <Link
            to="/orders"
            className="block py-2 border-t border-gray-200 hover:text-purple-700"
          >
            My Orders
          </Link>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500">👤</span>
            </div>
            <div>
              <p className="font-semibold">{user?.name || "Welcome Back"}</p>
              <p className="text-sm text-gray-500">
                {user?.mobile || user?.email || "No contact info"}
              </p>
            </div>
          </div>
          <Link
            to="/orders"
            className="block py-2 border-t border-gray-200 hover:text-purple-700"
          >
            My Orders
          </Link>
          <Link
            to="/profile"
            className="block py-2 border-t border-gray-200 hover:text-purple-700"
          >
            My Profile
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left py-2 border-t border-gray-200 hover:text-purple-700"
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
}
