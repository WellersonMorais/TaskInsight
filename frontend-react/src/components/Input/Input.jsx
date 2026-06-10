// src/components/Input/Input.jsx
//
// Campo de texto genérico reutilizável.
//
// Props:
// - label: string       → Texto acima do input (ex: "E-mail", "Senha")
// - id: string          → id único do campo (liga o label ao input)
// - type: string        → 'text' | 'email' | 'password' | 'number'
// - placeholder: string
// - value: string       → valor controlado pelo estado do pai
// - onChange: function  → atualiza o estado no componente pai
// - variant: 'default' | 'filter'
//
// Exemplo de uso:
//   const [email, setEmail] = useState('');
//   <Input
//     label="E-mail"
//     id="email"
//     type="email"
//     value={email}
//     onChange={(e) => setEmail(e.target.value)}
//   />

import './Input.css';

function Input({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  variant = 'default',
}) {
  const groupClass = `input-group ${variant === 'filter' ? 'input-group--filter' : ''}`;

  return (
    <div className={groupClass}>
      {/* Label só é renderizado se a prop "label" for fornecida */}
      {label && <label htmlFor={id}>{label}</label>}

      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default Input;
