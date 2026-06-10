// src/components/Button/Button.jsx
//
// Botão genérico reutilizável em toda a aplicação.
//
// Props:
// - variant: 'primary' | 'accent' | 'secondary'  (padrão: 'primary')
// - size:    'sm' | 'md' | 'lg'                   (padrão: 'md')
// - onClick: função a ser chamada ao clicar
// - disabled: boolean
// - type: 'button' | 'submit' | 'reset'
// - children: conteúdo do botão (texto, ícone, etc.)
//
// Exemplos de uso:
//   <Button variant="primary">Entrar</Button>
//   <Button variant="accent">Cadastre-se já</Button>
//   <Button variant="secondary" size="sm">Limpar</Button>

import './Button.css';

function Button({
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  children,
}) {
  // Constrói as classes CSS dinamicamente baseando-se nas props
  const classes = [
    'btn',
    `btn--${variant}`,
    size !== 'md' ? `btn--${size}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
