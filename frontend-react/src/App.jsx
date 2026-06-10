// src/App.jsx
//
// Este é o arquivo principal do React.
// Aqui configuramos TODAS as rotas da aplicação.
//
// Como funciona:
// - BrowserRouter: ativa o sistema de rotas baseado na URL do navegador
// - Routes: container que decide qual componente renderizar baseado na URL
// - Route: define o par URL ↔ Componente
// - ProtectedRoute: envolve rotas que precisam de login

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';

// Importando as páginas
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import Dashboard from './pages/Dashboard/Dashboard';
import Tarefas from './pages/Tarefas/Tarefas';
import Metricas from './pages/Metricas/Metricas';

function App() {
  return (
    // AuthProvider envolve tudo para que qualquer página possa acessar o estado de login
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ======================== */}
          {/* ROTAS PÚBLICAS           */}
          {/* Qualquer pessoa pode ver */}
          {/* ======================== */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* ==================================== */}
          {/* ROTAS PROTEGIDAS                     */}
          {/* Só quem está logado pode acessar.    */}
          {/* Se não estiver, vai para /login.     */}
          {/* ==================================== */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tarefas"
            element={
              <ProtectedRoute>
                <Layout>
                  <Tarefas />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/metricas"
            element={
              <ProtectedRoute>
                <Layout>
                  <Metricas />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Rota fallback: qualquer URL inválida vai para a Home */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
