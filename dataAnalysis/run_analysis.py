#!/usr/bin/env python3
import sys
import os

# Add scripts to path
sys.path.insert(0, os.path.join(os.getcwd(), 'scripts'))

from data_analyzer import DataAnalyzer
from visualizations import main as gerar_visualizacoes

if __name__ == "__main__":
    analyzer = DataAnalyzer()
    success = analyzer.load_and_process_all_data()

    if success:
        analyzer.export_analysis_report()
        print("\n✅ Análise completada com sucesso!")

        print("\n─────────────────────────────────────────")
        gerar_visualizacoes()

