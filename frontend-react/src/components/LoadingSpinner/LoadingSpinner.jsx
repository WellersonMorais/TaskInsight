// src/components/LoadingSpinner/LoadingSpinner.jsx
//
// Spinner visual reutilizável para estados de carregamento.
// Substitui o texto simples "Carregando..." nas páginas.

import './LoadingSpinner.css';

function LoadingSpinner({ message = 'Carregando...' }) {
  return (
    <div className="loading-spinner" role="status" aria-label={message}>
      <div className="loading-spinner__ring" aria-hidden="true">
        <div />
        <div />
        <div />
        <div />
      </div>
      <p className="loading-spinner__text">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
