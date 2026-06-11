// src/pages/Dashboard/Dashboard.jsx
//
// Página Dashboard com:
// - 4 SummaryCards conectados à API /api/data/summary
// - Gráfico de rosca/pizza para status de tarefas
// - Gráfico de barras horizontal para categorias
// - Seção "Resumo rápido"

import { useEffect, useState } from 'react';
import { getSummary, getAnalytics } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header/Header';
import SummaryCard from '../../components/SummaryCard/SummaryCard';
import { FileText, CheckCircle, Users, Clock } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import './Dashboard.css';

// Registrar os componentes do Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, analyticsData] = await Promise.all([
          getSummary(),
          getAnalytics(),
        ]);
        setSummary(summaryData);
        setAnalytics(analyticsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="dashboard">Carregando...</div>;
  }

  if (error) {
    return <div className="dashboard">Erro: {error}</div>;
  }

  // Calcular dados para os SummaryCards
  const totalTasks = summary?.total || 0;
  const completedTasks = summary?.status?.concluida || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeResponsaveis = Object.keys(analytics?.tasksByOwner || {}).length;
  const avgLeadTime = analytics?.avgLeadTimeDays || 0;

  // Preparar dados para o gráfico de rosca (status)
  const statusLabels = ['Concluídas', 'Em andamento', 'Pendentes'];
  const statusData = [
    summary?.status?.concluida || 0,
    summary?.status?.andamento || 0,
    summary?.status?.pendente || 0,
  ];
  const statusColors = ['#10b981', '#f59e0b', '#ef4444'];

  const doughnutData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusData,
        backgroundColor: statusColors,
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '70%',
  };

  // Preparar dados para o gráfico de barras (categorias)
  const categoriaLabels = Object.keys(summary?.categoria || {});
  const categoriaData = Object.values(summary?.categoria || {});

  const barData = {
    labels: categoriaLabels,
    datasets: [
      {
        label: 'Tarefas por categoria',
        data: categoriaData,
        backgroundColor: '#0f3460',
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
      y: {
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  // Encontrar a categoria com mais tarefas
  const topCategoria = categoriaLabels.length > 0
    ? categoriaLabels.reduce((a, b) =>
        summary.categoria[a] > summary.categoria[b] ? a : b
      )
    : 'N/A';

  const topCategoriaCount = topCategoria !== 'N/A' ? summary.categoria[topCategoria] : 0;

  // Encontrar o responsável com mais tarefas concluídas
  const tasksByOwner = analytics?.tasksByOwner || {};
  const topOwner = Object.keys(tasksByOwner).length > 0
    ? Object.keys(tasksByOwner).reduce((a, b) =>
        tasksByOwner[a] > tasksByOwner[b] ? a : b
      )
    : 'N/A';

  const topOwnerCount = topOwner !== 'N/A' ? tasksByOwner[topOwner] : 0;

  const greetingName = user?.name?.split(' ')[0] || 'usuário';

  return (
    <div className="dashboard">
      <Header
        title={`Olá, ${greetingName}!`}
        subtitle="Bem-vindo(a) de volta ao PontoFocal."
      />

      {/* Summary Cards */}
      <div className="dashboard__summary">
        <SummaryCard
          icon={FileText}
          value={totalTasks}
          label="Total de tarefas"
          sublabel="no sistema."
        />
        <SummaryCard
          icon={CheckCircle}
          value={`${completionRate}%`}
          label="Concluídas"
          sublabel={`${completedTasks} do total.`}
        />
        <SummaryCard
          icon={Users}
          value={activeResponsaveis}
          label="Responsáveis"
          sublabel="Ativos"
        />
        <SummaryCard
          icon={Clock}
          value={`${avgLeadTime}d`}
          label="Lead time médio"
          sublabel="Dias."
        />
      </div>

      {/* Gráficos */}
      <div className="dashboard__charts">
        {/* Gráfico de Rosca - Status */}
        <div className="dashboard__chart-card">
          <h2 className="dashboard__chart-title">Tarefas por status</h2>
          <div className="dashboard__chart-container">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Gráfico de Barras - Categorias */}
        <div className="dashboard__chart-card">
          <h2 className="dashboard__chart-title">Tarefas por categoria</h2>
          <div className="dashboard__chart-container">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Resumo Rápido */}
      <div className="dashboard__quick-summary">
        <h2 className="dashboard__quick-summary-title">Resumo rápido</h2>
        <div className="dashboard__quick-summary-items">
          <div className="dashboard__quick-summary-item">
            <span className="dashboard__quick-summary-highlight">
              {completionRate}% das tarefas já foram concluídas.
            </span>{' '}
            Continue assim!
          </div>
          <div className="dashboard__quick-summary-item">
            <span className="dashboard__quick-summary-highlight">
              {topCategoria}
            </span>{' '}
            É a categoria com mais tarefas ({topCategoriaCount} no total).
          </div>
          <div className="dashboard__quick-summary-item">
            <span className="dashboard__quick-summary-highlight">
              {topOwner}
            </span>{' '}
            É o responsável com mais tarefas ({topOwnerCount} no total).
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
