const parseNumber = require("../../utils/parseNumber");
const parseDate = require("../../utils/parseDate");

class TaskParser {
  parse(rows) {
    return rows.map(item => ({
      id: parseNumber(item.id),
      titulo: item.titulo,
      descricao: item.descricao,
      categoria: item.categoria,
      status: item.status,
      prioridade: item.prioridade,
      responsavel: item.responsavel,
      papel_responsavel: item.papel_responsavel,
      publico_alvo: item.publico_alvo,
      estimativa_horas: parseNumber(item.estimativa_horas),
      horas_gastas: parseNumber(item.horas_gastas),
      data_criacao: parseDate(item.data_criacao),
      data_conclusao: parseDate(item.data_conclusao)
    }));
  }
}

module.exports = TaskParser;