// src/components/Sidebar/Sidebar.jsx
//
// Barra lateral de navegação presente em todas as rotas protegidas.
// Em desktop (≥ 768px): sidebar fixa à esquerda.
// Em mobile (< 768px): hamburger button no topo + overlay deslizante.

import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, BarChart2, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import logoAmarelo from '../../assets/logo-amarelo.svg';
import './Sidebar.css';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/tarefas',   label: 'Tarefas',   Icon: ClipboardList  },
  { to: '/metricas',  label: 'Métricas',  Icon: BarChart2      },
];

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fecha o menu ao navegar
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Bloqueia scroll do body quando menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Botão hamburger — visível só no mobile */}
      <button
        className="sidebar__hamburger"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu de navegação"
        aria-expanded={mobileOpen}
      >
        <Menu size={24} />
      </button>

      {/* Overlay escuro atrás da sidebar no mobile */}
      {mobileOpen && (
        <div
          className="sidebar__overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        {/* Botão fechar (mobile) */}
        <button
          className="sidebar__close"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu de navegação"
        >
          <X size={20} />
        </button>

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
    </>
  );
}

export default Sidebar;
