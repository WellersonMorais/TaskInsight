// src/contexts/ToastContext.jsx
//
// Contexto global para o sistema de toasts.
// Qualquer componente pode chamar showToast() sem prop drilling.
//
// Tipos disponíveis:
//   'success' → fundo verde, ícone de check
//   'error'   → fundo vermelho, ícone X
//   'warning' → fundo âmbar, ícone triângulo
//   'confirm' → âmbar com botões Cancelar / Confirmar (substitui window.confirm)
//
// Uso:
//   const { showToast } = useToast();
//   showToast('Tarefa salva!', 'success');
//   showToast('Deseja excluir?', 'confirm', {
//     onConfirm: () => deletarTarefa(id),
//   });

/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from 'react';
import Toast from '../components/Toast/Toast';
import '../components/Toast/Toast.css';

const ToastContext = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', options = {}) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type, ...options }]);
    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Container dos toasts renderizado fora do fluxo normal */}
      <div className="toast-container" aria-label="Notificações">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>');
  return ctx;
}
