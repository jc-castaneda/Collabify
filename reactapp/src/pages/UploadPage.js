import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../api';
import AudioRecorder from '../components/AudioRecorder';
import '../styles/UploadPage.css';

const UploadPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [image, setImage] = useState(null);
  const [song, setSong] = useState(null);
  const [useRecorder, setUseRecorder] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRecordedAudio = (audioBlob) => {
    // Create a File object from the blob
    const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
    setSong(audioFile);
    setUseRecorder(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!song) {
      setError('Please upload or record an audio file');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description || '');
      
      if (genre) formData.append('genre', genre);
      if (lookingFor) formData.append('looking_for', lookingFor);
      if (image) formData.append('image', image);
      if (song) formData.append('song', song);
      
      await createPost(formData);
      setSuccess(true);
      
      // Clear form after successful upload
      setTitle('');
      setDescription('');
      setGenre('');
      setLookingFor('');
      setImage(null);
      setSong(null);
      
      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate('/feed');
      }, 2000);
    } catch (err) {
      setError('Failed to upload: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h1>Share Your Music</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        {success ? (
          <div className="success-message">
            <h2>Upload Successful!</h2>
            <p>Your music has been shared. Redirecting to feed...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your track a title"
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
              <label>Cover Image</label>
              <div className="image-upload-container">
                <input
                  type="file"
                  id="cover-image"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="file-input"
                />
                <label htmlFor="cover-image" className="file-upload-label">
                  {image ? image.name : 'Choose an image'}
                </label>
                
                {image && (
                  <div className="image-preview">
                    <img src={URL.createObjectURL(image)} alt="Preview" />
                    <button 
                      type="button" 
                      className="remove-image"
                      onClick={() => setImage(null)}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label>Audio File *</label>
              
              <div className="audio-option-tabs">
                <button 
                  type="button"
                  className={!useRecorder ? 'active' : ''}
                  onClick={() => setUseRecorder(false)}
                >
                  Upload File
                </button>
                <button 
                  type="button"
                  className={useRecorder ? 'active' : ''}
                  onClick={() => setUseRecorder(true)}
                >
                  Record Audio
                </button>
              </div>
              
              {!useRecorder ? (
                <div className="audio-upload-container">
                  <input
                    type="file"
                    id="audio-file"
                    accept="audio/*"
                    onChange={(e) => setSong(e.target.files[0])}
                    className="file-input"
                  />
                  <label htmlFor="audio-file" className="file-upload-label">
                    {song ? song.name : 'Choose an audio file'}
                  </label>
                  
                  {song && (
                    <div className="audio-preview">
                      <audio controls>
                        <source src={URL.createObjectURL(song)} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                      <button 
                        type="button" 
                        className="remove-audio"
                        onClick={() => setSong(null)}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <AudioRecorder onSave={handleRecordedAudio} />
              )}
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-button"
                disabled={submitting}
              >
                {submitting ? 'Uploading...' : 'Share Music'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UploadPage;