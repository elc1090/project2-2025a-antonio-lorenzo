import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <img 
            src="/images/logo.png" 
            alt="IronCore Logo" 
            className="navbar-logo"
          />
          IronCore
        </div>
        <div className="navbar-links">
          <div className="dropdown">
            <button className="dropbtn">Menu</button>
            <div className="dropdown-content">
              <Link to="/exercises" className="nav-link">
                Exercises
              </Link>
              <Link to="/workouts" className="nav-link">
                Workouts
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1>Your Fitness Journey Starts Here</h1>
          <p>Discover hundreds of exercises, create custom workouts, and track your progress</p>
          <div className="cta-buttons">
            <Link to="/exercises" className="cta-button primary">
              Browse Exercises
            </Link>
            <Link to="/workouts" className="cta-button secondary">
              My Workouts
            </Link>
          </div>
        </div>
      </main>

      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon">💪</div>
          <h3>Exercise Library</h3>
          <p>Access hundreds of exercises with detailed instructions and videos</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Workout Plans</h3>
          <p>Create and customize your own workout routines</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🏆</div>
          <h3>Progress Tracking</h3>
          <p>Monitor your improvements and stay motivated</p>
        </div>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} IronCore App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;