import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  fetchFriendRequests,
  fetchFriends,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from "../api";
import "../styles/PostCard.css"; // gives us .creator-avatar

function FriendsPage() {
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("requests");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [reqs, fnds] = await Promise.all([
          fetchFriendRequests(),
          fetchFriends(),
        ]);
        setFriendRequests(reqs || []);
        setFriends(fnds || []);
      } catch (e) {
        console.error("Error loading friends:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const showNotification = (msg, isErr = false) => {
    setNotification({ msg, isErr });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAccept = async (id) => {
    try {
      const res = await acceptFriendRequest(id);
      if (res.status === "Success") {
        const accepted = friendRequests.find((r) => r.from.id === id);
        setFriendRequests((prev) =>
          prev.filter((r) => r.from.id !== id)
        );
        if (accepted) setFriends((prev) => [...prev, accepted.from]);
        showNotification("Friend request accepted!");
      }
    } catch (e) {
      console.error(e);
      showNotification("Couldn’t accept request", true);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await rejectFriendRequest(id);
      if (res.status === "Success") {
        setFriendRequests((prev) =>
          prev.filter((r) => r.from.id !== id)
        );
        showNotification("Friend request rejected");
      }
    } catch (e) {
      console.error(e);
      showNotification("Couldn’t reject request", true);
    }
  };

  const handleRemove = async (id) => {
    try {
      const res = await removeFriend(id);
      if (res.status === "Success") {
        setFriends((prev) => prev.filter((f) => f.id !== id));
        showNotification("Friend removed");
      }
    } catch (e) {
      console.error(e);
      showNotification("Couldn’t remove friend", true);
    }
  };

  const renderTag = (t) => {
    const m = { 1: "Producer", 2: "Musician", 3: "Singer" };
    const bg = {
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
          background: bg[t],
          color: "white",
          fontSize: "12px",
          fontWeight: "500",
        }}
      >
        {m[t] || "User"}
      </span>
    );
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        Loading your connections...
      </div>
    );

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
            background: notification.isErr
              ? "linear-gradient(to right, #e74c3c, #c0392b)"
              : "linear-gradient(to right, #5a31e6, #f56040)",
            fontWeight: "500",
            zIndex: 1000,
          }}
        >
          {notification.msg}
        </div>
      )}

      <div
        style={{
          display: "flex",
          marginBottom: "25px",
          borderBottom: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <button
          onClick={() => setActiveTab("requests")}
          style={{
            padding: "12px 24px",
            fontWeight: activeTab === "requests" ? "600" : "500",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: activeTab === "requests" ? "#1d1d1f" : "#86868b",
            position: "relative",
          }}
        >
          Friend Requests
          {friendRequests.length > 0 && (
            <span
              style={{
                marginLeft: "8px",
                background: "linear-gradient(to right, #5a31e6, #f56040)",
                color: "white",
                borderRadius: "12px",
                padding: "2px 8px",
                fontSize: "12px",
                fontWeight: "500",
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
              }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("friends")}
          style={{
            padding: "12px 24px",
            fontWeight: activeTab === "friends" ? "600" : "500",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: activeTab === "friends" ? "#1d1d1f" : "#86868b",
            position: "relative",
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
              }}
            />
          )}
        </button>
      </div>

      {activeTab === "requests" ? (
        friendRequests.length === 0 ? (
          <div style={{ textAlign: "center", color: "#86868b", fontStyle: "italic", padding: "40px 20px" }}>
            You don’t have any pending requests
          </div>
        ) : (
          friendRequests.map((r) => (
            <div
              key={r.from.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px",
                marginBottom: "16px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                backgroundColor: "white",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {r.from.profile_picture ? (
                  <img
                    src={r.from.profile_picture}
                    alt={r.from.username}
                    className="creator-avatar"
                  />
                ) : (
                  <div className="creator-avatar">
                    {r.from.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 style={{ margin: 0 }}>{r.from.username}</h3>
                  {renderTag(r.from.user_type)}
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => handleAccept(r.from.id)}
                  style={{
                    padding: "10px 18px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    background: "linear-gradient(to right, #5a31e6, #f56040)",
                    color: "white",
                  }}
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(r.from.id)}
                  style={{
                    padding: "10px 18px",
                    border: "1px solid #86868b",
                    borderRadius: "8px",
                    cursor: "pointer",
                    color: "#86868b",
                    background: "transparent",
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )
      ) : friends.length === 0 ? (
        <div style={{ textAlign: "center", color: "#86868b", fontStyle: "italic", padding: "40px 20px" }}>
          You don’t have any friends yet
        </div>
      ) : (
        friends.map((f) => (
          <div
            key={f.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px",
              marginBottom: "16px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              backgroundColor: "white",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {f.profile_picture ? (
                <img
                  src={f.profile_picture}
                  alt={f.username}
                  className="creator-avatar"
                />
              ) : (
                <div className="creator-avatar">
                  {f.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 style={{ margin: 0 }}>{f.username}</h3>
                {renderTag(f.user_type)}
                {f.bio && (
                  <p style={{ color: "#86868b", margin: "8px 0" }}>{f.bio}</p>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <Link
                to={`/messages?id=${f.id}`}
                style={{
                  padding: "10px 18px",
                  borderRadius: "8px",
                  background: "linear-gradient(to right, #5a31e6, #f56040)",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                Message
              </Link>
              <Link
                to={`/users/details/${f.id}`}
                style={{
                  padding: "10px 18px",
                  borderRadius: "8px",
                  background: "#f5f5f7",
                  color: "#1d1d1f",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                View Profile
              </Link>
              <button
                onClick={() => handleRemove(f.id)}
                style={{
                  padding: "10px 18px",
                  border: "1px solid #86868b",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#86868b",
                  background: "transparent",
                  fontWeight: "600",
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default FriendsPage;
