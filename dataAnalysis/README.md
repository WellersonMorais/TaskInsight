# 📊 Análise de Dados - TaskInsight

Módulo responsável pela análise, limpeza e validação dos dados do projeto TaskInsight.

## 🎯 Objetivo

- ✅ Configurar ambiente Python
- ✅ Importar dados da plataforma e arquivos CSV
- ✅ Criar DataFrames para análise
- ✅ Realizar limpeza básica dos dados
- ✅ Validar consistência das informações
- ✅ Calcular métricas iniciais de produtividade
- ✅ Organizar métricas para futura visualização

## 📁 Estrutura

```
dataAnalysis/
├── data/                  # Arquivos de dados (CSV, JSON)
├── notebooks/             # Jupyter notebooks para análise exploratória
├── scripts/              # Scripts Python reutilizáveis
│   ├── config.py         # Configurações do projeto
│   ├── data_loader.py    # Carregamento de dados
│   ├── data_cleaner.py   # Limpeza e validação
│   └── data_analyzer.py  # Análise principal
├── outputs/              # Resultados da análise
├── requirements.txt      # Dependências Python
├── setup.sh             # Script de setup do ambiente
└── .env.example         # Exemplo de variáveis de ambiente
```

## 🚀 Quickstart

### 1. Configurar o ambiente

```bash
cd dataAnalysis
bash setup.sh
source venv/bin/activate
```

### 2. Preparar arquivo .env

```bash
cp .env.example .env
# Editar .env com suas configurações
```

### 3. Adicionar dados

Coloque seus arquivos CSV na pasta `data/`:
- `atividades.csv`
- `responsaveis.csv`
- `status_historico.csv`

### 4. Executar análise

```bash
python scripts/data_analyzer.py
```

### 5. Iniciar Jupyter Lab (opcional)

```bash
jupyter lab
```

## 📦 Módulos Disponíveis

### `config.py`
Configurações centralizadas do projeto. Carrega variáveis de `.env`.

```python
from scripts.config import Config

print(Config.DATA_PATH)
print(Config.BACKEND_URL)
```

### `data_loader.py`
Carrega dados de arquivos CSV e da API do backend.

```python
from scripts.data_loader import DataLoader

loader = DataLoader()
df = loader.load_csv('atividades.csv')
dataframes = loader.load_all_csv_files()
tasks = loader.load_tasks_from_api()
```

### `data_cleaner.py`
Limpeza e validação de dados.

```python
from scripts.data_cleaner import DataCleaner

cleaner = DataCleaner()
df_clean = cleaner.clean_dataframe(df)
df = cleaner.handle_missing_values(df)
report = cleaner.get_data_quality_report(df)
```

### `data_analyzer.py`
Análise completa: load → clean → validate → export.

```python
from scripts.data_analyzer import DataAnalyzer

analyzer = DataAnalyzer()
analyzer.load_and_process_all_data()
```

## 📋 Requisitos

- Python 3.8+
- Dependências em `requirements.txt`

## 🔧 Configuração do Ambiente

### Variáveis de Ambiente (.env)

```bash
# Backend API
BACKEND_URL=http://localhost:5000
API_TOKEN=seu_token_jwt_aqui

# Banco de dados
MONGODB_URI=mongodb://localhost:27017/taskinsight

# Caminhos
DATA_PATH=./data
OUTPUT_PATH=./outputs

# Debug
DEBUG=False
LOG_LEVEL=INFO
```

## 📊 Saídas

Após executar a análise, você encontrará em `outputs/`:

- `atividades_limpo.csv` - Dados limpos
- `atividades_limpo.json` - Dados em JSON
- `relatorio_qualidade.json` - Relatório de qualidade
- `metricas_tarefas.json` - Métricas iniciais de produtividade para dashboard
- `relatorio_analise_completo.json` - Análise completa

## � Métricas de Produtividade

A análise agora gera um resumo estruturado com:

- Quantidade total de tarefas cadastradas
- Tarefas concluídas e pendentes
- Tarefas em andamento
- Taxa de conclusão e pendência
- Padrões simples por status, prioridade e responsável
- Indicador de tarefas atrasadas

O arquivo [outputs/metricas_tarefas.json](outputs/metricas_tarefas.json) pode ser usado diretamente como fonte para gráficos ou cards de dashboard.

## �📝 Exemplo de Uso Completo

```python
import pandas as pd
from scripts.data_analyzer import DataAnalyzer
from scripts.data_cleaner import DataCleaner

# Carregar e processar dados
analyzer = DataAnalyzer()
analyzer.load_and_process_all_data()

# Acessar dados processados
df_atividades = analyzer.dataframes['atividades']

# Explorar dados
print(df_atividades.head())
print(df_atividades.describe())

# Salvar customizado
analyzer.loader.save_dataframe(
    df_atividades, 
    'analise_customizada.csv'
)
```

## 🐛 Troubleshooting

**Erro: Module not found**
```bash
# Certifique-se de que venv está ativado
source venv/bin/activate
```

**Erro: Arquivo CSV não encontrado**
```bash
# Adicione arquivos CSV na pasta data/
ls -la data/
```

**Erro: Conexão com API falhou**
```bash
# Verifique se o backend está rodando
curl http://localhost:5000
# Configure BACKEND_URL em .env
```

## 📚 Documentação Adicional

- [Pandas Documentation](https://pandas.pydata.org/)
- [Jupyter Notebook Guide](https://jupyter.org/)
- [Python dotenv](https://github.com/theskumar/python-dotenv)

## 👤 Responsável

Jéssica Costa

---

**Versão:** 1.0  
**Última atualização:** 2026-06-04
