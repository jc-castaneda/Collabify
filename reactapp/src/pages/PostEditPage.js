import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPostById, updatePost, getPostImageUrl, getPostSongUrl } from '../api';
import '../styles/PostEdit.css';

const PostEditPage = () => {
  const { id } = useParams();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [status, setStatus] = useState('OPEN');
  const [currentImage, setCurrentImage] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [newSong, setNewSong] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [songError, setSongError] = useState(false);
  
  const navigate = useNavigate();
  
  // Load post data
  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        const post = await fetchPostById(id);
        
        // Check if the current user is the creator
        const currentUserId = localStorage.getItem('userId');
        if (currentUserId !== post.creator.id.toString()) {
          // Redirect if not authorized
          navigate(`/posts/${id}`);
          return;
        }
        
        // Populate form fields
        setTitle(post.title);
        setDescription(post.description || '');
        setGenre(post.genre || '');
        setLookingFor(post.looking_for || '');
        setStatus(post.status);
        
        if (post.image) {
          setCurrentImage(post.image);
        }
        
        if (post.song) {
          setCurrentSong(post.song);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading post:', err);
        setError('Failed to load post. It may have been deleted or you may not have permission to edit it.');
      } finally {
        setLoading(false);
      }
    };
    
    loadPost();
  }, [id, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Create FormData object for file upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('genre', genre);
      formData.append('looking_for', lookingFor);
      formData.append('status', status);
      
      // Only append new image/song if uploaded
      if (newImage) {
        formData.append('image', newImage);
      }
      
      if (newSong) {
        formData.append('song', newSong);
      }
      
      // Update post
      await updatePost(id, formData);
      
      // Redirect to post detail page
      navigate(`/posts/${id}`);
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update post: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="post-edit-loading">
        <div className="loading-spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }
  
  if (error && !title) {
    return (
      <div className="post-edit-error">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/feed" className="back-button">Back to Feed</Link>
      </div>
    );
  }
  
  return (
    <div className="post-edit-page">
      <div className="post-edit-container">
        <div className="edit-header">
          <Link to={`/posts/${id}`} className="back-link">
            ← Cancel
          </Link>
          <h1>Edit Post</h1>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
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
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="genre">Genre</label>
              <input
                type="text"
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Rock, Hip-Hop, Jazz"
              />
            </div>
            
            <div className="form-group half">
              <label htmlFor="lookingFor">Looking For</label>
              <input
                type="text"
                id="lookingFor"
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                placeholder="e.g. Vocalist, Guitarist"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Cover Image</label>
            
            {currentImage && !imageError && !newImage && (
              <div className="current-media">
                <p>Current image:</p>
                <div className="image-preview">
                  <img 
                    src={getPostImageUrl(id)} 
                    alt="Current cover" 
                    onError={() => setImageError(true)}
                  />
                </div>
              </div>
            )}
            
            <div className="file-upload-container">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={(e) => setNewImage(e.target.files[0])}
                className="file-input"
              />
              <label htmlFor="image" className="file-upload-label">
                {newImage ? newImage.name : 'Choose New Image'}
              </label>
            </div>
            
            {newImage && (
              <div className="file-preview">
                <img src={URL.createObjectURL(newImage)} alt="Preview" />
                <button 
                  type="button" 
                  onClick={() => setNewImage(null)} 
                  className="remove-file"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Audio File</label>
            
            {currentSong && !songError && !newSong && (
              <div className="current-media">
                <p>Current audio:</p>
                <div className="audio-preview">
                  <audio 
                    controls
                    onError={() => setSongError(true)}
                  >
                    <source src={getPostSongUrl(id)} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            )}
            
            <div className="file-upload-container">
              <input
                type="file"
                id="song"
                accept="audio/*"
                onChange={(e) => setNewSong(e.target.files[0])}
                className="file-input"
              />
              <label htmlFor="song" className="file-upload-label">
                {newSong ? newSong.name : 'Choose New Audio'}
              </label>
            </div>
            
            {newSong && (
              <div className="file-preview audio-preview">
                <audio controls>
                  <source src={URL.createObjectURL(newSong)} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                <button 
                  type="button" 
                  onClick={() => setNewSong(null)} 
                  className="remove-file"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <Link to={`/posts/${id}`} className="cancel-button">
              Cancel
            </Link>
            <button 
              type="submit" 
              className="save-button" 
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostEditPage;