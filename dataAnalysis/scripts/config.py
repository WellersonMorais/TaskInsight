import os
import sys
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv('.env')

class Config:
    """Configurações gerais do projeto"""
    
    # Backend
    BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5000')
    API_TOKEN = os.getenv('API_TOKEN', '')
    
    # Banco de dados
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/taskinsight')
    
    # Caminhos
    PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_PATH = os.path.join(PROJECT_ROOT, 'dataAnalysis', 'data')
    OUTPUT_PATH = os.path.join(PROJECT_ROOT, 'dataAnalysis', 'outputs')
    
    # Configurações de debug
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# Criar diretórios se não existirem
os.makedirs(Config.DATA_PATH, exist_ok=True)
os.makedirs(Config.OUTPUT_PATH, exist_ok=True)
