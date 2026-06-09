const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dbStore = require("../db/store");

const gerarToken = (userId, isAdmin = false) => {
  const secret = process.env.JWT_SECRET || "default_secret_key";
  return jwt.sign(
    { userId, isAdmin },
    secret,
    { expiresIn: "1h" }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Nome, email e senha são obrigatórios",
      });
    }

    let user = await dbStore.getUserByEmail(email);

    if (user) {
      return res.status(400).json({
        error: "Email já cadastrado",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    user = await dbStore.createUser({
      name,
      email,
      password: hash,
      isAdmin: false,
    });

    res.json({
      token: gerarToken(user.id || user._id, false),
    });
  } catch (error) {
    res.status(500).json({
      error: "Erro no registro",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email e senha são obrigatórios",
      });
    }

    const user = await dbStore.getUserByEmail(email);

    if (!user || !user.password) {
      return res.status(400).json({
        error: "Credenciais inválidas",
      });
    }

    const senhaValida = await bcrypt.compare(
      password,
      user.password
    );

    if (!senhaValida) {
      return res.status(400).json({
        error: "Credenciais inválidas",
      });
    }

    const isAdmin = Boolean(user.isAdmin);

    res.json({
      token: gerarToken(
        user.id || user._id,
        isAdmin
      ),
    });
  } catch (error) {
    console.error("LOGIN ERROR", error);

    res.status(500).json({
      error: "Erro no login",
    });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await dbStore.getUserById(req.userId);

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    res.json({
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      isAdmin: req.isAdmin,
    });
  } catch (error) {
    res.status(500).json({
      error: "Erro ao buscar usuário",
    });
  }
};