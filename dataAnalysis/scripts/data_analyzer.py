import pandas as pd
import numpy as np
from data_loader import DataLoader
from data_cleaner import DataCleaner
from config import Config
import json
import os

class DataAnalyzer:
    """Classe principal para análise de dados do TaskInsight"""
    
    def __init__(self):
        self.loader = DataLoader()
        self.cleaner = DataCleaner()
        self.dataframes = {}
        self.reports = {}
    
    def load_and_process_all_data(self):
        """
        Carrega, limpa e valida todos os dados disponíveis
        """
        print("\n" + "=" * 60)
        print("🚀 INICIANDO ANÁLISE DE DADOS - TASKINSIGHT")
        print("=" * 60)
        
        # 1. Carregar dados
        print("\n[1/4] Carregando dados...")
        self.dataframes = self.loader.load_all_csv_files()
        
        if not self.dataframes:
            print("⚠️  Nenhum arquivo CSV encontrado em data/")
            return False
        
        # 2. Limpar dados
        print("\n[2/4] Limpando dados...")
        for name, df in self.dataframes.items():
            print(f"\n  Processando: {name}")
            
            # Limpeza básica
            df_clean = self.cleaner.clean_dataframe(df)
            
            # Remover valores faltantes
            df_clean = self.cleaner.handle_missing_values(df_clean, strategy='drop')
            
            # Gerar relatório de qualidade
            self.reports[name] = self.cleaner.get_data_quality_report(df_clean)
            
            self.dataframes[name] = df_clean
        
        # 3. Validar dados
        print("\n[3/4] Validando consistência dos dados...")
        self.validate_data()
        
        # 4. Salvar resultados
        print("\n[4/4] Salvando resultados...")
        self.save_processed_data()
        
        print("\n" + "=" * 60)
        print("✅ ANÁLISE CONCLUÍDA COM SUCESSO!")
        print("=" * 60)
        
        return True
    
    def validate_data(self):
        """Valida a consistência dos dados"""
        print("\n📋 Validação de Dados:")
        
        for name, df in self.dataframes.items():
            print(f"\n  ✓ {name}")
            print(f"    - Linhas: {len(df)}")
            print(f"    - Colunas: {len(df.columns)}")
            print(f"    - Valores nulos: {df.isnull().sum().sum()}")
            print(f"    - Duplicatas: {df.duplicated().sum()}")
            
            # Validações específicas por tipo
            if 'data' in name.lower() or 'date' in df.columns:
                date_cols = df.select_dtypes(include=['datetime64']).columns
                if len(date_cols) > 0:
                    print(f"    - Colunas de data: {list(date_cols)}")
            
            if 'responsável' in name.lower() or 'responsaveis' in name.lower():
                if 'nome' in df.columns:
                    print(f"    - Responsáveis únicos: {df['nome'].nunique()}")
                if 'email' in df.columns:
                    emails_validos = df['email'].str.contains('@', na=False).sum()
                    print(f"    - Emails válidos: {emails_validos}/{len(df)}")
    
    def save_processed_data(self):
        """Salva dados processados e relatórios"""
        
        # Salvar DataFrames
        for name, df in self.dataframes.items():
            self.loader.save_dataframe(df, f'{name}_limpo.csv', format='csv')
            self.loader.save_dataframe(df, f'{name}_limpo.json', format='json')
        
        # Salvar relatórios
        reports_file = os.path.join(Config.OUTPUT_PATH, 'relatorio_qualidade.json')
        with open(reports_file, 'w', encoding='utf-8') as f:
            json.dump(self.reports, f, indent=2, ensure_ascii=False, default=str)
        print(f"✅ Relatório salvo em {reports_file}")
    
    def get_summary_statistics(self):
        """Retorna estatísticas resumidas dos dados"""
        summary = {}
        
        for name, df in self.dataframes.items():
            summary[name] = {
                'total_registros': len(df),
                'total_colunas': len(df.columns),
                'colunas': list(df.columns),
                'tipos': df.dtypes.to_dict(),
                'valores_nulos': df.isnull().sum().to_dict()
            }
        
        return summary
    
    def export_analysis_report(self):
        """Exporta relatório completo da análise"""
        report = {
            'data_analise': pd.Timestamp.now().isoformat(),
            'resumo': self.get_summary_statistics(),
            'qualidade': self.reports
        }
        
        report_file = os.path.join(Config.OUTPUT_PATH, 'relatorio_analise_completo.json')
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"\n📄 Relatório completo exportado para: {report_file}")
        return report


def main():
    """Função principal"""
    analyzer = DataAnalyzer()
    
    # Executar análise completa
    success = analyzer.load_and_process_all_data()
    
    if success:
        # Gerar e exportar relatórios
        analyzer.export_analysis_report()
        
        # Mostrar sumário
        summary = analyzer.get_summary_statistics()
        print("\n📊 SUMÁRIO DOS DADOS:")
        print(json.dumps(summary, indent=2, ensure_ascii=False, default=str))


if __name__ == "__main__":
    main()
