// src/components/SummaryCard/SummaryCard.jsx
//
// Os 4 cartões amarelos do topo do Dashboard.
// Recebe um ícone (componente Lucide), valor numérico, label e sublabel.
//
// Props:
// - icon: componente de ícone do Lucide React
// - value: string | number → número a ser exibido em grande (ex: "66", "21d")
// - label: string          → Ex: "Total de tarefas"
// - sublabel: string       → Ex: "no sistema."
//
// Exemplo de uso:
//   import { FileText } from 'lucide-react';
//   <SummaryCard icon={FileText} value={66} label="Total de tarefas" sublabel="no sistema." />

import './SummaryCard.css';

function SummaryCard({ icon: Icon, value, label, sublabel }) {
  return (
    <div className="summary-card">
      {/* Ícone */}
      {Icon && <Icon className="summary-card__icon" size={40} />}

      {/* Textos */}
      <div className="summary-card__content">
        <span className="summary-card__value">{value}</span>
        <p className="summary-card__label">{label}</p>
        {sublabel && <p className="summary-card__sublabel">{sublabel}</p>}
      </div>
    </div>
  );
}

export default SummaryCard;
