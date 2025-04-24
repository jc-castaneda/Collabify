import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllUsers } from "../api";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAllUsers();
        setUsers(data.users || []);
      } catch (e) {
        console.error("Error fetching users:", e);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return <div style={{ textAlign: "center", padding: "40px" }}>Loading users...</div>;
  if (error)
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "red" }}>
        {error}
      </div>
    );

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto", padding: "0 20px" }}>
      <h1 style={{ marginBottom: "20px", textAlign: "center" }}>Members</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {users.length === 0 ? (
          <p style={{ textAlign: "center" }}>No users found.</p>
        ) : (
          users.map((u) => (
            <div
              key={u.id}
              style={{
                background: "white",
                borderRadius: "10px",
                padding: "20px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                textAlign: "center",
              }}
            >
              {u.profile_picture ? (
                <img
                  src={u.profile_picture}
                  alt={u.username}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginBottom: "10px",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #5a31e6, #f56040)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    margin: "0 auto 10px",
                  }}
                >
                  {u.username.charAt(0).toUpperCase()}
                </div>
              )}
              <h3 style={{ marginBottom: "10px" }}>{u.username}</h3>
              <Link
                to={`/users/details/${u.id}`}
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  background: "linear-gradient(to right, #5a31e6, #f56040)",
                  color: "white",
                  borderRadius: "5px",
                  textDecoration: "none",
                }}
              >
                View Profile
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UsersPage;
