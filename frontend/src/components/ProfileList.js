import React, { useEffect, useState } from "react";
// Adjusted import path for fetchProfiles
import { fetchProfiles } from "../api.js"; 

const ProfileList = () => {
    const [profiles, setProfiles] = useState([]);  
    const [loading, setLoading] = useState(true);  
    const [error, setError] = useState(null);  

    useEffect(() => {
        const loadProfiles = async () => {
            try {
                const data = await fetchProfiles();
                setProfiles(data);  
                setLoading(false);  
            } catch (error) {
                setError("Failed to load profiles");  
                setLoading(false);
            }
        };
        loadProfiles();
    }, []); 

    if (loading) return <p>Loading profiles...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>User Profiles</h1>
            <ul>
                {profiles.map((profile, index) => (
                    <li key={index}>
                        <p>Name: {profile.name}</p>
                        <p>Email: {profile.email}</p>
                        {/* more fields */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProfileList;
