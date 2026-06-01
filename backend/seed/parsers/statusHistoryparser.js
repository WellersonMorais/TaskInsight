const parseNumber = require("../../utils/parseNumber");
const parseDate = require("../../utils/parseDate");

class StatusHistoryParser {
  parse(rows) {
    return rows.map(item => ({
      task_id: parseNumber(item.task_id),
      status_anterior: item.status_anterior,
      status_novo: item.status_novo,
      data_mudanca: parseDate(item.data_mudanca)
    }));
  }
}

module.exports = StatusHistoryParser;