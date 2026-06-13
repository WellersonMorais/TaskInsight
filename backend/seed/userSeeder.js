const bcrypt = require("bcryptjs");

const DEFAULT_PASSWORD = "senha123";

const toEmail = (nome) =>
  nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, ".")
    + "@taskinsight.com";

class UserSeeder {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async createAdmin() {
    const password = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    await this.userRepository.createUser({
      name: "Admin TaskInsight",
      email: "admin@taskinsight.com",
      password,
      isAdmin: true,
    });
  }

  async createForResponsaveis(responsaveis) {
    const password = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const userMap = {};

    for (const resp of responsaveis) {
      const email = toEmail(resp.nome);
      const user = await this.userRepository.createUser({
        name: resp.nome,
        email,
        password,
        isAdmin: false,
      });
      const id = user.id ?? String(user._id);
      userMap[resp.nome] = id;
      console.log(`  Usuário criado: ${resp.nome} <${email}>`);
    }

    return userMap;
  }
}

module.exports = UserSeeder;
