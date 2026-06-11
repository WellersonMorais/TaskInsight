// src/pages/Metricas/Metricas.jsx
//
// Página de Métricas.
// - Admin: vê métricas de TODAS as tarefas do sistema.
// - Usuário comum: vê apenas suas próprias métricas.
//
// Os dados vêm de:
//   - /api/data/analytics → finishRateByCategory, tasksByOwner, avgLeadTimeDays
//   - /api/data/summary   → total, status, categoria
// O backend já aplica o filtro por user_id para não-admins.

import { useEffect, useState } from 'react';
import { getAnalytics, getSummary } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header/Header';
import './Metricas.css';

// ─── Barra de progresso simples ───────────────────────────────────────────────
function ProgressBar({ value, max, color = 'var(--color-primary)' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="metricas__bar-track" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div
        className="metricas__bar-fill"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ─── Painel: Taxa de conclusão por categoria ──────────────────────────────────
function ConclusaoPorCategoria({ finishRateByCategory }) {
  const entries = Object.entries(finishRateByCategory || {});

  return (
    <section className="metricas__card" aria-labelledby="metricas-categoria-title">
      <h2 id="metricas-categoria-title" className="metricas__card-title">
        Taxa de conclusão por categoria
      </h2>

      {entries.length === 0 ? (
        <p className="metricas__empty">Nenhum dado disponível ainda.</p>
      ) : (
        <ul className="metricas__list" aria-label="Taxa de conclusão por categoria">
          {entries.map(([categoria, taxa]) => (
            <li key={categoria} className="metricas__list-item">
              <span className="metricas__list-label">{categoria}</span>
              <div className="metricas__bar-wrapper">
                <ProgressBar value={taxa} max={100} color="var(--color-primary)" />
              </div>
              <span className="metricas__list-value">{taxa}%</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── Painel: Ranking de responsáveis (tarefas concluídas) ────────────────────
function RankingResponsaveis({ tasksByOwner }) {
  // Ordena por contagem decrescente e pega top 5
  const entries = Object.entries(tasksByOwner || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxValue = entries.length > 0 ? entries[0][1] : 1;

  return (
    <section className="metricas__card" aria-labelledby="metricas-responsaveis-title">
      <h2 id="metricas-responsaveis-title" className="metricas__card-title">
        Tarefas por responsável
      </h2>

      {entries.length === 0 ? (
        <p className="metricas__empty">Nenhum dado disponível ainda.</p>
      ) : (
        <ol className="metricas__ranking" aria-label="Ranking de responsáveis por tarefas">
          {entries.map(([nome, count], index) => (
            <li key={nome} className="metricas__ranking-item">
              <span className="metricas__ranking-position" aria-label={`Posição ${index + 1}`}>
                {index + 1}
              </span>
              <span className="metricas__ranking-name">{nome}</span>
              <div className="metricas__bar-wrapper">
                <ProgressBar value={count} max={maxValue} color="var(--color-accent)" />
              </div>
              <span className="metricas__ranking-count">{count}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

// ─── Painel: Cards de resumo rápido ──────────────────────────────────────────
function ResumoCards({ summary, avgLeadTimeDays }) {
  const total = summary?.total || 0;
  const concluidas = summary?.status?.concluida || 0;
  const pendentes = summary?.status?.pendente || 0;
  const andamento = summary?.status?.andamento || 0;
  const taxaConclusao = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  const cards = [
    { label: 'Total de tarefas', value: total, sub: 'no sistema' },
    { label: 'Concluídas', value: concluidas, sub: `${taxaConclusao}% do total` },
    { label: 'Em andamento', value: andamento, sub: 'em progresso' },
    { label: 'Lead time médio', value: `${avgLeadTimeDays}d`, sub: 'dias até conclusão' },
  ];

  return (
    <div className="metricas__resumo-grid" role="list" aria-label="Resumo de métricas">
      {cards.map(({ label, value, sub }) => (
        <div key={label} className="metricas__resumo-card" role="listitem">
          <span className="metricas__resumo-value">{value}</span>
          <p className="metricas__resumo-label">{label}</p>
          <p className="metricas__resumo-sub">{sub}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
function Metricas() {
  const { isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Reutiliza as mesmas funções do Dashboard — o backend já filtra por usuário
        const [analyticsData, summaryData] = await Promise.all([
          getAnalytics(),
          getSummary(),
        ]);
        setAnalytics(analyticsData);
        setSummary(summaryData);
      } catch (err) {
        setError(err.message || 'Erro ao carregar métricas.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const subtitle = isAdmin
    ? 'Acompanhe indicadores e o desempenho de toda a equipe.'
    : 'Acompanhe os seus indicadores e seu desempenho pessoal.';

  if (loading) {
    return (
      <div className="metricas">
        <Header title="Métricas" subtitle={subtitle} />
        <p className="metricas__message">Carregando métricas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="metricas">
        <Header title="Métricas" subtitle={subtitle} />
        <p className="metricas__message metricas__message--error">Erro: {error}</p>
      </div>
    );
  }

  return (
    <div className="metricas">
      <Header title="Métricas" subtitle={subtitle} />

      {/* Cards de resumo rápido */}
      <ResumoCards summary={summary} avgLeadTimeDays={analytics?.avgLeadTimeDays ?? 0} />

      {/* Dois painéis lado a lado: categoria + responsáveis */}
      <div className="metricas__panels">
        <ConclusaoPorCategoria finishRateByCategory={analytics?.finishRateByCategory} />
        <RankingResponsaveis tasksByOwner={analytics?.tasksByOwner} />
      </div>
    </div>
  );
}

export default Metricas;
