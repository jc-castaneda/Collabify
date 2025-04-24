import React from "react";
import { Link } from "react-router-dom";
import "../styles/CreatePostButton.css";  // assuming you have styles here

const CreatePostButton = () => {
  return (
    <Link to="/upload" className="create-post-btn">
      Share Your Music
    </Link>
  );
};

export default CreatePostButton;
