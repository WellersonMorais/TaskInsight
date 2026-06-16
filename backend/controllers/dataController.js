const path = require("path");
const fs = require("fs");
const os = require("os");
const { execFile } = require("child_process");
const dbStore = require("../db/store");

exports.getSummary = async (req, res) => {
  try {
    let tasks = await dbStore.getSummary();
    
    // Se não é admin, filtrar apenas as tasks do usuário
    if (!req.isAdmin && req.userId) {
      tasks = tasks.filter((task) => String(task.user_id) === String(req.userId));
    }

    const resumo = {
      total: tasks.length,
      status: {},
      categoria: {},
      publico_alvo: {},
    };

    tasks.forEach((task) => {
      resumo.status[task.status] = (resumo.status[task.status] || 0) + 1;
      resumo.categoria[task.categoria] = (resumo.categoria[task.categoria] || 0) + 1;
      resumo.publico_alvo[task.publico_alvo] = (resumo.publico_alvo[task.publico_alvo] || 0) + 1;
    });

    res.json(resumo);
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar resumo" });
  }
};

exports.getResponsaveis = async (req, res) => {
  try {
    const lista = await dbStore.getResponsaveis();
    res.json(lista);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar responsáveis" });
  }
};

exports.getStatusHistory = async (req, res) => {
  try {
    const historico = await dbStore.getStatusHistory();
    res.json(historico);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar histórico de status" });
  }
};

exports.generateReport = (req, res) => {
  const scriptPath = path.join(__dirname, "..", "..", "data", "report_generator.py");
  const outputPath = path.join(os.tmpdir(), `relatorio_produtividade_${Date.now()}.pdf`);

  execFile("python3", [scriptPath, outputPath], { timeout: 30000 }, (error, stdout, stderr) => {
    if (error) {
      console.error("Erro ao gerar relatório:", stderr || error.message);
      return res.status(500).json({
        error: "Erro ao gerar relatório. Verifique se o Python e as dependências estão instalados.",
      });
    }

    const pdfPath = stdout.trim() || outputPath;

    if (!fs.existsSync(pdfPath)) {
      return res.status(500).json({ error: "Arquivo de relatório não encontrado após execução." });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="relatorio_produtividade.pdf"');

    const stream = fs.createReadStream(pdfPath);
    stream.pipe(res);
    stream.on("close", () => fs.unlink(pdfPath, () => {}));
    stream.on("error", (err) => {
      console.error("Erro ao enviar PDF:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Erro ao enviar o relatório." });
      }
    });
  });
};

exports.getAnalytics = async (req, res) => {
  try {
    let tasks = await dbStore.getSummary();
    
    // Se não é admin, filtrar apenas as tasks do usuário
    if (!req.isAdmin && req.userId) {
      tasks = tasks.filter((task) => String(task.user_id) === String(req.userId));
    }

    const resumo = {
      finishRateByCategory: {},
      avgLeadTimeDays: 0,
      tasksByOwner: {},
    };

    const counts = {
      totalByCategory: {},
      doneByCategory: {},
      leadDays: [],
    };

    tasks.forEach((task) => {
      const categoria = task.categoria || "Sem categoria";
      counts.totalByCategory[categoria] = (counts.totalByCategory[categoria] || 0) + 1;
      if (task.status === "concluida") {
        counts.doneByCategory[categoria] = (counts.doneByCategory[categoria] || 0) + 1;
      }
      if (task.responsavel) {
        resumo.tasksByOwner[task.responsavel] = (resumo.tasksByOwner[task.responsavel] || 0) + 1;
      }
      if (task.data_criacao && task.data_conclusao) {
        const start = new Date(task.data_criacao);
        const end = new Date(task.data_conclusao);
        if (!isNaN(start) && !isNaN(end)) {
          counts.leadDays.push(Math.round((end - start) / (1000 * 60 * 60 * 24)));
        }
      }
    });

    Object.keys(counts.totalByCategory).forEach((categoria) => {
      const total = counts.totalByCategory[categoria];
      const done = counts.doneByCategory[categoria] || 0;
      resumo.finishRateByCategory[categoria] = Number(((done / total) * 100).toFixed(1));
    });

    resumo.avgLeadTimeDays = counts.leadDays.length
      ? Number((counts.leadDays.reduce((sum, value) => sum + value, 0) / counts.leadDays.length).toFixed(1))
      : 0;

    res.json(resumo);
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar analytics" });
  }
};
