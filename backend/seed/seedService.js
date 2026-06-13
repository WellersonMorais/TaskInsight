const TaskParser = require("./parsers/taskParser");
const ResponsavelParser = require("./parsers/responsavelParser");
const StatusHistoryParser = require("./parsers/statusHistoryparser");
const UserSeeder = require("./userSeeder");

class SeedService {
  constructor(csvReader, dbStore) {
    this.csvReader = csvReader;
    this.dbStore = dbStore;

    this.responsavelParser = new ResponsavelParser();
    this.statusParser = new StatusHistoryParser();
    this.userSeeder = new UserSeeder(dbStore);
  }

  async execute() {
    await this.dbStore.connect();

    const existing = await this.dbStore.getTasks();
    if (existing.length > 0) {
      console.log("Banco já populado, seed ignorado.");
      return;
    }

    await this.dbStore.clearAll();

    const [atividadesRaw, responsaveisRaw, statusHistoricoRaw] = await Promise.all([
      this.csvReader.read("atividades.csv"),
      this.csvReader.read("responsaveis.csv"),
      this.csvReader.read("status_historico.csv"),
    ]);

    const responsaveis = this.responsavelParser.parse(responsaveisRaw);

    // 1. Admin
    console.log("Criando usuário admin...");
    await this.userSeeder.createAdmin();

    // 2. Um usuário por responsável + mapa nome → id
    console.log("Criando usuários para os responsáveis...");
    const userMap = await this.userSeeder.createForResponsaveis(responsaveis);

    // 3. Tasks com user_id correto
    const taskParser = new TaskParser(userMap);
    await this.dbStore.insertTasks(taskParser.parse(atividadesRaw));
    console.log(`${atividadesRaw.length} tarefas inseridas.`);

    // 4. Perfis de responsáveis
    await this.dbStore.insertResponsaveis(responsaveis);
    console.log(`${responsaveis.length} responsáveis inseridos.`);

    // 5. Histórico de status
    await this.dbStore.insertStatusHistory(
      this.statusParser.parse(statusHistoricoRaw)
    );
    console.log("Histórico de status inserido.");
  }
}

module.exports = SeedService;
