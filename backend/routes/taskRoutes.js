const express = require("express");
const {
  getTasks,
  getTask,
  createTask,
  updateTask, // remover depois pois não haverá edição de tarefas, apenas criação e exclusão
  deleteTask,
} = require("../controllers/taskController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(auth);
router.get("/", getTasks);
router.get("/:id", getTask);
router.post("/", createTask);
router.put("/:id", updateTask); //remover depois pois não haverá edição de tarefas, apenas criação e exclusão
router.delete("/:id", deleteTask);

module.exports = router;
