// src/components/ProtectedRoute.jsx
//
// Este componente "protege" uma rota:
// - Se o usuário ESTÁ logado (tem token) → mostra a página normalmente.
// - Se NÃO está logado → redireciona automaticamente para /login.
//
// Uso no App.jsx:
//   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  // Se não autenticado, redireciona para /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se autenticado, renderiza o conteúdo da página normalmente
  return children;
}

export default ProtectedRoute;
