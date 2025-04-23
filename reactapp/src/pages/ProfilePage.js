import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  fetchCurrentUserProfile, 
  updateUserProfile, 
  fetchUserPosts,
  getPostImageUrl,
  getPostSongUrl
} from '../api';
import '../styles/ProfilePage.css';


const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [userType, setUserType] = useState(1); // Default: Producer
  const [genres, setGenres] = useState('');
  const [skills, setSkills] = useState('');
  
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        const [profileData, posts] = await Promise.all([
          fetchCurrentUserProfile(),
          fetchUserPosts()
        ]);
        
        setProfile(profileData);
        setUserPosts(posts);
        
        // Set form initial values
        setUsername(profileData.username || '');
        setBio(profileData.bio || '');
        setUserType(profileData.user_type || 1);
        setGenres(profileData.genres || '');
        
        // Handle skills which could be an object, array, or string
        if (typeof profileData.skills === 'string') {
          setSkills(profileData.skills);
        } else if (Array.isArray(profileData.skills)) {
          setSkills(profileData.skills.join(', '));
        } else if (profileData.skills && typeof profileData.skills === 'object') {
          setSkills(Object.keys(profileData.skills).join(', '));
        } else {
          setSkills('');
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile. Please refresh the page or try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadProfileData();
  }, []);
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    
    // Reset form values if canceling edit
    if (isEditing) {
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setUserType(profile.user_type || 1);
      
      // Reset genres
      if (typeof profile.genres === 'string') {
        setGenres(profile.genres);
      } else if (Array.isArray(profile.genres)) {
        setGenres(profile.genres.join(', '));
      } else if (profile.genres && typeof profile.genres === 'object') {
        setGenres(Object.keys(profile.genres).join(', '));
      } else {
        setGenres('');
      }
      
      // Reset skills
      if (typeof profile.skills === 'string') {
        setSkills(profile.skills);
      } else if (Array.isArray(profile.skills)) {
        setSkills(profile.skills.join(', '));
      } else if (profile.skills && typeof profile.skills === 'object') {
        setSkills(Object.keys(profile.skills).join(', '));
      } else {
        setSkills('');
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updateData = {
        username,
        bio,
        user_type: userType,
        genres,
        skills
      };
      
      const updatedProfile = await updateUserProfile(updateData);
      setProfile(updatedProfile);
      setIsEditing(false);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile: ' + (err.message || 'Unknown error'));
    }
  };
  
  // Helper function to render tags (skills, genres, etc.)
  const renderTags = (items) => {
    if (!items) return null;
    
    // If items is an array
    if (Array.isArray(items)) {
      return (
        <div className="profile-tags">
          {items.map((item, index) => (
            <span key={index} className="profile-tag">{item}</span>
          ))}
        </div>
      );
    }
    
    // If items is an object
    if (typeof items === 'object' && !Array.isArray(items)) {
      return (
        <div className="profile-tags">
          {Object.keys(items).map((key, index) => (
            <span key={index} className="profile-tag">{key}</span>
          ))}
        </div>
      );
    }
    
    // If items is a string
    if (typeof items === 'string') {
      return (
        <div className="profile-tags">
          {items.split(',').map((item, index) => (
            <span key={index} className="profile-tag">{item.trim()}</span>
          ))}
        </div>
      );
    }
    
    // Fallback
    return (
      <div className="profile-tags">
        <span className="profile-tag">{String(items)}</span>
      </div>
    );
  };
  
  const getUserTypeLabel = (typeId) => {
    const types = {
      1: "Producer",
      2: "Musician",
      3: "Singer"
    };
    return types[typeId] || "User";
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }
  
  if (error && !profile) {
    return (
      <div className="profile-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Your Profile</h1>
          <button 
            onClick={handleEditToggle} 
            className={isEditing ? "cancel-edit-button" : "edit-profile-button"}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {isEditing ? (
          <div className="profile-edit-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="userType">I am a</label>
                <select
                  id="userType"
                  value={userType}
                  onChange={(e) => setUserType(Number(e.target.value))}
                >
                  <option value={1}>Producer</option>
                  <option value={2}>Musician</option>
                  <option value={3}>Singer</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others about yourself and your music..."
                  rows={4}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="genres">Genres</label>
                <input
                  type="text"
                  id="genres"
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                  placeholder="e.g. Rock, Hip-Hop, Jazz (comma separated)"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="skills">Skills</label>
                <input
                  type="text"
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Guitar, Piano, Mixing (comma separated)"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={handleEditToggle} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="profile-info">
            <div className="profile-main">
              <div className="profile-avatar">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <div className="profile-details">
                <h2>{profile.username}</h2>
                <div className="user-type-badge">
                  {getUserTypeLabel(profile.user_type)}
                </div>
                <p className="joined-date">
                  Joined {formatDate(profile.date_joined || new Date())}
                </p>
              </div>
            </div>
            
            {profile.bio && (
              <div className="profile-bio">
                <h3>Bio</h3>
                <p>{profile.bio}</p>
              </div>
            )}
            
            <div className="profile-metadata">
              {profile.genres && (
                <div className="profile-section">
                  <h3>Genres</h3>
                  {renderTags(profile.genres)}
                </div>
              )}
              
              {profile.skills && (
                <div className="profile-section">
                  <h3>Skills</h3>
                  {renderTags(profile.skills)}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Portfolio Section */}
        <PortfolioSection userPosts={userPosts} />
      </div>
    </div>
  );
};

const PortfolioSection = ({ userPosts }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Group posts by category (you can customize these categories)
  const categories = {
    all: userPosts,
    recent: userPosts.slice(0, 5),
    popular: [...userPosts].sort((a, b) => b.like_count - a.like_count),
    // Add more categories as needed
  };
  
  return (
    <div className="portfolio-section">
      <div className="portfolio-header">
        <h2>Music Portfolio</h2>
        <div className="portfolio-tabs">
          <button 
            className={selectedCategory === 'all' ? 'active' : ''} 
            onClick={() => setSelectedCategory('all')}
          >
            All Tracks
          </button>
          <button 
            className={selectedCategory === 'recent' ? 'active' : ''} 
            onClick={() => setSelectedCategory('recent')}
          >
            Recent
          </button>
          <button 
            className={selectedCategory === 'popular' ? 'active' : ''} 
            onClick={() => setSelectedCategory('popular')}
          >
            Most Popular
          </button>
        </div>
      </div>
      
      <div className="portfolio-stats">
        <div className="stat-card">
          <span className="stat-value">{userPosts.length}</span>
          <span className="stat-label">Tracks</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {userPosts.reduce((total, post) => total + post.like_count, 0)}
          </span>
          <span className="stat-label">Total Likes</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">
            {new Set(userPosts.map(post => post.genre).filter(Boolean)).size}
          </span>
          <span className="stat-label">Genres</span>
        </div>
      </div>
      
      <div className="portfolio-tracks">
        {categories[selectedCategory] && categories[selectedCategory].length > 0 ? (
          categories[selectedCategory].map(post => (
            <div key={post.id} className="portfolio-track">
              <div className="track-info">
                <h3 className="track-title">{post.title}</h3>
                <div className="track-metadata">
                  {post.genre && <span className="track-genre">{post.genre}</span>}
                  <span className="track-date">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                  <span className="track-likes">♥ {post.like_count}</span>
                </div>
              </div>
              
              {post.song && (
                <div className="track-audio">
                  <audio controls src={getPostSongUrl(post.id)}></audio>
                </div>
              )}
              
              <Link to={`/posts/${post.id}`} className="view-track-btn">
                View Details
              </Link>
            </div>
          ))
        ) : (
          <div className="no-tracks">
            <p>No tracks found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;