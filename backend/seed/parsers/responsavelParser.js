const parseNumber = require("../../utils/parseNumber");

class ResponsavelParser {
  parse(rows) {
    return rows.map(item => ({
      nome: item.nome,
      papel: item.papel,
      departamento: item.departamento,
      anos_empresa: parseNumber(item.anos_empresa),
      formacao_acessibilidade:
        item.formacao_acessibilidade
    }));
  }
}

module.exports = ResponsavelParser;