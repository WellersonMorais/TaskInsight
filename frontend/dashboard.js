const logoutBtn = document.getElementById("logoutBtn");
const resumoEl = document.getElementById("resumo");
const listaEl = document.getElementById("lista");
const analyticsEl = document.getElementById("analyticsContent");
const filterStatus = document.getElementById("filterStatus");
const filterCategory = document.getElementById("filterCategory");
const applyFilterBtn = document.getElementById("applyFilterBtn");
const clearFilterBtn = document.getElementById("clearFilterBtn");
const createTaskBtn = document.getElementById("createTaskBtn");
const taskTitle = document.getElementById("taskTitle");
const taskDesc = document.getElementById("taskDesc");
const taskCategory = document.getElementById("taskCategory");
const taskStatus = document.getElementById("taskStatus");
const taskPriority = document.getElementById("taskPriority");
const taskOwner = document.getElementById("taskOwner");
const taskPublic = document.getElementById("taskPublic");
const taskEstimate = document.getElementById("taskEstimate");
const statusChartCtx = document.getElementById("statusChart");
const categoryChartCtx = document.getElementById("categoryChart");

const tokenKey = "taskinsight_token";
let statusChart;
let categoryChart;
let currentUser = null;

const getToken = () => localStorage.getItem(tokenKey);
const setToken = (token) => localStorage.setItem(tokenKey, token);
const removeToken = () => localStorage.removeItem(tokenKey);

const showMessage = (text, type = "error") => {
  alert(`${type.toUpperCase()}: ${text}`);
};

