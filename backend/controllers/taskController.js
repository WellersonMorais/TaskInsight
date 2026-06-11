const dbStore = require("../db/store");

const canAccessTask = (req, task) => {
  if (req.isAdmin) return true;
  if (!task || !req.userId) return false;
  return String(task.user_id) === String(req.userId);
};

exports.getTasks = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.categoria) filters.categoria = req.query.categoria;
    
    // Se não é admin, filtrar apenas as tasks do usuário autenticado
    if (!req.isAdmin && req.userId) {
      filters.user_id = req.userId;
    }
    
    const tasks = await dbStore.getTasks(filters);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar tarefas" });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await dbStore.getTask(Number(req.params.id));
    if (!task) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    if (!canAccessTask(req, task)) {
      return res.status(403).json({ error: "Acesso negado" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar tarefa" });
  }
};

exports.createTask = async (req, res) => {
  try {
    // Associar a task ao usuário autenticado
    const taskData = { ...req.body, user_id: req.userId };
    const task = await dbStore.createTask(taskData);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: "Erro ao criar tarefa" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const existing = await dbStore.getTask(taskId);
    if (!existing) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    if (!canAccessTask(req, existing)) {
      return res.status(403).json({ error: "Acesso negado" });
    }
    const task = await dbStore.updateTask(taskId, req.body);
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: "Erro ao atualizar tarefa" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const existing = await dbStore.getTask(taskId);
    if (!existing) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    if (!canAccessTask(req, existing)) {
      return res.status(403).json({ error: "Acesso negado" });
    }
    await dbStore.deleteTask(taskId);
    res.json({ message: "Tarefa removida" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover tarefa" });
  }
};
