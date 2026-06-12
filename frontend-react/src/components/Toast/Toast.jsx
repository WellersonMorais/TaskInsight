// src/components/Toast/Toast.jsx
//
// Sistema de notificação (toast) para feedback ao usuário.
// Substitui alert() e window.confirm() por UI consistente com o design system.
//
// Uso via hook: const { showToast } = useToast();
// showToast('Tarefa criada com sucesso!', 'success')
// showToast('Erro ao salvar.', 'error')
// showToast('Tem certeza?', 'confirm', { onConfirm: () => {}, onCancel: () => {} })

import { useEffect, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import './Toast.css';

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  confirm: AlertTriangle,
};

function Toast({ id, message, type = 'success', onClose, onConfirm, onCancel, duration = 4000 }) {
  const Icon = ICONS[type] || CheckCircle;
  const isConfirm = type === 'confirm';
  const timerRef = useRef(null);

  useEffect(() => {
    if (isConfirm) return; // Confirmações não fecham sozinhas
    timerRef.current = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timerRef.current);
  }, [id, onClose, duration, isConfirm]);

  const handleConfirm = () => {
    onClose(id);
    onConfirm?.();
  };

  const handleCancel = () => {
    onClose(id);
    onCancel?.();
  };

  return (
    <div
      className={`toast toast--${type}`}
      role={isConfirm ? 'alertdialog' : 'status'}
      aria-live={isConfirm ? 'assertive' : 'polite'}
    >
      <Icon className="toast__icon" size={20} aria-hidden="true" />

      <p className="toast__message">{message}</p>

      {isConfirm ? (
        <div className="toast__actions">
          <button className="toast__btn toast__btn--cancel" onClick={handleCancel}>
            Cancelar
          </button>
          <button className="toast__btn toast__btn--confirm" onClick={handleConfirm}>
            Confirmar
          </button>
        </div>
      ) : (
        <button
          className="toast__close"
          onClick={() => onClose(id)}
          aria-label="Fechar notificação"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default Toast;
