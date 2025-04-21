import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  fetchFriendRequests,
  fetchFriends,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from "../api";

function FriendsPage() {
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("requests");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [requestsData, friendsData] = await Promise.all([
          fetchFriendRequests(),
          fetchFriends(),
        ]);

        setFriendRequests(requestsData || []);
        setFriends(friendsData || []);
        setLoading(false);
      } catch (error) {
        console.error("Error loading friend data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAcceptRequest = async (fromUserId) => {
    try {
      console.log("Accepting request from user:", fromUserId);
      const response = await acceptFriendRequest(fromUserId);
      console.log("Accept response:", response);
      
      if (response.status === "Success") {
        // Find the accepted request user
        const acceptedRequest = friendRequests.find(req => req.from.id === fromUserId);
        
        // Remove from pending requests
        setFriendRequests(prevRequests => 
          prevRequests.filter(request => request.from.id !== fromUserId)
        );
        
        // Add to friends list if request found
        if (acceptedRequest) {
          setFriends(prevFriends => [...prevFriends, acceptedRequest.from]);
        }
        
        showNotification("Friend request accepted!");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      showNotification("Failed to accept request: " + (error.message || "Unknown error"), true);
    }
  };

  const handleRejectRequest = async (fromUserId) => {
    try {
      const response = await rejectFriendRequest(fromUserId);
      if (response.status === "Success") {
        // Update the UI by removing the rejected request
        setFriendRequests((prevRequests) =>
          prevRequests.filter((request) => request.from.id !== fromUserId)
        );
        showNotification("Friend request rejected");
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      showNotification("Failed to reject request", true);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      const response = await removeFriend(friendId);
      if (response.status === "Success") {
        // Update the UI by removing the friend
        setFriends((prevFriends) =>
          prevFriends.filter((friend) => friend.id !== friendId)
        );
        showNotification("Friend removed");
      }
    } catch (error) {
      console.error("Error removing friend:", error);
      showNotification("Failed to remove friend", true);
    }
  };

  const showNotification = (message, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        Loading your connections...
      </div>
    );

  const renderUserTypeTag = (userType) => {
    const types = {
      1: "Producer",
      2: "Musician",
      3: "Singer",
    };

    const backgrounds = {
      1: "linear-gradient(135deg, #5a31e6, #8254e5)",
      2: "linear-gradient(135deg, #784be8, #b344db)",
      3: "linear-gradient(135deg, #c837db, #f56040)",
    };

    return (
      <span
        style={{
          display: "inline-block",
          padding: "4px 10px",
          borderRadius: "20px",
          background: backgrounds[userType],
          color: "white",
          fontSize: "12px",
          fontWeight: "500",
        }}
      >
        {types[userType] || "User"}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      {notification && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "12px 20px",
            borderRadius: "8px",
            color: "white",
            fontWeight: "500",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            background: notification.isError
              ? "linear-gradient(to right, #e74c3c, #c0392b)"
              : "linear-gradient(to right, #5a31e6, #f56040)",
          }}
        >
          {notification.message}
        </div>
      )}

      <div
        style={{
          display: "flex",
          marginBottom: "25px",
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
        }}
      >
        <button
          onClick={() => setActiveTab("requests")}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: activeTab === "requests" ? "600" : "500",
            background: "none",
            border: "none",
            cursor: "pointer",
            position: "relative",
            color: activeTab === "requests" ? "#1d1d1f" : "#86868b",
          }}
        >
          Friend Requests
          {friendRequests.length > 0 && (
            <span
              style={{
                background: "linear-gradient(to right, #5a31e6, #f56040)",
                color: "white",
                borderRadius: "12px",
                padding: "2px 8px",
                fontSize: "12px",
                fontWeight: "500",
                marginLeft: "8px",
              }}
            >
              {friendRequests.length}
            </span>
          )}
          {activeTab === "requests" && (
            <div
              style={{
                position: "absolute",
                bottom: "-1px",
                left: 0,
                right: 0,
                height: "3px",
                background: "linear-gradient(to right, #5a31e6, #f56040)",
                borderRadius: "3px 3px 0 0",
              }}
            ></div>
          )}
        </button>

        <button
          onClick={() => setActiveTab("friends")}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: activeTab === "friends" ? "600" : "500",
            background: "none",
            border: "none",
            cursor: "pointer",
            position: "relative",
            color: activeTab === "friends" ? "#1d1d1f" : "#86868b",
          }}
        >
          Friends
          {activeTab === "friends" && (
            <div
              style={{
                position: "absolute",
                bottom: "-1px",
                left: 0,
                right: 0,
                height: "3px",
                background: "linear-gradient(to right, #5a31e6, #f56040)",
                borderRadius: "3px 3px 0 0",
              }}
            ></div>
          )}
        </button>
      </div>

      {activeTab === "requests" && (
        <div>
          <h2 style={{ marginBottom: "20px" }}>Friend Requests</h2>
          {friendRequests.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#86868b",
                fontStyle: "italic",
                padding: "40px 20px",
              }}
            >
              You don't have any pending friend requests
            </div>
          ) : (
            friendRequests.map((request) => (
              <div
                key={request.from.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "20px",
                  marginBottom: "16px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  backgroundColor: "white",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 8px 0" }}>
                    {request.from.username}
                  </h3>
                  {renderUserTypeTag(request.from.user_type)}
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => handleAcceptRequest(request.from.id)}
                    style={{
                      padding: "10px 18px",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                      background: "linear-gradient(to right, #5a31e6, #f56040)",
                      color: "white",
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.from.id)}
                    style={{
                      padding: "10px 18px",
                      backgroundColor: "transparent",
                      color: "#86868b",
                      border: "1px solid #86868b",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "friends" && (
        <div>
          <h2 style={{ marginBottom: "20px" }}>Your Friends</h2>
          {friends.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#86868b",
                fontStyle: "italic",
                padding: "40px 20px",
              }}
            >
              You don't have any friends yet
            </div>
          ) : (
            friends.map((friend) => (
              <div
                key={friend.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "20px",
                  marginBottom: "16px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  backgroundColor: "white",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 8px 0" }}>{friend.username}</h3>
                  {renderUserTypeTag(friend.user_type)}
                  {friend.bio && (
                    <p style={{ color: "#86868b", margin: "8px 0" }}>
                      {friend.bio}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <Link
                    to={`/messages?id=${friend.id}`}
                    style={{
                      padding: "10px 18px",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                      background: "linear-gradient(to right, #5a31e6, #f56040)",
                      color: "white",
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    Message
                  </Link>
                  <Link
                    to={`/users/details/${friend.id}`}
                    style={{
                      padding: "10px 18px",
                      backgroundColor: "#f5f5f7",
                      color: "#1d1d1f",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => handleRemoveFriend(friend.id)}
                    style={{
                      padding: "10px 18px",
                      backgroundColor: "transparent",
                      color: "#86868b",
                      border: "1px solid #86868b",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default FriendsPage;
