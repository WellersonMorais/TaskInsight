const tokenKey = "taskinsight_token";

const getToken = () => localStorage.getItem(tokenKey);

const setToken = (token) =>
  localStorage.setItem(tokenKey, token);

// Redireciona para dashboard se já estiver logado
if (getToken()) {
  window.location.href = "/dashboard.html";
}

// Elementos DOM
const els = {
  name: null,
  email: null,
  password: null,
  loginBtn: null,
  registerBtn: null,
  backBtn: null,
  authMessage: null,
  nameField: null,
  authTitle: null,
  authSubtitle: null,
};

let isRegisterMode = false;

// ======================
// Inicialização
// ======================
const initDOM = () => {
  els.name = document.getElementById("name");
  els.email = document.getElementById("email");
  els.password = document.getElementById("password");

  els.loginBtn =
    document.getElementById("loginBtn");

  els.registerBtn =
    document.getElementById(
      "registerBtn"
    );

  els.backBtn =
    document.getElementById("backBtn");

  els.authMessage =
    document.getElementById(
      "authMessage"
    );

  els.nameField =
    document.getElementById(
      "nameField"
    );

  els.authTitle =
    document.getElementById(
      "authTitle"
    );

  els.authSubtitle =
    document.getElementById(
      "authSubtitle"
    );

  console.log("ELEMENTOS:", els);

  // validação defensiva
  const requiredElements = [
    "loginBtn",
    "registerBtn",
    "backBtn",
    "nameField",
    "authTitle",
    "authSubtitle",
  ];

  for (const key of requiredElements) {
    if (!els[key]) {
      console.error(
        `Elemento não encontrado: ${key}`
      );
      return;
    }
  }

  setupListeners();
  toggleRegisterMode(false);
};

// ======================
// UI Helpers
// ======================
const showMessage = (
  text,
  type = "error"
) => {
  if (!els.authMessage) return;

  els.authMessage.textContent =
    text;

  els.authMessage.className =
    `message ${type}`;
};

const clearFields = () => {
  if (els.name) els.name.value = "";
  if (els.email) els.email.value = "";
  if (els.password)
    els.password.value = "";

  if (els.authMessage) {
    els.authMessage.textContent =
      "";
  }
};

// ======================
// Alternar tela
// ======================
const toggleRegisterMode = (
  enable
) => {
  isRegisterMode = enable;

  if (enable) {
    // Registro
    els.authTitle.textContent =
      "Registrar";

    els.authSubtitle.textContent =
      "Crie uma nova conta para acessar o sistema.";

    els.nameField.style.display =
      "block";

    els.loginBtn.textContent =
      "Registrar";

    els.registerBtn.style.display =
      "none";

    els.backBtn.style.display =
      "inline-block";
  } else {
    // Login
    isRegisterMode = false;

    els.authTitle.textContent =
      "Login";

    els.authSubtitle.textContent =
      "Use admin@taskinsight.com / senha123 ou registre um usuário.";

    els.nameField.style.display =
      "none";

    els.loginBtn.textContent =
      "Entrar";

    els.registerBtn.style.display =
      "inline-block";

    els.backBtn.style.display =
      "none";
  }

  clearFields();
};

// ======================
// Requisição auth
// ======================
const authRequest = async (
  path
) => {
  const body = {
    email:
      els.email?.value?.trim() || "",
    password:
      els.password?.value?.trim() ||
      "",
  };

  // Validação Login
  if (!isRegisterMode) {
    if (
      !body.email ||
      !body.password
    ) {
      showMessage(
        "Informe email e senha."
      );

      return null;
    }
  }

  // Validação Registro
  if (isRegisterMode) {
    body.name =
      els.name?.value?.trim() || "";

    if (
      !body.name ||
      !body.email ||
      !body.password
    ) {
      showMessage(
        "Informe nome, email e senha."
      );

      return null;
    }
  }

  try {
    const res = await fetch(
      `/api/auth/${path}`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      showMessage(
        data.error ||
          "Erro na autenticação."
      );

      return null;
    }

    return data;
  } catch (error) {
    console.error(error);

    showMessage(
      "Erro de conexão com o servidor."
    );

    return null;
  }
};

// ======================
// Eventos
// ======================
const setupListeners = () => {
  // Entrar / Registrar
  els.loginBtn?.addEventListener(
    "click",
    async (e) => {
      e.preventDefault();

      const path =
        isRegisterMode
          ? "register"
          : "login";

      const result =
        await authRequest(path);

      if (
        result &&
        result.token
      ) {
        setToken(result.token);

        showMessage(
          isRegisterMode
            ? "Usuário registrado com sucesso."
            : "Login efetuado com sucesso.",
          "success"
        );

        setTimeout(() => {
          window.location.href =
            "/dashboard.html";
        }, 500);
      }
    }
  );

  // Abrir tela de registro
  els.registerBtn?.addEventListener(
    "click",
    (e) => {
      e.preventDefault();

      toggleRegisterMode(true);
    }
  );

  // Voltar para login
  els.backBtn?.addEventListener(
    "click",
    (e) => {
      e.preventDefault();

      toggleRegisterMode(false);
    }
  );
};

document.addEventListener(
  "DOMContentLoaded",
  initDOM
);