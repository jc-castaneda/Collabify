// src/components/CreatePostModal.js
import React, { useState } from "react";
import { createPost } from "../api";
import AudioRecorder from "./AudioRecorder";
import "../styles/CreatePostModal.css";

const CreatePostModal = ({ onClose, refreshFeed }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [image, setImage] = useState(null);
  const [song, setSong] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [useRecorder, setUseRecorder] = useState(false);

  // Called by AudioRecorder when you hit "Use This Recording"
  const handleRecordedAudio = (audioBlob) => {
    const audioFile = new File([audioBlob], "recording.wav", {
      type: "audio/wav",
    });
    setSong(audioFile);
    setUseRecorder(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }
    if (!song && !description.trim()) {
      setError("Please upload a song or enter a description");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (genre) formData.append("genre", genre);
      if (lookingFor) formData.append("looking_for", lookingFor);
      if (image) formData.append("image", image);
      if (song) formData.append("song", song);

      await createPost(formData);
      refreshFeed();
      onClose();
    } catch (err) {
      setError("Failed to create post: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Overlay: clicking here (outside the modal) will close
    <div className="modal-overlay" onClick={onClose}>
      {/* Inner modal: stop clicks from bubbling up */}
      <div
        className="create-post-modal"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Share Your Music</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title"
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell others about your music..."
              rows={4}
            />
          </div>

          {/* Genre */}
          <div className="form-group">
            <label htmlFor="genre">Genre</label>
            <input
              type="text"
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Rock, Hip-Hop, Jazz"
            />
          </div>

          {/* Looking For */}
          <div className="form-group">
            <label htmlFor="lookingFor">Looking For</label>
            <input
              type="text"
              id="lookingFor"
              value={lookingFor}
              onChange={(e) => setLookingFor(e.target.value)}
              placeholder="e.g. Vocalist, Guitarist"
            />
          </div>

          {/* Cover Image */}
          <div className="form-group">
            <label htmlFor="image">Cover Image</label>
            <div className="image-upload-area">
              {image ? (
                <div className="image-preview-container">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="image-preview"
                  />
                  <div className="image-preview-overlay">
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="remove-image-btn"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="drop-zone">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="drop-zone-input"
                  />
                  <label htmlFor="image" className="drop-zone-label">
                    <div className="drop-zone-prompt">
                      <span className="drop-icon">📷</span>
                      <span className="drop-text">
                        Drag image here or click to upload
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Audio File / Recorder */}
          <div className="form-group">
            <label htmlFor="song">Audio File</label>

            <div className="audio-option-tabs">
              <button
                type="button"
                className={!useRecorder ? "active" : ""}
                onClick={() => setUseRecorder(false)}
              >
                Upload File
              </button>
              <button
                type="button"
                className={useRecorder ? "active" : ""}
                onClick={() => setUseRecorder(true)}
              >
                Record Audio
              </button>
            </div>

            {!useRecorder ? (
              <>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="song"
                    accept="audio/*"
                    onChange={(e) => setSong(e.target.files[0])}
                    className="file-input"
                  />
                  <label htmlFor="song" className="file-upload-label">
                    {song ? song.name : "Choose File"}
                  </label>
                </div>

                {song && (
                  <div className="file-preview audio-preview">
                    <audio controls>
                      <source
                        src={URL.createObjectURL(song)}
                        type="audio/mpeg"
                      />
                    </audio>
                    <button
                      type="button"
                      onClick={() => setSong(null)}
                      className="remove-file"
                    >
                      ×
                    </button>
                  </div>
                )}
              </>
            ) : (
              <AudioRecorder onSave={handleRecordedAudio} />
            )}
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
