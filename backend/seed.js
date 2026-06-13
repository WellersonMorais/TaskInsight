const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), override: true });

const dbStore = require("./db/store");

const CsvReader =
  require("./seed/csvReader");

const SeedService =
  require("./seed/SeedService");

const dataPath = path.join(__dirname, "..", "data");

async function bootstrap() {
  const csvReader =
    new CsvReader(dataPath);

  const seedService =
    new SeedService(
      csvReader,
      dbStore
    );

  await seedService.execute();

  console.log(
    "Seed concluído com sucesso."
  );

  process.exit(0);
}

bootstrap().catch(error => {
  console.error(
    "Erro ao executar seed:",
    error
  );

  process.exit(1);
});