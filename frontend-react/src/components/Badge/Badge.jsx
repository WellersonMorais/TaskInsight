// src/components/Badge/Badge.jsx
//
// Elemento visual tipo "pílula" para indicar Status ou Prioridade.
// A cor é determinada pelo valor da prop "value".
//
// Props:
// - value: string → O valor que determina a cor:
//   Para STATUS:    'pendente' | 'andamento' | 'concluida'
//   Para PRIORIDADE: 'alta' | 'media' | 'baixa'
//
// Exemplo de uso:
//   <Badge value="concluida" />   → pílula verde com "concluida"
//   <Badge value="alta" />        → pílula vermelha com "alta"

import './Badge.css';

// Mapa para exibir o texto bonito no lugar do valor bruto do banco
const LABEL_MAP = {
  pendente:  'pendente',
  andamento: 'andamento',
  concluida: 'concluída',
  alta:      'alta',
  media:     'média',
  baixa:     'baixa',
};

function Badge({ value }) {
  if (!value) return null;

  // Normaliza o valor (remove acentos e coloca em minúsculo) para bater com as classes CSS
  const normalized = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const label = LABEL_MAP[normalized] || value;

  return (
    <span className={`badge badge--${normalized}`}>
      {label}
    </span>
  );
}

export default Badge;
