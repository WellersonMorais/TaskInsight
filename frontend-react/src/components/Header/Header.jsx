// src/components/Header/Header.jsx
//
// Barra superior presente em todas as telas internas (Dashboard, Tarefas, Métricas).
// Recebe "title" e "subtitle" como props (texto personalizável por tela).
// Lê os dados do usuário logado via useAuth() para exibir nome e cargo.

import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

// Props:
// - title: string   → Ex: "Olá, admin!" ou "Tarefas"
// - subtitle: string → Ex: "Bem-vindo(a) de volta."
function Header({ title, subtitle }) {
  const { user } = useAuth();

  // Pega a inicial do nome para usar como avatar quando não há foto
  const initials = user?.name
    ? user.name.charAt(0).toUpperCase()
    : 'U';

  const role = user?.isAdmin ? 'Admin' : 'Usuário';

  return (
    <header className="header">
      {/* Lado esquerdo: título e subtítulo */}
      <div className="header__left">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {/* Lado direito: avatar e nome do usuário */}
      <div className="header__user">
        <div className="header__user-info">
          <p className="header__user-name">{user?.name || 'Usuário'}</p>
          <p className="header__user-role">{role}</p>
        </div>

        {/* Avatar: círculo com a inicial do nome */}
        <div className="header__avatar">
          {initials}
        </div>
      </div>
    </header>
  );
}

export default Header;
