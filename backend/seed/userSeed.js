const bcrypt = require("bcryptjs");

class UserSeeder {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async createAdmin() {
    const password = await bcrypt.hash(
      "senha123",
      10
    );

    await this.userRepository.createUser({
      name: "Admin TaskInsight",
      email: "admin@taskinsight.com",
      password
    });
  }
}

module.exports = UserSeeder;