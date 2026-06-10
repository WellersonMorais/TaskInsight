#!/usr/bin/env python3
"""
Script simples para processar dados do TaskInsight
"""
import sys
import os
import pandas as pd

# Diretórios
script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(script_dir, 'data')
output_dir = os.path.join(script_dir, 'outputs')

os.makedirs(output_dir, exist_ok=True)

print("=" * 60)
print("🚀 INICIANDO PROCESSAMENTO DE DADOS - TASKINSIGHT")
print("=" * 60)

# Carregar dados
print("\n[1/4] Carregando dados...")
dataframes = {}
for file in os.listdir(data_dir):
    if file.endswith('.csv'):
        filepath = os.path.join(data_dir, file)
        df = pd.read_csv(filepath, encoding='utf-8')
        name = file.replace('.csv', '')
        dataframes[name] = df
        print(f"  ✅ {name}: {len(df)} linhas × {len(df.columns)} colunas")

# Limpar dados
print("\n[2/4] Limpando dados...")
for name, df in dataframes.items():
    # Remover duplicatas
    original_len = len(df)
    df = df.drop_duplicates()
    removed = original_len - len(df)
    
    # Remover valores nulos
    df = df.dropna()
    
    dataframes[name] = df
    print(f"  ✅ {name}: {removed} duplicatas removidas, {len(df)} linhas finais")

# Validar dados
print("\n[3/4] Validando dados...")
for name, df in dataframes.items():
    print(f"\n  {name}:")
    print(f"    • Linhas: {len(df)}")
    print(f"    • Colunas: {len(df.columns)}")
    print(f"    • Valores nulos: {df.isnull().sum().sum()}")
    print(f"    • Duplicatas: {df.duplicated().sum()}")
    print(f"    • Memória: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")

# Salvar resultados
print("\n[4/4] Salvando resultados...")
for name, df in dataframes.items():
    # CSV
    csv_path = os.path.join(output_dir, f'{name}_limpo.csv')
    df.to_csv(csv_path, index=False, encoding='utf-8')
    print(f"  ✅ {name}_limpo.csv")
    
    # JSON
    json_path = os.path.join(output_dir, f'{name}_limpo.json')
    df.to_json(json_path, orient='records', indent=2, force_ascii=False)
    print(f"  ✅ {name}_limpo.json")

print("\n" + "=" * 60)
print("✨ PROCESSAMENTO CONCLUÍDO COM SUCESSO!")
print("=" * 60)
print(f"\n📁 Resultados salvos em: {output_dir}")
print(f"   {len(os.listdir(output_dir))} arquivos gerados\n")
