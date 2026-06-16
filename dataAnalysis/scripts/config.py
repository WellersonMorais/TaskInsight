import os
from pathlib import Path
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv('.env')

class Config:
    """Configurações gerais do projeto"""
    
    # Backend
    BACKEND_URL = os.getenv('BACKEND_URL', 'http://127.0.0.1:5000')
    API_TOKEN = os.getenv('API_TOKEN', '')
    
    # Banco de dados
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://127.0.0.1:27017/taskinsight')
    
    # Caminhos
    PROJECT_ROOT = Path(__file__).resolve().parent.parent
    DATA_PATH = str(PROJECT_ROOT / 'data')
    OUTPUT_PATH = str(PROJECT_ROOT / 'outputs')
    
    # Configurações de debug
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# Criar diretórios se não existirem
os.makedirs(Config.DATA_PATH, exist_ok=True)
os.makedirs(Config.OUTPUT_PATH, exist_ok=True)
