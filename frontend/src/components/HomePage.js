import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>Welcome to Our User Directory</h1>
            <p>Explore the list of users and their details.</p>
            <Link to="/users" style={{
                display: "inline-block",
                padding: "10px 20px",
                fontSize: "18px",
                color: "white",
                background: "#007bff",
                textDecoration: "none",
                borderRadius: "5px"
            }}>
                View Users
            </Link>
        </div>
    );
}

export default HomePage;
