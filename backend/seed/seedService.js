const TaskParser = require("./parsers/TaskParser");
const ResponsavelParser = require("./parsers/ResponsavelParser");
const StatusHistoryParser = require("./parsers/StatusHistoryParser");
const UserSeeder = require("./UserSeeder");

class SeedService {
  constructor(csvReader, dbStore) {
    this.csvReader = csvReader;
    this.dbStore = dbStore;

    this.taskParser = new TaskParser();
    this.responsavelParser =
      new ResponsavelParser();
    this.statusParser =
      new StatusHistoryParser();

    this.userSeeder =
      new UserSeeder(dbStore);
  }

  async execute() {
    await this.dbStore.connect();
    await this.dbStore.clearAll();

    const [
      atividades,
      responsaveis,
      statusHistorico
    ] = await Promise.all([
      this.csvReader.read("atividades.csv"),
      this.csvReader.read("responsaveis.csv"),
      this.csvReader.read("status_historico.csv")
    ]);

    await this.dbStore.insertTasks(
      this.taskParser.parse(atividades)
    );

    await this.dbStore.insertResponsaveis(
      this.responsavelParser.parse(
        responsaveis
      )
    );

    await this.dbStore.insertStatusHistory(
      this.statusParser.parse(
        statusHistorico
      )
    );

    await this.userSeeder.createAdmin();
  }
}

module.exports = SeedService;