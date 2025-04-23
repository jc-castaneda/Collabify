// Base API URL
const API_URL = "http://localhost:8000/api/";

// Auth token management
export const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const setAuthToken = (token) => {
  localStorage.setItem("token", token);
};

export const removeAuthToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

export const setRefreshToken = (token) => {
  localStorage.setItem("refreshToken", token);
};

export const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

// Helper function for making authenticated API requests
export const apiRequest = async (endpoint, method = "GET", data = null) => {
  const url = `${API_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || errorData.error || "An error occurred"
      );
    }

    // Some endpoints may not return JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return { success: true };
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Parse JWT token to extract payload
const parseJWT = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

// Authentication functions
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Handle specific error messages from backend
      if (errorData.error) {
        throw new Error(errorData.error);
      } else {
        throw new Error("Registration failed");
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || "Login failed");
    }

    const data = await response.json();
    setAuthToken(data.access);
    setRefreshToken(data.refresh);

    // Store user ID for future reference
    const userId = parseJWT(data.access).user_id;
    if (userId) {
      localStorage.setItem("userId", userId);
    }

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await apiRequest("logout/", "POST", { refresh: refreshToken });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Remove tokens even if the server call fails
    removeAuthToken();
    localStorage.removeItem("userId");
  }
};

// User data functions
export const fetchAllUsers = async () => {
  return apiRequest("all_users");
};

export const getUserInfo = async (userId) => {
  return apiRequest(`user_info/${userId}`);
};

// Friend management functions
export const sendFriendRequest = async (toUserId) => {
  const currentUserId = localStorage.getItem("userId");

  // Prevent sending request to self
  if (currentUserId === toUserId.toString()) {
    throw new Error("Cannot send friend request to yourself");
  }

  try {
    const response = await fetch(`${API_URL}update_friend/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        from: currentUserId,
        to: toUserId,
        action: "send",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send friend request");
    }

    return data;
  } catch (error) {
    console.error("Error sending friend request:", error);
    throw error;
  }
};

// Fetch friend requests sent to the current user
export const fetchFriendRequests = async () => {
  try {
    const response = await apiRequest("friend-requests/");
    return response;
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return [];
  }
};

// Fetch current friends
export const fetchFriends = async () => {
  try {
    const response = await apiRequest("friends/");
    return response;
  } catch (error) {
    console.error("Error fetching friends:", error);
    return [];
  }
};

// Accept a friend request
export const acceptFriendRequest = async (fromUserId) => {
  try {
    const currentUserId = localStorage.getItem("userId");
    if (!currentUserId) {
      throw new Error("User ID not found - please log in again");
    }

    // fromUserId is the user who sent the request
    // currentUserId is the current user accepting the request
    const response = await fetch(`${API_URL}update_friend/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        from: fromUserId, // This is the sender of the request
        to: currentUserId, // This is the current user accepting
        action: "accept",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Accept friend error response:", data);
      throw new Error(data.error || "Failed to accept friend request");
    }

    return data;
  } catch (error) {
    console.error("Error accepting friend request:", error);
    throw error;
  }
};

// Reject a friend request
export const rejectFriendRequest = async (fromUserId) => {
  try {
    const currentUserId = localStorage.getItem("userId");
    if (!currentUserId) {
      throw new Error("User ID not found - please log in again");
    }

    // fromUserId is the user who sent the request
    // currentUserId is the current user rejecting the request
    const response = await fetch(`${API_URL}update_friend/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        from: fromUserId, // This is the sender of the request
        to: currentUserId, // This is the current user rejecting
        action: "reject",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Reject friend error response:", data);
      throw new Error(data.error || "Failed to reject friend request");
    }

    return data;
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    throw error;
  }
};

export const removeFriend = async (friendId) => {
  const userId = localStorage.getItem("userId");
  return apiRequest("update_friend/", "POST", {
    from: userId,
    to: friendId,
    action: "remove",
  });
};

// Post functions
export const fetchPosts = async () => {
  return apiRequest("posts/");
};

export const fetchPostById = async (postId) => {
  return apiRequest(`posts/${postId}/`);
};

export const createPost = async (postData) => {
  const url = `${API_URL}posts/`;
  const token = getAuthToken();

  const headers = {
    Authorization: `Bearer ${token}`,
  };
  // Don't set Content-Type with FormData - browser will set it with boundary

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: postData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || errorData.error || "Failed to create post"
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// Add to your api.js file
export const updatePost = async (postId, postData) => {
  const url = `${API_URL}posts/${postId}/`;
  const token = getAuthToken();
  
  const headers = {
    "Authorization": `Bearer ${token}`
  };
  
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: postData // FormData object
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || "Failed to update post");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  return apiRequest(`posts/${postId}/`, "DELETE");
};

export const likePost = async (postId) => {
  return apiRequest(`posts/${postId}/like/`, "POST");
};

// Comment functions
export const fetchComments = async (postId) => {
  return apiRequest(`posts/${postId}/comments/`);
};

export const createComment = async (postId, commentData) => {
  return apiRequest(`posts/${postId}/comments/`, "POST", commentData);
};

// Get image URL with proper auth token
export const getPostImageUrl = (postId) => {
  return `${API_URL}posts/${postId}/image/`;
};

// Get song URL with proper auth token
export const getPostSongUrl = (postId) => {
  return `${API_URL}posts/${postId}/song/`;
};

// Use this for media files, which need direct fetch with auth headers
export const fetchWithAuth = async (url) => {
  const token = getAuthToken();
  
  const headers = {
    "Authorization": `Bearer ${token}`
  };
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    
    return response.blob();
  } catch (error) {
    console.error(`Fetch error:`, error);
    throw error;
  }
};

// Add these functions to api.js

// Get current user's profile information
export const fetchCurrentUserProfile = async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    throw new Error("User ID not found. Please log in again.");
  }
  return apiRequest(`user_info/${userId}`);
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    throw new Error("User ID not found. Please log in again.");
  }
  return apiRequest(`update_profile/${userId}`, "PUT", profileData);
};

// Get user's posts
export const fetchUserPosts = async (userId = null) => {
  const id = userId || localStorage.getItem("userId");
  if (!id) {
    throw new Error("User ID not found. Please log in again.");
  }
  return apiRequest(`user_posts/${id}`);
};

// Get all conversations for current user
export const fetchConversations = async () => {
  return apiRequest("conversations/");
};

// Get conversation details (messages) with a specific user
export const fetchMessages = async (userId) => {
  return apiRequest(`messages/${userId}/`);
};

// Send a message to a user
export const sendMessage = async (receiverId, content) => {
  return apiRequest(`messages/${receiverId}/`, "POST", {
    content: content
  });
};