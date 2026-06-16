// src/pages/Home/Home.jsx
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import logoImg from '../../assets/logo-amarelo.svg';
import equipeImg from '../../assets/equipe.png';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Cabeçalho Institucional */}
      <header className="home-header">
        <Link to="/" className="home-logo-link">
          <img src={logoImg} alt="PontoFocal Logo" className="home-logo" />
        </Link>
        
        <div className="home-header-right">
          <nav className="home-nav">
            <Link to="/" className="home-nav-link">Home</Link>
            <Link to="/quem-somos" className="home-nav-link">Quem somos?</Link>
          </nav>

          <div className="home-header-actions">
            <Button variant="accent" onClick={() => navigate('/login')}>
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="home-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Organize <strong>tarefas</strong> com <strong>propósito</strong>, acompanhe resultados e garanta <strong>transparência</strong> para toda a equipe.
          </h1>
          <p className="hero-subtitle">
            Com o PontoFocal você tem as tarefas na palma da mão.
          </p>
          <Button variant="accent" size="lg" onClick={() => navigate('/cadastro')}>
            Cadastre-se já
          </Button>
        </div>

        <div className="hero-image-container">
          <img 
            src={equipeImg} 
            alt="Ilustração do time PontoFocal trabalhando em equipe" 
            className="hero-image" 
          />
        </div>
      </main>
    </div>
  );
}

export default Home;

