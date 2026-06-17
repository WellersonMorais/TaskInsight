# TaskInsight

Plataforma de gerenciamento e análise de tarefas construída sobre dados reais do dataset **Inova.PCD**. Permite visualizar métricas de produtividade, histórico de status e desempenho por responsável.

## Tecnologias

| Camada | Stack |
|---|---|
| Backend | Node.js · Express · MongoDB · JWT |
| Frontend | React 19 · Vite · Chart.js · React Router |
| Análise de dados | Python · pandas |

## Estrutura do projeto

```
TaskInsight/
├── backend/          # API REST (Node.js + Express)
│   ├── controllers/  # Lógica das rotas
│   ├── models/       # Schemas Mongoose
│   ├── routes/       # Definição das rotas
│   ├── middlewares/  # Autenticação JWT
│   ├── seed/         # Importação dos CSVs
│   └── server.js     # Ponto de entrada
├── frontend-react/   # SPA (React + Vite)
│   └── src/
│       └── pages/    # Home · Login · Cadastro · Dashboard · Tarefas · Métricas · Quem Somos
├── dataAnalysis/     # Scripts Python de análise
└── data/             # CSVs do dataset Inova.PCD
```

## Pré-requisitos

- Node.js 18+
- MongoDB local ou Atlas (opcional — há fallback para arquivo local)
- Python 3.10+ (apenas para análise de dados)

## Instalação e execução

### Backend

```bash
cd backend
npm install
cp ../.env.example ../.env   # configure as variáveis de ambiente
npm run seed                  # importa os dados dos CSVs
npm start                     # inicia na porta 5000 (tenta 5001 se ocupada)
```

### Frontend

```bash
cd frontend-react
npm install
npm run dev                   # inicia em http://localhost:5173
```

### Análise de dados (opcional)

```bash
cd dataAnalysis
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python run_analysis.py
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base em `.env.example`:

| Variável | Descrição |
|---|---|
| `MONGO_URI` | URI de conexão ao MongoDB |
| `JWT_SECRET` | Chave secreta para assinatura dos tokens |
| `PORT` | Porta do servidor (padrão: `5000`) |

> Se `MONGO_URI` não estiver configurado ou o MongoDB estiver indisponível, o backend utiliza automaticamente `backend/utils/local-db.json` como banco de dados local.

## Usuário padrão

| Campo | Valor |
|---|---|
| E-mail | `admin@taskinsight.com` |
| Senha | `senha123` |

## API — Endpoints

### Autenticação

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/register` | Cadastra novo usuário |
| `POST` | `/api/auth/login` | Autenticação e geração do token JWT |

### Tarefas `[requer token]`

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/tasks` | Lista todas as tarefas |
| `POST` | `/api/tasks` | Cria nova tarefa |
| `PUT` | `/api/tasks/:id` | Atualiza tarefa |
| `DELETE` | `/api/tasks/:id` | Remove tarefa |

### Dados e métricas

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/data/summary` | Resumo geral das tarefas |
| `GET` | `/api/data/analytics` | Métricas detalhadas |
| `GET` | `/api/data/responsaveis` | Lista de responsáveis |
| `GET` | `/api/data/status-history` | Histórico de mudanças de status |

## Funcionalidades do frontend

- Autenticação com JWT (token armazenado no `localStorage`)
- Dashboard com gráficos de status e categoria
- Gerenciamento de tarefas com filtros
- Métricas de taxa de conclusão e lead time