const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Erro ${res.status}`);
  }
  return res.json();
};

const loadCurrentUser = async () => {
  try {
    const response = await fetch("/api/auth/me", { headers: apiHeaders() });
    if (!response.ok) {
      throw new Error("Erro ao carregar usuário");
    }
    currentUser = await response.json();
    console.log("Usuário carregado:", currentUser);
    
    // Adicionar indicação se é admin
    if (currentUser.isAdmin) {
      const header = document.querySelector("header");
      if (header) {
        const adminBadge = document.createElement("span");
        adminBadge.style.cssText = "background-color: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 10px;";
        adminBadge.textContent = "ADMINISTRADOR";
        header.appendChild(adminBadge);
      }
    }
  } catch (error) {
    console.error("Erro ao carregar usuário:", error);
    // Continuar mesmo se houver erro
  }
};

const renderResumo = (data) => {
  resumoEl.innerHTML = `
    <p><strong>Total de tarefas:</strong> ${data.total}</p>
    <p><strong>Status:</strong> ${Object.entries(data.status).map(([k,v]) => `${k}: ${v}`).join(" | ")}</p>
    <p><strong>Categoria:</strong> ${Object.entries(data.categoria).map(([k,v]) => `${k}: ${v}`).join(" | ")}</p>
    <p><strong>Público-alvo:</strong> ${Object.entries(data.publico_alvo).map(([k,v]) => `${k}: ${v}`).join(" | ")}</p>
  `;
};

const renderCharts = (data) => {
  const statusLabels = Object.keys(data.status);
  const statusValues = Object.values(data.status);
  const categoryLabels = Object.keys(data.categoria);
  const categoryValues = Object.values(data.categoria);

  if (statusChart) statusChart.destroy();
  if (categoryChart) categoryChart.destroy();

  statusChart = new Chart(statusChartCtx, {
    type: "pie",
    data: {
      labels: statusLabels,
      datasets: [{ data: statusValues, backgroundColor: ["#2563eb", "#f59e0b", "#10b981"] }],
    },
  });

  categoryChart = new Chart(categoryChartCtx, {
    type: "bar",
    data: {
      labels: categoryLabels,
      datasets: [{ data: categoryValues, backgroundColor: "#3b82f6" }],
    },
    options: { indexAxis: "y" },
  });
};

const renderTasks = (tasks) => {
  if (!tasks || tasks.length === 0) {
    listaEl.textContent = "Nenhuma tarefa encontrada.";
    return;
  }

  listaEl.innerHTML = tasks
    .map((task) => `
      <div class="task-card">
        <div class="task-card-header">
          <h3>${task.titulo}</h3>
          <div class="task-actions">
            <button class="small" data-action="complete" data-id="${task.id}">Concluir</button>
            <button class="small secondary" data-action="delete" data-id="${task.id}">Excluir</button>
          </div>
        </div>
        <p>${task.descricao || "Sem descrição."}</p>
        <p>Status: <strong>${task.status}</strong></p>
        <p>Categoria: <strong>${task.categoria}</strong></p>
        <p>Responsável: <strong>${task.responsavel || "-"}</strong></p>
        <p>Prioridade: <strong>${task.prioridade || "-"}</strong></p>
        <p>Público-alvo: <strong>${task.publico_alvo || "-"}</strong></p>
      </div>
    `)
    .join("");
};

const renderAnalytics = (data) => {
  analyticsEl.innerHTML = `
    <p><strong>Taxa de conclusão por categoria:</strong> ${Object.entries(data.finishRateByCategory)
      .map(([cat, value]) => `${cat}: ${value}%`)
      .join(" | ")}</p>
    <p><strong>Lead time médio:</strong> ${data.avgLeadTimeDays} dias</p>
    <p><strong>Tarefas por responsável:</strong> ${Object.entries(data.tasksByOwner)
      .map(([owner, value]) => `${owner}: ${value}`)
      .join(" | ")}</p>
  `;
};

const apiHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const fetchResumo = async () => {
  try {
    const data = await fetchJson("/api/data/summary", { headers: apiHeaders() });
    renderResumo(data);
    renderCharts(data);
  } catch (error) {
    resumoEl.textContent = "Erro ao carregar resumo.";
  }
};

const fetchAnalytics = async () => {
  try {
    const data = await fetchJson("/api/data/analytics", { headers: apiHeaders() });
    renderAnalytics(data);
  } catch (error) {
    analyticsEl.textContent = "Erro ao carregar métricas.";
  }
};

const fetchTasks = async () => {
  const token = getToken();
  if (!token) {
    listaEl.textContent = "Sessão expirada. Faça login novamente.";
    return;
  }

  try {
    const res = await fetch("/api/tasks", { headers: apiHeaders() });
    if (res.status === 401) {
      removeToken();
      window.location.href = "/login.html";
      return;
    }
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (error) {
    listaEl.textContent = "Erro ao carregar tarefas.";
  }
};

const createTask = async () => {
  const payload = {
    titulo: taskTitle.value.trim(),
    descricao: taskDesc.value.trim(),
    categoria: taskCategory.value.trim(),
    status: taskStatus.value,
    prioridade: taskPriority.value,
    responsavel: taskOwner.value.trim(),
    publico_alvo: taskPublic.value.trim(),
    estimativa_horas: Number(taskEstimate.value) || 0,
  };

  if (!payload.titulo) {
    showMessage("Título é obrigatório.");
    return;
  }

  try {
    await fetchJson("/api/tasks", {
      method: "POST",
      headers: { ...apiHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    showMessage("Tarefa criada com sucesso.", "success");
    taskTitle.value = "";
    taskDesc.value = "";
    taskCategory.value = "";
    taskOwner.value = "";
    taskPublic.value = "";
    taskEstimate.value = "";
    fetchTasks();
    fetchResumo();
    fetchAnalytics();
  } catch (error) {
    showMessage(error.message || "Erro ao criar tarefa.");
  }
};

const updateTaskStatus = async (id, status) => {
  try {
    await fetchJson(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { ...apiHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchTasks();
    fetchResumo();
    fetchAnalytics();
  } catch (error) {
    showMessage("Não foi possível atualizar a tarefa.");
  }
};

const deleteTask = async (id) => {
  try {
    await fetchJson(`/api/tasks/${id}`, {
      method: "DELETE",
      headers: apiHeaders(),
    });
    fetchTasks();
    fetchResumo();
    fetchAnalytics();
  } catch (error) {
    showMessage("Não foi possível excluir a tarefa.");
  }
};

const handleTaskAction = (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;
  if (action === "complete") {
    updateTaskStatus(id, "concluida");
  } else if (action === "delete") {
    deleteTask(id);
  }
};

listaEl.addEventListener("click", handleTaskAction);
applyFilterBtn.addEventListener("click", async () => {
  const status = filterStatus.value;
  const categoria = filterCategory.value.trim();
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (categoria) query.set("categoria", categoria);
  try {
    const res = await fetch(`/api/tasks?${query.toString()}`, { headers: apiHeaders() });
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (error) {
    listaEl.textContent = "Erro ao aplicar filtro.";
  }
});

clearFilterBtn.addEventListener("click", () => {
  filterStatus.value = "";
  filterCategory.value = "";
  fetchTasks();
});

logoutBtn.addEventListener("click", () => {
  removeToken();
  showMessage("Você saiu.", "success");
  setTimeout(() => {
    window.location.href = "/login.html";
  }, 500);
});

createTaskBtn.addEventListener("click", createTask);

const initialize = () => {
  const token = getToken();
  if (!token) {
    window.location.href = "/login.html";
    return;
  }
  
  loadCurrentUser();
  fetchResumo();
  fetchAnalytics();
  fetchTasks();
};

initialize();
