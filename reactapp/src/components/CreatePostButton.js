import React, { useState } from 'react';
import CreatePostModal from './CreatePostModal';
import '../styles/CreatePostButton.css';

const CreatePostButton = ({ refreshFeed }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        className="create-post-button" 
        onClick={() => setIsModalOpen(true)}
      >
        <span className="plus-icon">+</span> Share Your Music
      </button>

      {isModalOpen && (
        <CreatePostModal 
          onClose={() => setIsModalOpen(false)} 
          refreshFeed={refreshFeed}
        />
      )}
    </>
  );
};

export default CreatePostButton;