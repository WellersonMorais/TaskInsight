const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const Task = require("../models/Task");
const Responsavel = require("../models/Responsavel");
const StatusHistory = require("../models/StatusHistory");
const User = require("../models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/taskinsight";
const rootDbPath = path.join(__dirname, "..", "..", "local-db.json");
const backendDbPath = path.join(__dirname, "..", "local-db.json");

const readDbFile = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (_) {
    return null;
  }
};

const resolveLocalDbPath = () => {
  if (process.env.LOCAL_DB_PATH) {
    return process.env.LOCAL_DB_PATH;
  }

  const rootContent = fs.existsSync(rootDbPath) ? readDbFile(rootDbPath) : null;
  const backendContent = fs.existsSync(backendDbPath) ? readDbFile(backendDbPath) : null;

  const rootTaskCount = Array.isArray(rootContent?.tasks) ? rootContent.tasks.length : 0;
  const backendTaskCount = Array.isArray(backendContent?.tasks) ? backendContent.tasks.length : 0;
  const rootHasAdmin = Array.isArray(rootContent?.users)
    && rootContent.users.some((user) => user.email === "admin@taskinsight.com");

  // Prioriza o dataset completo na raiz (tasks + admin do seed)
  if (rootTaskCount > 0 && rootHasAdmin) {
    return rootDbPath;
  }

  if (backendTaskCount > rootTaskCount) {
    return backendDbPath;
  }

  if (rootTaskCount > 0) {
    return rootDbPath;
  }

  if (fs.existsSync(backendDbPath)) {
    return backendDbPath;
  }

  return rootDbPath;
};

const localDbPath = resolveLocalDbPath();
let db = null;
let useMongo = false;

const initLocalDb = () => {
  if (!fs.existsSync(localDbPath)) {
    fs.writeFileSync(localDbPath, JSON.stringify({ tasks: [], responsaveis: [], statusHistory: [], users: [] }, null, 2), "utf-8");
  }
  const adapter = new FileSync(localDbPath);
  db = low(adapter);
  db.defaults({ tasks: [], responsaveis: [], statusHistory: [], users: [] }).write();
};

const connect = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000,
    });
    useMongo = true;
    console.log("MongoDB conectado");
  } catch (error) {
    console.error("Falha MongoDB:", error.message);
    console.log("Usando banco local em", localDbPath);
    initLocalDb();
  }
};

const applyFilters = (items, filters) => {
  return items.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (item[key] === undefined || item[key] === null) {
        return false;
      }
      return String(item[key]) === String(value);
    });
  });
};

const getNextId = (collection) => {
  const all = db.get(collection).map("id").value();
  return all.length ? Math.max(...all) + 1 : 1;
};

const normalizeTask = (task) => {
  if (!task) return task;
  if (task.data_criacao && typeof task.data_criacao === "string") {
    task.data_criacao = new Date(task.data_criacao);
  }
  if (task.data_conclusao && typeof task.data_conclusao === "string") {
    task.data_conclusao = new Date(task.data_conclusao);
  }
  return task;
};

exports.connect = connect;

exports.getTasks = async (filters = {}) => {
  if (useMongo) {
    return Task.find(filters).sort({ id: 1 });
  }
  const tasks = applyFilters(db.get("tasks").value(), filters);
  return tasks.sort((a, b) => (a.id || 0) - (b.id || 0));
};

exports.getTask = async (id) => {
  if (useMongo) {
    return Task.findOne({ id });
  }
  return normalizeTask(db.get("tasks").find({ id }).value());
};

exports.createTask = async (data) => {
  const payload = {
    ...data,
    data_criacao: data.data_criacao || new Date(),
  };

  if (useMongo) {
    const maxTask = await Task.findOne().sort({ id: -1 });
    const nextId = maxTask ? maxTask.id + 1 : 1;
    const task = new Task({ ...payload, id: nextId });
    return task.save();
  }

  const item = { ...payload, id: payload.id || getNextId("tasks") };
  db.get("tasks").push(item).write();
  return normalizeTask(item);
};

exports.updateTask = async (id, data) => {
  if (useMongo) {
    const existing = await Task.findOne({ id });
    if (!existing) return null;

    const updates = { ...data };
    if (updates.status === "concluida" && !existing.data_conclusao) {
      updates.data_conclusao = new Date();
    }

    return Task.findOneAndUpdate({ id }, updates, { new: true });
  }

  const task = db.get("tasks").find({ id }).value();
  if (!task) return null;

  const updates = { ...data };
  if (updates.status === "concluida" && !task.data_conclusao) {
    updates.data_conclusao = new Date().toISOString();
  }

  db.get("tasks").find({ id }).assign(updates).write();
  return normalizeTask(db.get("tasks").find({ id }).value());
};

exports.deleteTask = async (id) => {
  if (useMongo) {
    return Task.findOneAndDelete({ id });
  }
  return db.get("tasks").remove({ id }).write();
};

exports.getSummary = async () => {
  if (useMongo) {
    const tasks = await Task.find();
    return tasks;
  }
  return db.get("tasks").value();
};

exports.getResponsaveis = async () => {
  if (useMongo) {
    return Responsavel.find();
  }
  return db.get("responsaveis").value();
};

exports.getStatusHistory = async () => {
  if (useMongo) {
    return StatusHistory.find().sort({ data_mudanca: -1 });
  }
  return db.get("statusHistory").sortBy("data_mudanca").reverse().value();
};

exports.getUserByEmail = async (email) => {
  if (useMongo) {
    return User.findOne({ email });
  }
  return db.get("users").find({ email }).value();
};

exports.getUserById = async (id) => {
  if (useMongo) {
    return User.findById(id);
  }
  return db.get("users").find((user) => String(user.id) === String(id)).value();
};

exports.updateUser = async (id, data) => {
  if (useMongo) {
    return User.findByIdAndUpdate(id, data, { new: true });
  }

  const user = db.get("users").find((item) => String(item.id) === String(id)).value();
  if (!user) return null;

  db.get("users").find({ id: user.id }).assign(data).write();
  return db.get("users").find({ id: user.id }).value();
};

exports.createUser = async (data) => {
  if (useMongo) {
    const user = new User(data);
    return user.save();
  }
  const item = { ...data, id: getNextId("users") };
  db.get("users").push(item).write();
  return item;
};

exports.clearAll = async () => {
  if (useMongo) {
    await Task.deleteMany();
    await Responsavel.deleteMany();
    await StatusHistory.deleteMany();
    await User.deleteMany();
    return;
  }
  db.set("tasks", []).write();
  db.set("responsaveis", []).write();
  db.set("statusHistory", []).write();
  db.set("users", []).write();
};

exports.insertTasks = async (items) => {
  if (useMongo) {
    return Task.insertMany(items);
  }
  db.get("tasks").push(...items).write();
};

exports.createResponsavel = async (data) => {
  if (useMongo) {
    const existing = await Responsavel.findOne({ nome: data.nome });
    if (existing) return existing;
    const responsavel = new Responsavel(data);
    return responsavel.save();
  }
  const existing = db.get("responsaveis").find({ nome: data.nome }).value();
  if (existing) return existing;
  const item = { ...data, id: getNextId("responsaveis") };
  db.get("responsaveis").push(item).write();
  return item;
};

exports.insertResponsaveis = async (items) => {
  if (useMongo) {
    return Responsavel.insertMany(items);
  }
  db.get("responsaveis").push(...items).write();
};

exports.insertStatusHistory = async (items) => {
  if (useMongo) {
    return StatusHistory.insertMany(items);
  }
  db.get("statusHistory").push(...items).write();
};
