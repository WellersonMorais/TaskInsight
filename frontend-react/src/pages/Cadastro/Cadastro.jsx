// src/pages/Cadastro/Cadastro.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authRegister } from '../../services/api';
import logoAzul from '../../assets/logo-azul.png';
import './Cadastro.css';

// Validações client-side
const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validarSenha = (senha) => senha.length >= 6;

function Cadastro() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpa o erro do campo ao digitar
    if (erros[name]) setErros((prev) => ({ ...prev, [name]: '' }));
    if (erroGeral) setErroGeral('');
  };

  const validarFormulario = () => {
    const novosErros = {};
    if (!form.nome.trim() || form.nome.trim().length < 2)
      novosErros.nome = 'Nome deve ter ao menos 2 caracteres.';
    if (!validarEmail(form.email))
      novosErros.email = 'Informe um e-mail válido.';
    if (!validarSenha(form.senha))
      novosErros.senha = 'Senha deve ter ao menos 6 caracteres.';
    if (form.senha !== form.confirmarSenha)
      novosErros.confirmarSenha = 'As senhas não coincidem.';
    return novosErros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroGeral('');

    const validacao = validarFormulario();
    if (Object.keys(validacao).length > 0) {
      setErros(validacao);
      return;
    }

    setLoading(true);
    try {
      // Reutiliza authRegister de api.js — envia { name, email, password } com Content-Type: application/json
      const data = await authRegister(form.nome.trim(), form.email, form.senha);
      // Backend retorna { token } — salva via AuthContext (igual ao login)
      login(data.token);
      navigate('/dashboard');
    } catch (err) {
      setErroGeral(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-page">
      <div className="cadastro-card">

        {/* Botão voltar */}
        <button
          type="button"
          className="cadastro-back-btn"
          onClick={() => navigate('/')}
          aria-label="Voltar para a página inicial"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 8 8 12 12 16" />
            <line x1="16" y1="12" x2="8" y2="12" />
          </svg>
        </button>

        {/* Logo */}
        <div className="cadastro-logo-wrapper">
          <img src={logoAzul} alt="PontoFocal Logo" className="cadastro-logo" />
        </div>

        <p className="cadastro-tagline">Gerencie seu time e acompanhe métricas</p>

        {/* Formulário */}
        <form className="cadastro-form" onSubmit={handleSubmit} noValidate>

          {/* Nome */}
          <div className="cadastro-field">
            <label htmlFor="cadastro-nome" className="cadastro-label">Nome</label>
            <input
              id="cadastro-nome"
              name="nome"
              type="text"
              className={`cadastro-input${erros.nome ? ' cadastro-input--error' : ''}`}
              placeholder="Seu nome completo"
              value={form.nome}
              onChange={handleChange}
              required
              autoComplete="name"
            />
            {erros.nome && <span className="cadastro-field-error">{erros.nome}</span>}
          </div>

          {/* E-mail */}
          <div className="cadastro-field">
            <label htmlFor="cadastro-email" className="cadastro-label">E-mail</label>
            <input
              id="cadastro-email"
              name="email"
              type="email"
              className={`cadastro-input${erros.email ? ' cadastro-input--error' : ''}`}
              placeholder="seu@email.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
            {erros.email && <span className="cadastro-field-error">{erros.email}</span>}
          </div>

          {/* Senha */}
          <div className="cadastro-field">
            <label htmlFor="cadastro-senha" className="cadastro-label">Senha</label>
            <div className="cadastro-input-wrapper">
              <input
                id="cadastro-senha"
                name="senha"
                type={showSenha ? 'text' : 'password'}
                className={`cadastro-input${erros.senha ? ' cadastro-input--error' : ''}`}
                placeholder="Mínimo 6 caracteres"
                value={form.senha}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="cadastro-toggle-senha"
                onClick={() => setShowSenha((v) => !v)}
                aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showSenha ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {erros.senha && <span className="cadastro-field-error">{erros.senha}</span>}
          </div>

          {/* Confirmar Senha */}
          <div className="cadastro-field">
            <label htmlFor="cadastro-confirmar" className="cadastro-label">Confirmar senha</label>
            <div className="cadastro-input-wrapper">
              <input
                id="cadastro-confirmar"
                name="confirmarSenha"
                type={showConfirmar ? 'text' : 'password'}
                className={`cadastro-input${erros.confirmarSenha ? ' cadastro-input--error' : ''}`}
                placeholder="Repita a senha"
                value={form.confirmarSenha}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="cadastro-toggle-senha"
                onClick={() => setShowConfirmar((v) => !v)}
                aria-label={showConfirmar ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showConfirmar ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {erros.confirmarSenha && <span className="cadastro-field-error">{erros.confirmarSenha}</span>}
          </div>

          {/* Força da senha */}
          {form.senha.length > 0 && (
            <div className="cadastro-senha-forca">
              <div className="cadastro-forca-barra">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className={`cadastro-forca-segmento ${getForcaClasse(form.senha, n)}`}
                  />
                ))}
              </div>
              <span className="cadastro-forca-label">{getForcaLabel(form.senha)}</span>
            </div>
          )}

          {/* Erro geral da API */}
          {erroGeral && (
            <p className="cadastro-error" role="alert">{erroGeral}</p>
          )}

          {/* Botão */}
          <button
            id="cadastro-submit-btn"
            type="submit"
            className="cadastro-submit-btn"
            disabled={loading}
          >
            {loading ? <span className="cadastro-spinner" /> : 'Criar conta'}
          </button>
        </form>

        {/* Link login */}
        <p className="cadastro-login-text">
          Já tem uma conta?{' '}
          <Link to="/login" className="cadastro-login-link">Entrar</Link>
        </p>

        {/* Divisor social */}
        <div className="cadastro-social-divider">
          <span></span>
          <span className="cadastro-social-label">ou cadastre-se com</span>
          <span></span>
        </div>

        {/* Ícones sociais */}
        <div className="cadastro-social-icons">
          <button type="button" className="cadastro-social-btn" aria-label="Cadastrar com Google">
            <svg width="24" height="24" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
          </button>

          <button type="button" className="cadastro-social-btn" aria-label="Cadastrar com Apple">
            <svg width="22" height="24" viewBox="0 0 814 1000" fill="currentColor">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.8-155.5-127.4C46 376.3 0 280.4 0 189.6 0 91.1 50.7 40.9 113.5 40.9c57.4 0 97.5 40.8 157.3 40.8 57.9 0 104.6-40.8 165.9-40.8 62.4 0 112 38 147.2 96.8L588.9 160c31.5-21.7 59.5-27.4 90.1-27.4 132.4 0 225.3 102.8 225.3 238.3C904.3 381.2 904.3 340.9 788.1 340.9z"/>
            </svg>
          </button>

          <button type="button" className="cadastro-social-btn" aria-label="Cadastrar com Facebook">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.791-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.49 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}

// ---- Helpers de força de senha ----
function getForcaScore(senha) {
  let score = 0;
  if (senha.length >= 6)  score++;
  if (senha.length >= 10) score++;
  if (/[A-Z]/.test(senha) && /[a-z]/.test(senha)) score++;
  if (/\d/.test(senha) && /[^A-Za-z0-9]/.test(senha)) score++;
  return score; // 0–4
}

function getForcaClasse(senha, segmento) {
  const score = getForcaScore(senha);
  if (segmento > score) return '';
  if (score <= 1) return 'forca-fraca';
  if (score === 2) return 'forca-media';
  if (score === 3) return 'forca-boa';
  return 'forca-forte';
}

function getForcaLabel(senha) {
  const score = getForcaScore(senha);
  if (score <= 1) return 'Fraca';
  if (score === 2) return 'Média';
  if (score === 3) return 'Boa';
  return 'Forte';
}

export default Cadastro;
