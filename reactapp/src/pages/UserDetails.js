import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserInfo, sendFriendRequest } from "../api";

function UserDetails() {
    const { id } = useParams(); 
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [requestSent, setRequestSent] = useState(false);
    const [requestExists, setRequestExists] = useState(false);
    const [isSelf, setIsSelf] = useState(false);
    
    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await getUserInfo(id);
                setUser(userData);
                
                // Check if this is the current user's profile
                const currentUserId = localStorage.getItem('userId');
                setIsSelf(currentUserId === id.toString());
                
                setLoading(false);
            } catch (err) {
                console.error("Error fetching user:", err);
                setError("Failed to load user details. Please try again later.");
                setLoading(false);
            }
        };
        
        loadUser();
    }, [id]);

    const handleSendRequest = async () => {
        if (requestSent || requestExists || isSelf) return;
        
        try {
            await sendFriendRequest(id);
            setRequestSent(true);
        } catch (err) {
            console.error("Error sending friend request:", err);
            
            // Check for duplicate request error
            if (err.message && err.message.includes("Duplicate request")) {
                setRequestExists(true);
            } else {
                // Show generic error alert for other errors
                alert("Failed to send friend request: " + (err.message || "Unknown error"));
            }
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading user details...</div>;
    if (error) return <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>{error}</div>;
    if (!user) return <div style={{ textAlign: 'center', padding: '40px' }}>User not found</div>;

    return (
        <div style={{ maxWidth: '700px', margin: '20px auto', padding: '0 20px' }}>
            <div style={{
              background: 'white',
              borderRadius: '10px',
              padding: '30px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ marginBottom: '20px' }}>{user.username}</h1>
                
                <div style={{ marginBottom: '20px' }}>
                    <strong>User Type:</strong>{' '}
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      background: user.user_type === "1" ? 'linear-gradient(135deg, #5a31e6, #8254e5)' : 
                                user.user_type === "2" ? 'linear-gradient(135deg, #784be8, #b344db)' : 
                                'linear-gradient(135deg, #c837db, #f56040)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                        {user.user_type === "1" ? "Producer" : 
                        user.user_type === "2" ? "Musician" : 
                        user.user_type === "3" ? "Singer" : user.user_type}
                    </span>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '8px' }}>Bio</h3>
                    <p>{user.bio || "No bio provided"}</p>
                </div>
                
                {/* Rest of the component remains the same */}
                
                <div style={{ marginTop: '30px' }}>
                    {!isSelf ? (
                        <button 
                            onClick={handleSendRequest}
                            disabled={requestSent || requestExists}
                            style={{
                                padding: '10px 20px',
                                background: (requestSent || requestExists) ? '#ccc' : 'linear-gradient(to right, #5a31e6, #f56040)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: (requestSent || requestExists) ? 'default' : 'pointer',
                                marginRight: '15px'
                            }}
                        >
                            {requestSent ? "Friend Request Sent" : 
                             requestExists ? "Request Already Sent" : 
                             "Add Friend"}
                        </button>
                    ) : (
                        <span style={{ color: '#666', marginRight: '15px' }}>This is your profile</span>
                    )}
                    
                    <Link 
                        to="/users"
                        style={{
                            display: 'inline-block',
                            padding: '10px 20px',
                            background: '#f5f5f7',
                            color: '#333',
                            borderRadius: '5px',
                            textDecoration: 'none'
                        }}
                    >
                        Back to Users
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default UserDetails;