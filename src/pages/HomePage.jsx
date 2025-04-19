import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="navbar-brand">Fitness App</div>
        <div className="navbar-links">
          <Link to="/exercises" className="nav-link">
            Exercises
          </Link>
          <Link to="/workouts" className="nav-link">
            Workouts
          </Link>
          <Link to="/nutrition" className="nav-link">
            Nutrition
          </Link>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1>Your Fitness Journey Starts Here</h1>
          <p>Discover hundreds of exercises, create custom workouts, and track your progress</p>
          <Link to="/exercises" className="cta-button">
            Browse Exercises
          </Link>
        </div>
      </main>

      <footer className="footer">
        <p>© 2023 Fitness App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;