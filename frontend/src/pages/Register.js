import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../api';
import '../styles/Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    bio: '',
    user_type: '2', // Default to Musician
    interests: [],
    skills: []
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [interest, setInterest] = useState('');
  const [skill, setSkill] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addInterest = () => {
    if (interest.trim() && !formData.interests.includes(interest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest.trim()]
      }));
      setInterest('');
    }
  };

  const removeInterest = (index) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
      setSkill('');
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Register the user
      await registerUser(formData);
      
      // If registration is successful, automatically log them in
      await loginUser({
        username: formData.username,
        password: formData.password
      });
      
      setLoading(false);
      navigate('/users'); // Redirect to profiles page after registration
    } catch (error) {
      setLoading(false);
      setError(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box register-box">
        <h2 className="auth-title">Join <span className="gradient-text">Collabify</span></h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username*</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password*</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="user_type">I am a*</label>
            <select
              id="user_type"
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              required
            >
              <option value="1">Producer</option>
              <option value="2">Musician</option>
              <option value="3">Singer</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Interests</label>
            <div className="tag-input">
              <input
                type="text"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                placeholder="e.g. Jazz, Rock, Hip-Hop"
              />
              <button type="button" onClick={addInterest} className="tag-add-btn">Add</button>
            </div>
            <div className="tags-container">
              {formData.interests.map((item, index) => (
                <div key={index} className="tag">
                  {item}
                  <button type="button" onClick={() => removeInterest(index)} className="tag-remove-btn">×</button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Skills</label>
            <div className="tag-input">
              <input
                type="text"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="e.g. Guitar, Drums, Ableton"
              />
              <button type="button" onClick={addSkill} className="tag-add-btn">Add</button>
            </div>
            <div className="tags-container">
              {formData.skills.map((item, index) => (
                <div key={index} className="tag">
                  {item}
                  <button type="button" onClick={() => removeSkill(index)} className="tag-remove-btn">×</button>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>Already have an account? <a href="/login">Login</a></p>
        </div>
      </div>
    </div>
  );
}

export default Register;