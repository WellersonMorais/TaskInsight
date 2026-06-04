import pandas as pd
import numpy as np
from datetime import datetime

class DataCleaner:
    """Realiza limpeza e validação de dados"""
    
    def __init__(self):
        self.report = {}
    
    def clean_dataframe(self, df, column_types=None):
        """
        Realiza limpeza básica em um DataFrame
        
        Args:
            df: DataFrame para limpar
            column_types: Dict com tipos esperados de colunas
        
        Returns:
            DataFrame: Dados limpos
        """
        print(f"\n🧹 Limpando DataFrame com {len(df)} linhas...")
        original_rows = len(df)
        
        # Remover linhas duplicadas
        df = df.drop_duplicates()
        print(f"  • Removidas {original_rows - len(df)} linhas duplicadas")
        
        # Remover linhas completamente vazias
        df = df.dropna(how='all')
        
        # Converter tipos de dados
        if column_types:
            for col, dtype in column_types.items():
                if col in df.columns:
                    try:
                        df[col] = df[col].astype(dtype)
                    except Exception as e:
                        print(f"  ⚠️  Erro ao converter {col} para {dtype}: {e}")
        
        print(f"✅ Limpeza concluída: {len(df)} linhas restantes")
        return df
    
    def handle_missing_values(self, df, strategy='drop'):
        """
        Trata valores faltantes
        
        Args:
            df: DataFrame
            strategy: 'drop' (remover linhas) ou 'fill' (preencher com valor padrão)
        
        Returns:
            DataFrame: Dados tratados
        """
        missing_count = df.isnull().sum().sum()
        
        if missing_count == 0:
            print("✅ Nenhum valor faltante encontrado")
            return df
        
        print(f"⚠️  {missing_count} valores faltantes encontrados")
        
        if strategy == 'drop':
            df = df.dropna()
            print(f"  • Removidas linhas com valores faltantes")
        elif strategy == 'fill':
            df = df.fillna(df.mean(numeric_only=True))
            print(f"  • Valores numéricos preenchidos com média")
        
        return df
    
    def standardize_text_columns(self, df, columns):
        """
        Padroniza colunas de texto (lowercase, sem espaços extras)
        
        Args:
            df: DataFrame
            columns: Lista de nomes de colunas para padronizar
        
        Returns:
            DataFrame: Dados padronizados
        """
        print(f"\n📝 Padronizando {len(columns)} colunas de texto...")
        
        for col in columns:
            if col in df.columns:
                df[col] = df[col].str.strip().str.lower()
        
        print(f"✅ Texto padronizado")
        return df
    
    def validate_dates(self, df, date_columns):
        """
        Valida e converte colunas de data
        
        Args:
            df: DataFrame
            date_columns: Lista de nomes de colunas de data
        
        Returns:
            DataFrame: Datas validadas
        """
        print(f"\n📅 Validando {len(date_columns)} colunas de data...")
        
        for col in date_columns:
            if col in df.columns:
                try:
                    df[col] = pd.to_datetime(df[col], errors='coerce')
                    invalid = df[col].isnull().sum()
                    if invalid > 0:
                        print(f"  ⚠️  {col}: {invalid} datas inválidas")
                except Exception as e:
                    print(f"  ❌ Erro ao processar {col}: {e}")
        
        return df
    
    def remove_duplicates_by_column(self, df, column, keep='first'):
        """
        Remove duplicatas baseado em uma coluna específica
        
        Args:
            df: DataFrame
            column: Nome da coluna para verificar duplicatas
            keep: 'first', 'last' ou False (remover todas)
        
        Returns:
            DataFrame: Dados sem duplicatas
        """
        duplicates = df.duplicated(subset=[column], keep=False).sum()
        
        if duplicates > 0:
            print(f"⚠️  {duplicates} duplicatas encontradas em '{column}'")
            df = df.drop_duplicates(subset=[column], keep=keep)
            print(f"✅ Duplicatas removidas")
        
        return df
    
    def get_data_quality_report(self, df):
        """
        Gera relatório de qualidade dos dados
        
        Args:
            df: DataFrame
        
        Returns:
            dict: Relatório de qualidade
        """
        report = {
            'total_rows': len(df),
            'total_columns': len(df.columns),
            'memory_usage_mb': df.memory_usage(deep=True).sum() / 1024 ** 2,
            'missing_values': df.isnull().sum().to_dict(),
            'duplicates': df.duplicated().sum(),
            'dtypes': df.dtypes.to_dict(),
            'timestamp': datetime.now().isoformat()
        }
        
        return report
    
    def print_quality_report(self, df, name="Dataset"):
        """Imprime relatório de qualidade"""
        report = self.get_data_quality_report(df)
        
        print(f"\n📊 Relatório de Qualidade - {name}")
        print("=" * 50)
        print(f"Total de linhas: {report['total_rows']}")
        print(f"Total de colunas: {report['total_columns']}")
        print(f"Memória usada: {report['memory_usage_mb']:.2f} MB")
        print(f"Linhas duplicadas: {report['duplicates']}")
        print(f"\nValores faltantes:")
        
        missing = report['missing_values']
        if any(missing.values()):
            for col, count in missing.items():
                if count > 0:
                    pct = (count / report['total_rows']) * 100
                    print(f"  • {col}: {count} ({pct:.1f}%)")
        else:
            print("  ✅ Nenhum valor faltante!")
        
        print("=" * 50)
        
        return report


if __name__ == "__main__":
    # Exemplo de uso
    cleaner = DataCleaner()
    print("🧹 Módulo de limpeza de dados pronto para uso")
