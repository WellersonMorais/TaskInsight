const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  titulo: { type: String, required: true, trim: true },
  descricao: { type: String, trim: true },
  categoria: { type: String, trim: true },
  status: { type: String, 
    enum: [
    "pendente",
    "andamento",
    "concluida",
  ],
  default: "pendente",
  trim: true },
  prioridade: { type: String, trim: true },
  responsavel: { type: String, trim: true },
  user: {
  type:
    mongoose.Schema.Types.ObjectId,
  ref: "User"
  },
  papel_responsavel: { type: String, trim: true },
  publico_alvo: { type: String, trim: true },
  estimativa_horas: { type: Number },
  horas_gastas: { type: Number },
  data_criacao: { type: Date },
  data_conclusao: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
