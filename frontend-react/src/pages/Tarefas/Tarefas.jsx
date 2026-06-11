import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../../components/Header/Header';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Badge from '../../components/Badge/Badge';
import TaskModal from '../../components/TaskModal/TaskModal';
import { useAuth } from '../../contexts/AuthContext';
import {
  getTarefas,
  criarTarefa,
  atualizarTarefa,
  deletarTarefa,
  getResponsaveis,
} from '../../services/api';
import './Tarefas.css';

const PAGE_SIZE = 6;

const DEFAULT_CATEGORIES = [
  'Acessibilidade Digital',
  'Adaptacao de Ambiente Fisico',
  'Capacitacao de Equipes',
  'Comunicacao Inclusiva',
  'Inclusao na Empregabilidade',
  'Plataforma Interna',
  'Tecnologia Assistiva',
];

const DEFAULT_RESPONSAVEIS = [
  'Ana Ribeiro',
  'Bruno Costa',
  'Camila Lopes',
  'Diego Martins',
  'Eduarda Souza',
  'Felipe Andrade',
  'Gabriela Pinto',
  'Henrique Alves',
];

function AdminTaskList({
  tarefas,
  loading,
  error,
  onComplete,
  onDelete,
  onApplyFilters,
  onClearFilters,
}) {
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');

  return (
    <div className="tarefas__admin-panel">
      <h2 className="tarefas__admin-title">Lista de tarefas</h2>

      <div className="tarefas__admin-filters">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          aria-label="Filtrar por status"
        >
          <option value="">Todos os status</option>
          <option value="pendente">pendente</option>
          <option value="andamento">andamento</option>
          <option value="concluida">concluida</option>
        </select>

        <input
          type="text"
          placeholder="Filtrar por categoria"
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
        />

        <button
          type="button"
          className="tarefas__admin-btn tarefas__admin-btn--primary"
          onClick={() => onApplyFilters({ status: filterStatus, categoria: filterCategoria.trim() })}
        >
          Aplicar filtro
        </button>
        <button
          type="button"
          className="tarefas__admin-btn tarefas__admin-btn--secondary"
          onClick={() => {
            setFilterStatus('');
            setFilterCategoria('');
            onClearFilters();
          }}
        >
          Limpar filtro
        </button>
      </div>

      {loading ? (
        <p className="tarefas__message">Carregando tarefas...</p>
      ) : error ? (
        <p className="tarefas__message tarefas__message--error">Erro: {error}</p>
      ) : tarefas.length === 0 ? (
        <p className="tarefas__message">Nenhuma tarefa encontrada.</p>
      ) : (
        <div className="tarefas__admin-list">
          {tarefas.map((task) => (
            <article key={task.id} className="tarefas__admin-card">
              <div className="tarefas__admin-card-header">
                <h3>{task.titulo}</h3>
                <div className="tarefas__admin-card-actions">
                  {task.status !== 'concluida' && (
                    <button
                      type="button"
                      className="tarefas__admin-btn tarefas__admin-btn--primary tarefas__admin-btn--small"
                      onClick={() => onComplete(task)}
                    >
                      Concluir
                    </button>
                  )}
                  <button
                    type="button"
                    className="tarefas__admin-btn tarefas__admin-btn--secondary tarefas__admin-btn--small"
                    onClick={() => onDelete(task)}
                  >
                    Excluir
                  </button>
                </div>
              </div>

              <p className="tarefas__admin-desc">{task.descricao || 'Sem descrição.'}</p>
              <p>Status: <strong>{task.status}</strong></p>
              <p>Categoria: <strong>{task.categoria || '—'}</strong></p>
              <p>Responsável: <strong>{task.responsavel || '—'}</strong></p>
              <p>Prioridade: <strong>{task.prioridade || '—'}</strong></p>
              <p>Público-alvo: <strong>{task.publico_alvo || '—'}</strong></p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function UserTaskList({
  tarefas,
  filteredTarefas,
  paginatedTarefas,
  loading,
  error,
  filterStatus,
  setFilterStatus,
  filterCategoria,
  setFilterCategoria,
  searchTitulo,
  setSearchTitulo,
  categorias,
  onApplyFilters,
  onClearFilters,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  safePage,
  totalPages,
  rangeStart,
  rangeEnd,
  pageNumbers,
  setCurrentPage,
}) {
  return (
    <>
      <div className="tarefas__toolbar">
        <div className="tarefas__filters">
          <div className="tarefas__filter-group">
            <label htmlFor="filter-status">Status</label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="andamento">Em andamento</option>
              <option value="concluida">Concluída</option>
            </select>
          </div>

          <div className="tarefas__filter-group">
            <label htmlFor="filter-categoria">Categoria</label>
            <select
              id="filter-categoria"
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
            >
              <option value="">Todas</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <Input
            label="Buscar por título"
            id="search-titulo"
            variant="filter"
            placeholder="Buscar por título"
            value={searchTitulo}
            onChange={(e) => setSearchTitulo(e.target.value)}
          />
        </div>

        <div className="tarefas__actions">
          <Button variant="primary" onClick={onApplyFilters}>
            Filtrar
          </Button>
          <Button variant="secondary" onClick={onClearFilters}>
            Limpar
          </Button>
          <Button variant="accent" onClick={onOpenCreate}>
            <Plus size={18} />
            Nova Tarefa
          </Button>
        </div>
      </div>

      <div className="tarefas__table-card">
        {loading ? (
          <p className="tarefas__message">Carregando tarefas...</p>
        ) : error ? (
          <p className="tarefas__message tarefas__message--error">Erro: {error}</p>
        ) : filteredTarefas.length === 0 ? (
          <p className="tarefas__message">
            Você ainda não tem tarefas. Clique em &quot;Nova Tarefa&quot; para criar a primeira.
          </p>
        ) : (
          <>
            <div className="tarefas__table-wrapper">
              <table className="tarefas__table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Categoria</th>
                    <th>Responsável</th>
                    <th>Status</th>
                    <th>Prioridade</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTarefas.map((task) => (
                    <tr key={task.id}>
                      <td className="tarefas__cell-title">{task.titulo}</td>
                      <td>{task.categoria || '—'}</td>
                      <td>{task.responsavel || '—'}</td>
                      <td><Badge value={task.status} /></td>
                      <td><Badge value={task.prioridade} /></td>
                      <td>
                        <div className="tarefas__row-actions">
                          <button
                            type="button"
                            className="tarefas__icon-btn"
                            title="Editar"
                            onClick={() => onOpenEdit(task)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="tarefas__icon-btn tarefas__icon-btn--danger"
                            title="Excluir"
                            onClick={() => onDelete(task)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="tarefas__pagination">
              <p className="tarefas__pagination-info">
                Mostrando {rangeStart} a {rangeEnd} de {filteredTarefas.length} tarefas
              </p>

              <div className="tarefas__pagination-controls">
                <button
                  type="button"
                  className="tarefas__page-btn"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={18} />
                </button>

                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`tarefas__page-btn ${page === safePage ? 'tarefas__page-btn--active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  className="tarefas__page-btn"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  aria-label="Próxima página"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Tarefas() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [tarefas, setTarefas] = useState([]);
  const [responsaveisList, setResponsaveisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [searchTitulo, setSearchTitulo] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ status: '', categoria: '', titulo: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTarefas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (appliedFilters.status) filters.status = appliedFilters.status;
      if (appliedFilters.categoria) filters.categoria = appliedFilters.categoria;

      const requests = [getTarefas(filters)];
      if (!isAdmin) {
        requests.push(getResponsaveis());
      }

      const [tasksData, responsaveisData] = await Promise.all(requests);

      setTarefas(tasksData);
      if (responsaveisData) {
        setResponsaveisList(responsaveisData.map((r) => r.nome).filter(Boolean));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, isAdmin]);

  useEffect(() => {
    fetchTarefas();
  }, [fetchTarefas]);

  const categorias = useMemo(() => {
    const fromTasks = tarefas.map((t) => t.categoria).filter(Boolean);
    return [...new Set([...DEFAULT_CATEGORIES, ...fromTasks])].sort();
  }, [tarefas]);

  const responsaveis = useMemo(() => {
    const fromTasks = tarefas.map((t) => t.responsavel).filter(Boolean);
    return [...new Set([...DEFAULT_RESPONSAVEIS, ...responsaveisList, ...fromTasks])].sort();
  }, [tarefas, responsaveisList]);

  const filteredTarefas = useMemo(() => {
    if (!appliedFilters.titulo) return tarefas;
    const term = appliedFilters.titulo.toLowerCase();
    return tarefas.filter((t) => t.titulo?.toLowerCase().includes(term));
  }, [tarefas, appliedFilters.titulo]);

  const totalPages = Math.max(1, Math.ceil(filteredTarefas.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedTarefas = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredTarefas.slice(start, start + PAGE_SIZE);
  }, [filteredTarefas, safePage]);

  const rangeStart = filteredTarefas.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filteredTarefas.length);

  const handleApplyFilters = () => {
    setAppliedFilters({
      status: filterStatus,
      categoria: filterCategoria,
      titulo: searchTitulo.trim(),
    });
    setCurrentPage(1);
  };

  const handleAdminApplyFilters = ({ status, categoria }) => {
    setAppliedFilters({ status, categoria, titulo: '' });
  };

  const handleClearFilters = () => {
    setFilterStatus('');
    setFilterCategoria('');
    setSearchTitulo('');
    setAppliedFilters({ status: '', categoria: '', titulo: '' });
    setCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = async (payload) => {
    try {
      setSaving(true);
      if (editingTask) {
        await atualizarTarefa(editingTask.id, payload);
      } else {
        await criarTarefa(payload);
      }
      handleCloseModal();
      await fetchTarefas();
    } catch (err) {
      alert(err.message || 'Erro ao salvar tarefa.');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (task) => {
    try {
      await atualizarTarefa(task.id, { status: 'concluida' });
      await fetchTarefas();
    } catch (err) {
      alert(err.message || 'Erro ao concluir tarefa.');
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Deseja excluir a tarefa "${task.titulo}"?`)) return;

    try {
      await deletarTarefa(task.id);
      await fetchTarefas();
    } catch (err) {
      alert(err.message || 'Erro ao excluir tarefa.');
    }
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, safePage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [safePage, totalPages]);

  const greetingName = user?.name?.split(' ')[0] || 'usuário';

  if (authLoading) {
    return <div className="tarefas"><p className="tarefas__message">Carregando...</p></div>;
  }

  return (
    <div className="tarefas">
      <Header
        title={isAdmin ? 'Painel do administrador' : 'Minhas tarefas'}
        subtitle={
          isAdmin
            ? 'Visualize, conclua e exclua todas as tarefas do dataset.'
            : `Olá, ${greetingName}! Gerencie apenas as tarefas que você criou.`
        }
      />

      {isAdmin ? (
        <AdminTaskList
          tarefas={tarefas}
          loading={loading}
          error={error}
          onComplete={handleComplete}
          onDelete={handleDelete}
          onApplyFilters={handleAdminApplyFilters}
          onClearFilters={handleClearFilters}
        />
      ) : (
        <UserTaskList
          tarefas={tarefas}
          filteredTarefas={filteredTarefas}
          paginatedTarefas={paginatedTarefas}
          loading={loading}
          error={error}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterCategoria={filterCategoria}
          setFilterCategoria={setFilterCategoria}
          searchTitulo={searchTitulo}
          setSearchTitulo={setSearchTitulo}
          categorias={categorias}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          onOpenCreate={handleOpenCreate}
          onOpenEdit={handleOpenEdit}
          onDelete={handleDelete}
          safePage={safePage}
          totalPages={totalPages}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          pageNumbers={pageNumbers}
          setCurrentPage={setCurrentPage}
        />
      )}

      {!isAdmin && (
        <TaskModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          task={editingTask}
          categorias={categorias}
          responsaveis={responsaveis}
          saving={saving}
        />
      )}
    </div>
  );
}

export default Tarefas;
