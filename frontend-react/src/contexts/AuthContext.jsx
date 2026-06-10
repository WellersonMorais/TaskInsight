// src/contexts/AuthContext.jsx
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
// 
// O Context é como uma "caixa de informações global" do React.
// Qualquer componente filho pode ler ou alterar o estado de autenticação
// sem precisar passar props de pai para filho manualmente.

import { createContext, useContext, useState, useEffect } from 'react';

// 1. Cria o "espaço" onde os dados serão guardados
const AuthContext = createContext(null);

const TOKEN_KEY = 'taskinsight_token';

// 2. Cria o Provedor (Provider): envolve a aplicação inteira
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);

  // Remove tudo e limpa os estados
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  // Sempre que o token muda, tenta carregar os dados do usuário logado
  useEffect(() => {
    if (!token) {
      if (user !== null) {
        setUser(null);
      }
      return;
    }
    // Chama a API para buscar os dados do usuário atual
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Token inválido');
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => {
        // Se o token for inválido, faz logout
        logout();
      });
  }, [token, user]);

  // Salva o token no localStorage e no estado
  const login = (newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  };

  // O valor que todos os componentes filhos poderão acessar
  const value = {
    token,
    user,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. Hook personalizado para facilitar o uso:
//    Em vez de importar useContext e AuthContext em todo lugar,
//    basta chamar: const { user, login, logout } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return context;
}
