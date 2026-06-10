// src/components/Sidebar/Sidebar.jsx
//
// Barra lateral de navegação presente em todas as rotas protegidas.
// Usa o hook useAuth() para pegar os dados do usuário e o logout.
// Usa NavLink do react-router-dom para detectar a rota ativa automaticamente.

import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, BarChart2, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import logoAmarelo from '../../assets/logo-amarelo.svg';
import './Sidebar.css';

// Links de navegação definidos em um array para facilitar manutenção
const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/tarefas',   label: 'Tarefas',   Icon: ClipboardList  },
  { to: '/metricas',  label: 'Métricas',  Icon: BarChart2      },
];

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo PontoFocal */}
      <div className="sidebar__logo">
        <img src={logoAmarelo} alt="PontoFocal Logo" className="sidebar__logo-img" />
      </div>

      {/* Links de navegação */}
      <nav className="sidebar__nav">
        {NAV_LINKS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            // O NavLink adiciona a classe "sidebar__link--active" automaticamente
            // quando a URL atual corresponde ao "to" deste link
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <Icon className="sidebar__link-icon" size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Botão Sair no rodapé */}
      <div className="sidebar__footer">
        <button className="sidebar__logout" onClick={handleLogout}>
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
