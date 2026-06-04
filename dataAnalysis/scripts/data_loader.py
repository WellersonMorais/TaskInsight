import pandas as pd
import requests
import json
import os
from datetime import datetime
from config import Config

class DataLoader:
    """Carrega dados do backend e arquivos CSV"""
    
    def __init__(self, backend_url=None, api_token=None):
        self.backend_url = backend_url or Config.BACKEND_URL
        self.api_token = api_token or Config.API_TOKEN
        self.headers = {'Authorization': f'Bearer {self.api_token}'} if self.api_token else {}
        self.data_path = Config.DATA_PATH
    
    def load_from_api(self, endpoint):
        """
        Carrega dados da API do backend
        
        Args:
            endpoint: Endpoint da API (ex: '/api/tasks', '/api/data/summary')
        
        Returns:
            dict: Dados da API
        """
        try:
            url = f"{self.backend_url}{endpoint}"
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"❌ Erro ao conectar com API: {e}")
            return None
    
    def load_tasks_from_api(self):
        """Carrega tarefas da API"""
        print("📥 Carregando tarefas da API...")
        data = self.load_from_api('/api/tasks')
        if data:
            df = pd.DataFrame(data)
            print(f"✅ {len(df)} tarefas carregadas")
            return df
        return None
    
    def load_summary_from_api(self):
        """Carrega resumo de dados da API"""
        print("📥 Carregando resumo de dados...")
        data = self.load_from_api('/api/data/summary')
        if data:
            print(f"✅ Resumo carregado: {data}")
            return data
        return None
    
    def load_csv(self, filename):
        """
        Carrega dados de arquivo CSV
        
        Args:
            filename: Nome do arquivo na pasta data/
        
        Returns:
            DataFrame: Dados do CSV
        """
        filepath = os.path.join(self.data_path, filename)
        try:
            df = pd.read_csv(filepath, encoding='utf-8')
            print(f"✅ {filename} carregado: {len(df)} linhas")
            return df
        except FileNotFoundError:
            print(f"❌ Arquivo não encontrado: {filepath}")
            return None
        except Exception as e:
            print(f"❌ Erro ao ler {filename}: {e}")
            return None
    
    def load_all_csv_files(self):
        """Carrega todos os arquivos CSV da pasta data/"""
        print("📂 Procurando arquivos CSV...")
        dataframes = {}
        
        if not os.path.exists(self.data_path):
            print(f"❌ Pasta {self.data_path} não existe")
            return dataframes
        
        for file in os.listdir(self.data_path):
            if file.endswith('.csv'):
                df = self.load_csv(file)
                if df is not None:
                    key = file.replace('.csv', '')
                    dataframes[key] = df
        
        return dataframes
    
    def save_dataframe(self, df, filename, format='csv'):
        """
        Salva DataFrame em arquivo
        
        Args:
            df: DataFrame para salvar
            filename: Nome do arquivo
            format: Formato ('csv' ou 'json')
        """
        output_path = os.path.join(Config.OUTPUT_PATH, filename)
        os.makedirs(Config.OUTPUT_PATH, exist_ok=True)
        
        try:
            if format == 'csv':
                df.to_csv(output_path, index=False, encoding='utf-8')
            elif format == 'json':
                df.to_json(output_path, orient='records', indent=2, force_ascii=False)
            
            print(f"✅ {filename} salvo em {output_path}")
        except Exception as e:
            print(f"❌ Erro ao salvar {filename}: {e}")


if __name__ == "__main__":
    loader = DataLoader()
    
    # Carregar CSVs
    dataframes = loader.load_all_csv_files()
    
    # Carregar dados da API (descomente se o backend estiver rodando)
    # tasks_df = loader.load_tasks_from_api()
    # summary = loader.load_summary_from_api()
