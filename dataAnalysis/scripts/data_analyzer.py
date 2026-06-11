import json
import os
import unicodedata

import pandas as pd

try:
    from .data_loader import DataLoader
    from .data_cleaner import DataCleaner
    from .config import Config
except ImportError:
    from data_loader import DataLoader
    from data_cleaner import DataCleaner
    from config import Config


def _normalize_text(value):
    """Normaliza texto para comparação simples de categorias."""
    if pd.isna(value):
        return ""

    normalized = unicodedata.normalize('NFKD', str(value).lower())
    return ''.join(char for char in normalized if not unicodedata.combining(char)).strip()


def calculate_task_metrics(tasks_df, status_history_df=None):
    """Calcula métricas iniciais de produtividade a partir das tarefas."""
    if tasks_df is None or tasks_df.empty:
        return {
            'resumo': {
                'quantidade_tarefas': 0,
                'tarefas_concluidas': 0,
                'tarefas_pendentes': 0,
                'tarefas_em_andamento': 0,
                'taxa_conclusao': 0.0,
                'taxa_pendencia': 0.0,
                'tempo_medio_conclusao_dias': None,
                'tarefas_atrasadas': 0,
            },
            'padrões': {
                'status_distribution': {},
                'prioridade_distribution': {},
                'responsaveis': {},
            },
            'visualizacao': {
                'cards': [],
                'chart_data': {
                    'labels': ['Concluídas', 'Pendentes', 'Em andamento'],
                    'series': [{'name': 'Quantidade', 'data': [0, 0, 0]}],
                },
            },
        }

    tasks = tasks_df.copy()

    if 'status' in tasks.columns:
        tasks['status'] = tasks['status'].fillna('Sem status').astype(str).str.strip()
    else:
        tasks['status'] = 'Sem status'

    normalized_statuses = tasks['status'].apply(_normalize_text)
    status_distribution = tasks['status'].value_counts().to_dict()

    completed = int((normalized_statuses == 'concluido').sum())
    pending = int((normalized_statuses == 'pendente').sum())
    in_progress = int(
        (normalized_statuses == 'em progresso').sum()
        + (normalized_statuses == 'em_progresso').sum()
        + (normalized_statuses == 'em andamento').sum()
    )

    total_tasks = len(tasks)
    completion_rate = round((completed / total_tasks) * 100, 1) if total_tasks else 0.0
    pending_rate = round((pending / total_tasks) * 100, 1) if total_tasks else 0.0

    priority_distribution = {}
    if 'prioridade' in tasks.columns:
        priority_distribution = tasks['prioridade'].fillna('Sem prioridade').astype(str).value_counts().to_dict()

    responsible_distribution = {}
    if 'responsavel_id' in tasks.columns:
        responsible_distribution = tasks['responsavel_id'].fillna('Sem responsável').astype(str).value_counts().to_dict()

    overdue_count = 0
    if 'data_vencimento' in tasks.columns:
        due_dates = pd.to_datetime(tasks['data_vencimento'], errors='coerce')
        today = pd.Timestamp.today().normalize()
        overdue_mask = due_dates.lt(today) & (normalized_statuses != 'concluido')
        overdue_count = int(overdue_mask.sum())

    avg_completion_days = None
    if status_history_df is not None and not status_history_df.empty:
        history = status_history_df.copy()
        if 'data_mudanca' in history.columns:
            history['data_mudanca'] = pd.to_datetime(history['data_mudanca'], errors='coerce')

        task_id_col = 'id' if 'id' in tasks.columns else None
        history_id_col = 'atividade_id' if 'atividade_id' in history.columns else 'id' if 'id' in history.columns else None

        if task_id_col and history_id_col and 'data_mudanca' in history.columns and 'status_novo' in history.columns:
            completed_events = history.loc[
                history['status_novo'].apply(_normalize_text).eq('concluido'),
                [history_id_col, 'data_mudanca'],
            ]
            if not completed_events.empty and 'data_criacao' in tasks.columns:
                completion_dates = completed_events.groupby(history_id_col)['data_mudanca'].max()
                tasks['data_criacao'] = pd.to_datetime(tasks['data_criacao'], errors='coerce')
                tasks['data_conclusao'] = tasks[task_id_col].map(completion_dates)
                tasks['dias_ate_conclusao'] = (tasks['data_conclusao'] - tasks['data_criacao']).dt.days
                avg_completion_days = round(tasks['dias_ate_conclusao'].dropna().mean(), 1) if tasks['dias_ate_conclusao'].notna().any() else None

    return {
        'resumo': {
            'quantidade_tarefas': total_tasks,
            'tarefas_concluidas': completed,
            'tarefas_pendentes': pending,
            'tarefas_em_andamento': in_progress,
            'taxa_conclusao': completion_rate,
            'taxa_pendencia': pending_rate,
            'tempo_medio_conclusao_dias': avg_completion_days,
            'tarefas_atrasadas': overdue_count,
        },
        'padrões': {
            'status_distribution': {str(key): int(value) for key, value in status_distribution.items()},
            'prioridade_distribution': {str(key): int(value) for key, value in priority_distribution.items()},
            'responsaveis': {str(key): int(value) for key, value in responsible_distribution.items()},
        },
        'visualizacao': {
            'cards': [
                {'key': 'quantidade_tarefas', 'label': 'Tarefas cadastradas', 'value': total_tasks},
                {'key': 'tarefas_concluidas', 'label': 'Tarefas concluídas', 'value': completed},
                {'key': 'tarefas_pendentes', 'label': 'Tarefas pendentes', 'value': pending},
            ],
            'chart_data': {
                'labels': ['Concluídas', 'Pendentes', 'Em andamento'],
                'series': [{'name': 'Quantidade', 'data': [completed, pending, in_progress]}],
            },
        },
    }


class DataAnalyzer:
    """Classe principal para análise de dados do TaskInsight"""
    
    def __init__(self):
        self.loader = DataLoader()
        self.cleaner = DataCleaner()
        self.dataframes = {}
        self.reports = {}
        self.task_metrics = {}
    
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

            # Normalizar colunas de data quando existirem
            if name == 'atividades':
                df_clean = self.cleaner.validate_dates(df_clean, ['data_criacao', 'data_vencimento'])
            elif name == 'status_historico':
                df_clean = self.cleaner.validate_dates(df_clean, ['data_mudanca'])
            
            # Gerar relatório de qualidade
            self.reports[name] = self.cleaner.get_data_quality_report(df_clean)
            
            self.dataframes[name] = df_clean

        self.task_metrics = calculate_task_metrics(
            self.dataframes.get('atividades'),
            self.dataframes.get('status_historico')
        )
        
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

        metrics_file = os.path.join(Config.OUTPUT_PATH, 'metricas_tarefas.json')
        with open(metrics_file, 'w', encoding='utf-8') as f:
            json.dump(self.task_metrics, f, indent=2, ensure_ascii=False, default=str)
        print(f"✅ Métricas salvas em {metrics_file}")
    
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
            'qualidade': self.reports,
            'metricas_tarefas': self.task_metrics
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
