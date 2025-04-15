import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Where Creativity <span className="gradient-text">Meets</span> Connection</h1>
          <p className="hero-subtitle">
            The collaborative platform designed for musicians, producers, and audio engineers 
            to create together without boundaries.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="btn btn-primary">Join Collabify</Link>
            <Link to="/profiles" className="btn btn-secondary">Explore Artists</Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="music-note-visual"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why <span className="gradient-text">Collabify</span>?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon upload-icon"></div>
            <h3>Share Music in Real-time</h3>
            <p>Upload your tracks and get instant feedback from other artists</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon discover-icon"></div>
            <h3>Find Your Collaborators</h3>
            <p>Connect with musicians, producers, and vocalists based on genre and skills</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feedback-icon"></div>
            <h3>Precise Feedback</h3>
            <p>Give and receive timestamped comments directly on tracks</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon chat-icon"></div>
            <h3>Real-time Collaboration</h3>
            <p>Chat and collaborate with your connections in real-time</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It <span className="gradient-text">Works</span></h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Your Profile</h3>
            <p>Sign up and showcase your musical background, skills, and genre preferences</p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Discover Artists</h3>
            <p>Search for musicians, producers, or vocalists with complementary skills</p>
          </div>
          <div className="step-connector"></div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Connect & Message</h3>
            <p>Send friend requests and discuss potential collaborations</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Collaborate</h3>
            <p>Share music files, give timestamped feedback, and create together</p>
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="user-types">
        <h2>For Every Musical <span className="gradient-text">Creator</span></h2>
        <div className="user-types-grid">
          <div className="user-type-card">
            <div className="user-type-tag musician">Musician</div>
            <h3>Instrumentalists</h3>
            <p>Find producers to polish your tracks or vocalists to complete your compositions</p>
          </div>
          <div className="user-type-card">
            <div className="user-type-tag producer">Producer</div>
            <h3>Producers</h3>
            <p>Connect with musicians and vocalists to bring your beats and productions to life</p>
          </div>
          <div className="user-type-card">
            <div className="user-type-tag singer">Singer</div>
            <h3>Vocalists</h3>
            <p>Discover instrumentalists and producers creating tracks that need your voice</p>
          </div>
        </div>
      </section>

      {/* Problem We Solve */}
      <section className="problem-solution">
        <div className="problem-solution-container">
          <div className="problem-box">
            <h2>The <span className="gradient-text">Problem</span></h2>
            <p>Most platforms focus on sharing finished music rather than enabling the collaborative creation process. Musicians struggle to find the right collaborators and efficiently work together remotely.</p>
          </div>
          <div className="solution-box">
            <h2>Our <span className="gradient-text">Solution</span></h2>
            <p>Collabify provides an interactive environment where musicians can find collaborators based on skills and genres, share works-in-progress, give precise feedback, and communicate in real-time.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to <span className="gradient-text">Collaborate</span>?</h2>
        <p>Join the community of musicians creating together on Collabify</p>
        <Link to="/signup" className="btn btn-primary cta-button">Get Started Now</Link>
      </section>
    </div>
  );
};

export default LandingPage;