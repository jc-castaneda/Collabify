import React, { useEffect, useState } from "react";
import { fetchProfiles } from "../api.js";
import "../styles/ProfileList.css";

const ProfileList = () => {
    const [profiles, setProfiles] = useState([]);  
    const [loading, setLoading] = useState(true);  
    const [error, setError] = useState(null);  

    useEffect(() => {
        const loadProfiles = async () => {
            try {
                const data = await fetchProfiles();
                setProfiles(data || []); // Ensure we always have an array even if data is undefined
                setLoading(false);  
            } catch (err) {
                console.error("Failed to load profiles:", err);
                setError("Failed to load profiles. Please try again later.");  
                setLoading(false);
            }
        };
        loadProfiles();
    }, []); 

    if (loading) return <div className="profiles-loading">Loading profiles...</div>;
    if (error) return <div className="profiles-error">{error}</div>;
    if (!profiles || profiles.length === 0) return <div className="no-profiles">No profiles found. Check back later!</div>;

    return (
        <div className="profiles-container">
            <h1>Discover Artists</h1>
            <div className="profiles-grid">
                {profiles.map((profile, index) => (
                    <div key={profile.id || index} className="profile-card">
                        <div className="profile-image">
                            {/* Placeholder for profile image */}
                            <div className="profile-image-placeholder">
                                {profile.username ? profile.username.charAt(0).toUpperCase() : "?"}
                            </div>
                        </div>
                        <div className="profile-info">
                            <h3>{profile.username || "Anonymous User"}</h3>
                            <div className="profile-tags">
                                {profile.user_type && (
                                    <span className={`user-type-tag ${
                                        profile.user_type === "1" ? "producer" : 
                                        profile.user_type === "2" ? "musician" : 
                                        profile.user_type === "3" ? "singer" : ""
                                    }`}>
                                        {profile.user_type === "1" ? "Producer" : 
                                         profile.user_type === "2" ? "Musician" : 
                                         profile.user_type === "3" ? "Singer" : "Artist"}
                                    </span>
                                )}
                            </div>
                            <p className="profile-bio">{profile.bio || "No bio provided"}</p>
                            {profile.interests && profile.interests.length > 0 && (
                                <div className="profile-interests">
                                    <h4>Interests:</h4>
                                    <div className="interest-tags">
                                        {Array.isArray(profile.interests) ? 
                                            profile.interests.map((interest, i) => (
                                                <span key={i} className="interest-tag">{interest}</span>
                                            )) : 
                                            <span className="interest-tag">{String(profile.interests)}</span>
                                        }
                                    </div>
                                </div>
                            )}
                            <button className="connect-button">Connect</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileList;