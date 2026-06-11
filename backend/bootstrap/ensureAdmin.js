const bcrypt = require("bcryptjs");
const dbStore = require("../db/store");

const ADMIN_EMAIL = "admin@taskinsight.com";
const ADMIN_PASSWORD = "senha123";

async function ensureAdminUser() {
  let admin = await dbStore.getUserByEmail(ADMIN_EMAIL);

  if (!admin) {
    const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
    admin = await dbStore.createUser({
      name: "Admin TaskInsight",
      email: ADMIN_EMAIL,
      password,
      isAdmin: true,
    });
    console.log(`Usuário admin criado: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    return admin;
  }

  if (!admin.isAdmin) {
    await dbStore.updateUser(admin.id || admin._id, { isAdmin: true });
    console.log(`Flag isAdmin ativada para ${ADMIN_EMAIL}`);
  }

  return admin;
}

module.exports = { ensureAdminUser };
