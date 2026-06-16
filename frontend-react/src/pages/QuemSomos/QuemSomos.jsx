// src/pages/QuemSomos/QuemSomos.jsx
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import logoImg from '../../assets/logo-amarelo.svg'; // Reutilizando a logo da home
import './QuemSomos.css';


const equipe = [
  {
    id: 1,
    nome: "Wellerson Morais",
    cargo: "Product Manager",
    foto: "https://via.placeholder.com/150/e9eff8/0f3460?text=Wellerson", 
  },
  {
    id: 2,
    nome: "Dev Com Yas",
    cargo: "Desenvolvedora Front-end",
    foto: "https://via.placeholder.com/150/e9eff8/0f3460?text=yas",
  },
  {
    id: 3,
    nome: "Jessica Costa",
    cargo: "Data Analyst",
    foto: "https://via.placeholder.com/150/e9eff8/0f3460?text=Jessica",
  },
  {
    id: 4,
    nome: "Manu Andrade",
    cargo: "Gerente de Projetos",
    foto: "https://via.placeholder.com/150/e9eff8/0f3460?text=Manu",
  },
  {
    id: 5,
    nome: "Laura",
    cargo: "QA Engineer",
    foto: "https://via.placeholder.com/150/e9eff8/0f3460?text=Laura",
  }
];

function QuemSomos() {
  const navigate = useNavigate();

  return (
    // Reutilizamos a classe home-container para manter o fundo e comportamento
    <div className="home-container">
      
      {/* Cabeçalho Institucional (Idêntico ao da Home para consistência) */}
      <header className="home-header">
        <Link to="/" className="home-logo-link" aria-label="Ir para a página inicial do PontoFocal">
          <img src={logoImg} alt="Logotipo PontoFocal" className="home-logo" />
        </Link>
        
        <div className="home-header-right">
          <nav className="home-nav" aria-label="Navegação Principal">
            <Link to="/" className="home-nav-link">Home</Link>
            <Link to="/quem-somos" className="home-nav-link" aria-current="page">Quem somos?</Link>
          </nav>

          <div className="home-header-actions">
            <Button variant="accent" onClick={() => navigate('/login')}>
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main id="conteudo-principal" className="quem-somos-main">
        <section className="quem-somos-section" aria-labelledby="titulo-quem-somos">
          
          <div className="quem-somos-header">
            <h1 id="titulo-quem-somos" className="quem-somos-title">
              Conheça a equipe <strong>PontoFocal</strong>
            </h1>
            <p className="quem-somos-subtitle">
              Somos um time apaixonado por organizar propósitos, garantir transparência e entregar resultados.
            </p>
          </div>

          {/* O uso de lista <ul> é altamente recomendado por diretrizes WCAG para grupos de itens */}
          <ul className="equipe-grid" aria-label="Membros da equipe">
            {equipe.map((membro) => (
              <li key={membro.id} className="equipe-item">
                <article className="equipe-card">
                  <figure className="equipe-figure">
                    <img 
                      src={membro.foto} 
                      alt={`Retrato de ${membro.nome}, ${membro.cargo}`} 
                      className="equipe-foto" 
                      loading="lazy"
                    />
                  </figure>
                  <div className="equipe-info">
                    {/* H2 pois é o subtítulo dentro da hierarquia da section que possui um H1 */}
                    <h2 className="equipe-nome">{membro.nome}</h2>
                    <p className="equipe-cargo">{membro.cargo}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>

        </section>
      </main>
    </div>
  );
}

export default QuemSomos;