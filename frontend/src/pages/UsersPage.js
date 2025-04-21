import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllUsers } from "../api";

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await fetchAllUsers();
                setUsers(data.users || []);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError("Failed to load users. Please try again later.");
                setLoading(false);
            }
        };
        
        loadUsers();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading users...</div>;
    if (error) return <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>{error}</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '20px auto', padding: '0 20px' }}>
            <h1 style={{ marginBottom: '20px', textAlign: 'center' }}>Members</h1>
            {users.length === 0 ? (
                <p style={{ textAlign: 'center' }}>No users found.</p>
            ) : (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '20px'
                }}>
                    {users.map((user) => (
                        <div key={user.id} style={{
                          background: 'white',
                          borderRadius: '10px',
                          padding: '20px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                          transition: 'transform 0.3s',
                          ':hover': { transform: 'translateY(-5px)' }
                        }}>
                            <h3 style={{ marginBottom: '10px' }}>{user.username}</h3>
                            <Link 
                              to={`/users/details/${user.id}`}
                              style={{
                                display: 'inline-block',
                                padding: '8px 16px',
                                background: 'linear-gradient(to right, #5a31e6, #f56040)',
                                color: 'white',
                                borderRadius: '5px',
                                textDecoration: 'none',
                                marginTop: '10px'
                              }}
                            >
                              View Profile
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default UsersPage;