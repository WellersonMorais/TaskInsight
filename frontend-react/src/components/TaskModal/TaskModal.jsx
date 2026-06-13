import { useEffect, useState } from 'react';
import Button from '../Button/Button';
import './TaskModal.css';

const EMPTY_FORM = {
  titulo: '',
  descricao: '',
  status: 'pendente',
  publico_alvo: 'Geral',
  categoria: '',
  responsavel: '',
  prioridade: '',
  estimativa_horas: '',
};

const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'andamento', label: 'Em andamento' },
  { value: 'concluida', label: 'Concluída' },
];

const PRIORITY_OPTIONS = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Média' },
  { value: 'baixa', label: 'Baixa' },
];

const PUBLICO_OPTIONS = [
  { value: 'Geral', label: 'Geral' },
  { value: 'Visual', label: 'Visual' },
  { value: 'Auditiva', label: 'Auditiva' },
  { value: 'Intelectual', label: 'Intelectual' },
];

function TaskModal({
  isOpen,
  onClose,
  onSave,
  task = null,
  categorias = [],
  responsaveis = [],
  saving = false,
  isAdmin = false,
  currentUser = null,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const isEditing = Boolean(task);

  useEffect(() => {
    if (!isOpen) return;

    if (task) {
      setForm({
        titulo: task.titulo || '',
        descricao: task.descricao || '',
        status: task.status || 'pendente',
        publico_alvo: task.publico_alvo || 'Geral',
        categoria: task.categoria || '',
        responsavel: task.responsavel || '',
        prioridade: task.prioridade || '',
        estimativa_horas: task.estimativa_horas ?? '',
      });
    } else {
      const defaultResponsavel = !isAdmin && currentUser?.name ? currentUser.name : '';
      setForm({ ...EMPTY_FORM, responsavel: defaultResponsavel });
    }
  }, [isOpen, task, isAdmin, currentUser]);

  if (!isOpen) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.titulo.trim()) return;

    onSave({
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim(),
      status: form.status,
      publico_alvo: form.publico_alvo,
      categoria: form.categoria,
      responsavel: form.responsavel,
      prioridade: form.prioridade,
      estimativa_horas: Number(form.estimativa_horas) || 0,
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="task-modal-overlay" onClick={handleOverlayClick}>
      <div className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <h2 id="task-modal-title" className="task-modal__title">
          {isEditing ? 'Editar tarefa' : 'Nova tarefa'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="task-modal__grid">
            <div className="task-modal__column">
              <div className="task-modal__field">
                <label htmlFor="task-titulo">
                  Título <span className="task-modal__required">*</span>
                </label>
                <input
                  id="task-titulo"
                  type="text"
                  placeholder="ex: auditar contraste no portal RH"
                  value={form.titulo}
                  onChange={handleChange('titulo')}
                  required
                />
              </div>

              <div className="task-modal__field">
                <label htmlFor="task-descricao">
                  Descrição <span className="task-modal__required">*</span>
                </label>
                <textarea
                  id="task-descricao"
                  placeholder="Descreva a tarefa"
                  value={form.descricao}
                  onChange={handleChange('descricao')}
                  rows={4}
                  required
                />
              </div>

              <div className="task-modal__field">
                <label htmlFor="task-status">
                  Status <span className="task-modal__required">*</span>
                </label>
                <select id="task-status" value={form.status} onChange={handleChange('status')}>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="task-modal__field">
                <label htmlFor="task-publico">
                  Público Alvo <span className="task-modal__required">*</span>
                </label>
                <select id="task-publico" value={form.publico_alvo} onChange={handleChange('publico_alvo')}>
                  {PUBLICO_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="task-modal__column">
              <div className="task-modal__field">
                <label htmlFor="task-categoria">
                  Categoria <span className="task-modal__required">*</span>
                </label>
                <select
                  id="task-categoria"
                  value={form.categoria}
                  onChange={handleChange('categoria')}
                  required
                >
                  <option value="">Selecione a categoria</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="task-modal__field">
                <label htmlFor="task-responsavel">
                  Responsável <span className="task-modal__required">*</span>
                </label>
                {isAdmin ? (
                  <select
                    id="task-responsavel"
                    value={form.responsavel}
                    onChange={handleChange('responsavel')}
                    required
                  >
                    <option value="">Selecione o responsável</option>
                    {responsaveis.map((nome) => (
                      <option key={nome} value={nome}>{nome}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="task-responsavel"
                    type="text"
                    value={form.responsavel}
                    readOnly
                    className="task-modal__input--readonly"
                  />
                )}
              </div>

              <div className="task-modal__field">
                <label htmlFor="task-prioridade">
                  Prioridade <span className="task-modal__required">*</span>
                </label>
                <select
                  id="task-prioridade"
                  value={form.prioridade}
                  onChange={handleChange('prioridade')}
                  required
                >
                  <option value="">Selecione a prioridade</option>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="task-modal__field">
                <label htmlFor="task-estimativa">
                  Estimativa de horas <span className="task-modal__required">*</span>
                </label>
                <input
                  id="task-estimativa"
                  type="number"
                  min="0"
                  placeholder="ex: 8"
                  value={form.estimativa_horas}
                  onChange={handleChange('estimativa_horas')}
                  required
                />
              </div>
            </div>
          </div>

          <div className="task-modal__actions">
            <Button variant="secondary" type="button" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar tarefa'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
