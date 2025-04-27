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
                Exercícios
              </Link>
              <Link to="/workouts" className="nav-link">
                Treinos
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1>Sua Jornada Fitness começa aqui</h1>
          <p>Descubra centenas de exercícios, crie treinos personalizados, e acompanhe seu progresso</p>
          <div className="cta-buttons">
            <Link to="/exercises" className="cta-button primary">
              Buscar Exercícios
            </Link>
            <Link to="/workouts" className="cta-button secondary">
              Meus Treinos
            </Link>
          </div>
        </div>
      </main>

      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon">💪</div>
          <h3>Biblioteca de Exercícios</h3>
          <p>Acesse centenas de exercícios com instruções detalhadas e vídeos</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Planos de Treino</h3>
          <p>Crie e personalize suas próprias rotinas de treino</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🏆</div>
          <h3>Progresso</h3>
          <p>Monitore suas melhorias e mantenha-se motivado</p>
        </div>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} IronCore App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;