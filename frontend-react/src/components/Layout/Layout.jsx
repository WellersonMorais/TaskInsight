// src/components/Layout/Layout.jsx
//
// Layout base para todas as rotas protegidas.
// Contém a Sidebar fixa à esquerda e a área de conteúdo à direita.
// As páginas (Dashboard, Tarefas, Métricas) são renderizadas dentro do "main".

import Sidebar from '../Sidebar/Sidebar';
import './Layout.css';

function Layout({ children }) {
  return (
    <div className="layout">
      {/* Sidebar fixa à esquerda */}
      <Sidebar />
      
      {/* Área de conteúdo principal à direita */}
      <main className="layout__content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
