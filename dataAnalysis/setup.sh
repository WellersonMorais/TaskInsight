#!/bin/bash

# Setup do ambiente Python para análise de dados do TaskInsight

echo "🐍 Configurando ambiente Python..."

# Criar pasta de dados
mkdir -p data
mkdir -p notebooks
mkdir -p scripts
mkdir -p outputs

# Criar venv se não existir
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativar venv
echo "✅ Ativando ambiente virtual..."
source venv/bin/activate

# Instalar dependências
echo "📥 Instalando dependências..."
pip install --upgrade pip
pip install -r requirements.txt

echo "✨ Ambiente configurado com sucesso!"
echo ""
echo "Para usar o ambiente:"
echo "  source venv/bin/activate"
echo ""
echo "Para iniciar Jupyter:"
echo "  jupyter lab"
