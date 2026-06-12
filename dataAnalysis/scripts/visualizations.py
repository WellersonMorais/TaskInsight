"""
TaskInsight - Visualizações de Produtividade
Gera gráficos a partir das métricas e dados processados da plataforma.
"""

import os
import json
import warnings
warnings.filterwarnings("ignore", message="This figure includes Axes that are not compatible with tight_layout")
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.gridspec as gridspec
import seaborn as sns
import numpy as np
from datetime import datetime
from pathlib import Path

# ── Configurações visuais ────────────────────────────────────────────────────

CORES = {
    "Concluído":    "#2ecc71",   # verde
    "Em Progresso": "#3498db",   # azul
    "Pendente":     "#e74c3c",   # vermelho
    "Alta":         "#e74c3c",
    "Média":        "#f39c12",
    "Baixa":        "#2ecc71",
}

PALETA_PRINCIPAL = ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6"]

plt.rcParams.update({
    "font.family":        "DejaVu Sans",
    "font.size":          11,
    "axes.spines.top":    False,
    "axes.spines.right":  False,
    "axes.titlepad":      14,
    "axes.titlesize":     13,
    "axes.titleweight":   "bold",
    "axes.labelsize":     11,
    "xtick.labelsize":    10,
    "ytick.labelsize":    10,
    "figure.facecolor":   "#f8f9fa",
    "axes.facecolor":     "#ffffff",
    "savefig.facecolor":  "#f8f9fa",
    "savefig.dpi":        150,
    "savefig.bbox":       "tight",
})

# ── Caminhos ─────────────────────────────────────────────────────────────────

BASE_DIR    = Path(__file__).resolve().parent.parent
OUTPUTS_DIR = BASE_DIR / "outputs"
CHARTS_DIR  = OUTPUTS_DIR / "charts"
CHARTS_DIR.mkdir(parents=True, exist_ok=True)


def _salvar(fig: plt.Figure, nome: str) -> Path:
    caminho = CHARTS_DIR / nome
    fig.savefig(caminho)
    plt.close(fig)
    print(f"  ✔ Salvo: {caminho.relative_to(BASE_DIR)}")
    return caminho


# ── Carregamento de dados ─────────────────────────────────────────────────────

def carregar_dados():
    atividades      = pd.read_csv(OUTPUTS_DIR / "atividades_limpo.csv", parse_dates=["data_criacao", "data_vencimento"])
    responsaveis    = pd.read_csv(OUTPUTS_DIR / "responsaveis_limpo.csv")
    status_historico = pd.read_csv(OUTPUTS_DIR / "status_historico_limpo.csv", parse_dates=["data_mudanca"])

    with open(OUTPUTS_DIR / "metricas_tarefas.json", encoding="utf-8") as f:
        metricas = json.load(f)

    # Enriquecer atividades com nome do responsável
    atividades = atividades.merge(
        responsaveis[["id", "nome"]].rename(columns={"id": "responsavel_id", "nome": "responsavel_nome"}),
        on="responsavel_id", how="left"
    )

    # Coluna de atraso (referência: data da análise)
    hoje = pd.Timestamp("2026-06-11")
    atividades["atrasada"] = (
        (atividades["data_vencimento"] < hoje) &
        (atividades["status"] != "Concluído")
    )

    return atividades, responsaveis, status_historico, metricas


# ── Gráfico 1 — Tarefas por Status (pizza + barra) ───────────────────────────

def grafico_tarefas_por_status(atividades: pd.DataFrame) -> Path:
    """Painel duplo: distribuição por status em pizza e barra horizontal."""
    contagem = atividades["status"].value_counts()
    total    = contagem.sum()
    cores    = [CORES.get(s, "#95a5a6") for s in contagem.index]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    fig.suptitle("Distribuição de Tarefas por Status", fontsize=15, fontweight="bold", y=1.02)

    # — Pizza
    wedges, texts, autotexts = ax1.pie(
        contagem.values,
        labels=contagem.index,
        colors=cores,
        autopct="%1.0f%%",
        startangle=90,
        wedgeprops={"linewidth": 2, "edgecolor": "white"},
        textprops={"fontsize": 11},
    )
    for at in autotexts:
        at.set_fontsize(12)
        at.set_fontweight("bold")
        at.set_color("white")
    ax1.set_title("Proporção por Status")

    # — Barra horizontal
    bars = ax2.barh(contagem.index, contagem.values, color=cores, height=0.5)
    ax2.set_xlabel("Número de Tarefas")
    ax2.set_title("Quantidade por Status")
    ax2.set_xlim(0, contagem.max() + 1.5)

    for bar, val in zip(bars, contagem.values):
        pct = val / total * 100
        ax2.text(
            bar.get_width() + 0.1, bar.get_y() + bar.get_height() / 2,
            f"{val}  ({pct:.0f}%)",
            va="center", fontsize=11, color="#2c3e50"
        )

    # Legenda compartilhada
    patches = [mpatches.Patch(color=CORES.get(s, "#95a5a6"), label=s) for s in contagem.index]
    fig.legend(handles=patches, loc="lower center", ncol=len(patches),
               frameon=False, fontsize=10, bbox_to_anchor=(0.5, -0.04))

    fig.tight_layout()
    return _salvar(fig, "01_tarefas_por_status.png")


# ── Gráfico 2 — Produtividade Geral (KPIs + gauge) ───────────────────────────

def grafico_produtividade_geral(metricas: dict) -> Path:
    """Cards de KPI e gauge da taxa de conclusão."""
    r   = metricas["resumo"]
    fig = plt.figure(figsize=(13, 5))
    gs  = gridspec.GridSpec(1, 5, figure=fig, wspace=0.4)

    # Dados dos cards
    cards = [
        ("Total de\nTarefas",       r["quantidade_tarefas"],          "#3498db", ""),
        ("Concluídas",              r["tarefas_concluidas"],           "#2ecc71", ""),
        ("Em Andamento",            r["tarefas_em_andamento"],         "#3498db", ""),
        ("Pendentes",               r["tarefas_pendentes"],            "#e74c3c", ""),
        ("Atrasadas",               r["tarefas_atrasadas"],            "#e67e22", ""),
    ]

    for i, (label, valor, cor, sufixo) in enumerate(cards):
        ax = fig.add_subplot(gs[0, i])
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis("off")

        # Fundo do card
        fundo = mpatches.FancyBboxPatch(
            (0.05, 0.05), 0.9, 0.9,
            boxstyle="round,pad=0.05",
            linewidth=2, edgecolor=cor,
            facecolor=cor + "22",
        )
        ax.add_patch(fundo)

        # Valor grande
        ax.text(0.5, 0.58, f"{valor}{sufixo}", ha="center", va="center",
                fontsize=30, fontweight="bold", color=cor)
        # Label
        ax.text(0.5, 0.22, label, ha="center", va="center",
                fontsize=10, color="#555555", wrap=True)

    fig.suptitle("Indicadores de Produtividade Geral", fontsize=15,
                 fontweight="bold", y=1.05)

    # Gauge da taxa de conclusão como subplot extra (abaixo)
    fig2, ax_g = plt.subplots(figsize=(6, 3.5))
    _desenhar_gauge(ax_g, r["taxa_conclusao"], "Taxa de Conclusão")
    fig2.tight_layout()
    _salvar(fig2, "02b_gauge_taxa_conclusao.png")

    fig.tight_layout()
    return _salvar(fig, "02a_produtividade_kpis.png")


def _desenhar_gauge(ax: plt.Axes, valor: float, titulo: str):
    """Semi-círculo estilo gauge."""
    theta = np.linspace(np.pi, 0, 300)

    # Faixas coloridas
    faixas = [(0, 33, "#e74c3c"), (33, 66, "#f39c12"), (66, 100, "#2ecc71")]
    for inicio, fim, cor in faixas:
        t_i = np.pi - (inicio / 100) * np.pi
        t_f = np.pi - (fim   / 100) * np.pi
        t   = np.linspace(t_i, t_f, 100)
        ax.fill_between(np.cos(t), np.sin(t),
                        0.7 * np.cos(t), 0.7 * np.sin(t),
                        alpha=0.85, color=cor)

    # Ponteiro
    angulo   = np.pi - (valor / 100) * np.pi
    ax.annotate("", xy=(0.82 * np.cos(angulo), 0.82 * np.sin(angulo)),
                xytext=(0, 0),
                arrowprops=dict(arrowstyle="-|>", color="#2c3e50",
                                lw=3, mutation_scale=20))
    ax.plot(0, 0, "o", color="#2c3e50", markersize=8, zorder=5)

    # Valor central
    ax.text(0, 0.3, f"{valor:.0f}%", ha="center", va="center",
            fontsize=26, fontweight="bold", color="#2c3e50")

    # Rótulos das faixas
    for pct, label in [(16, "Baixo"), (50, "Médio"), (84, "Alto")]:
        a = np.pi - (pct / 100) * np.pi
        ax.text(1.15 * np.cos(a), 1.15 * np.sin(a), label,
                ha="center", va="center", fontsize=9, color="#666")

    ax.set_xlim(-1.3, 1.3)
    ax.set_ylim(-0.1, 1.3)
    ax.set_aspect("equal")
    ax.axis("off")
    ax.set_title(titulo, fontsize=13, fontweight="bold", pad=10)


# ── Gráfico 3 — Tarefas por Responsável ──────────────────────────────────────

def grafico_tarefas_por_responsavel(atividades: pd.DataFrame) -> Path:
    """Barras empilhadas por responsável e status."""
    pivot = (
        atividades.groupby(["responsavel_nome", "status"])
        .size()
        .unstack(fill_value=0)
    )
    # Garantir ordem das colunas
    for col in ["Concluído", "Em Progresso", "Pendente"]:
        if col not in pivot.columns:
            pivot[col] = 0
    pivot = pivot[["Concluído", "Em Progresso", "Pendente"]]

    fig, ax = plt.subplots(figsize=(10, 5))
    cores_cols = [CORES[c] for c in pivot.columns]
    pivot.plot(kind="bar", stacked=True, ax=ax, color=cores_cols,
               width=0.55, edgecolor="white", linewidth=1.5)

    ax.set_title("Distribuição de Tarefas por Responsável e Status")
    ax.set_xlabel("Responsável")
    ax.set_ylabel("Número de Tarefas")
    ax.set_xticklabels(pivot.index, rotation=15, ha="right")
    ax.yaxis.set_major_locator(plt.MaxNLocator(integer=True))
    ax.legend(title="Status", bbox_to_anchor=(1.01, 1), loc="upper left", frameon=False)

    # Rótulos de total
    for i, total in enumerate(pivot.sum(axis=1)):
        ax.text(i, total + 0.08, str(int(total)),
                ha="center", fontweight="bold", fontsize=11)

    fig.tight_layout()
    return _salvar(fig, "03_tarefas_por_responsavel.png")


# ── Gráfico 4 — Distribuição por Prioridade ──────────────────────────────────

def grafico_prioridade(atividades: pd.DataFrame) -> Path:
    """Barras horizontais de prioridade com destaque de atrasos."""
    ordem    = ["Alta", "Média", "Baixa"]
    contagem = atividades["prioridade"].value_counts().reindex(ordem).dropna()
    atrasos  = atividades[atividades["atrasada"]]["prioridade"].value_counts().reindex(ordem).fillna(0)

    fig, ax = plt.subplots(figsize=(9, 4))
    y = np.arange(len(contagem))
    h = 0.35

    ax.barh(y + h/2, contagem.values,
            height=h, color=[CORES.get(p, "#95a5a6") for p in contagem.index],
            label="Total", alpha=0.85)
    ax.barh(y - h/2, atrasos.reindex(contagem.index).fillna(0).values,
            height=h, color="#c0392b", label="Atrasadas", alpha=0.85, hatch="//")

    ax.set_yticks(y)
    ax.set_yticklabels(contagem.index)
    ax.set_xlabel("Número de Tarefas")
    ax.set_title("Tarefas por Prioridade — Total vs. Atrasadas")
    ax.legend(frameon=False)
    ax.xaxis.set_major_locator(plt.MaxNLocator(integer=True))

    for i, val in enumerate(contagem.values):
        ax.text(val + 0.08, i + h/2, str(int(val)),
                va="center", fontsize=10)

    fig.tight_layout()
    return _salvar(fig, "04_tarefas_por_prioridade.png")


# ── Gráfico 5 — Timeline / Evolução temporal ─────────────────────────────────

def grafico_timeline(atividades: pd.DataFrame) -> Path:
    """Linha do tempo das tarefas com indicação de status e atraso."""
    df = atividades.sort_values("data_criacao").reset_index(drop=True)
    df["y"] = range(len(df))

    fig, ax = plt.subplots(figsize=(13, 5))

    hoje = pd.Timestamp("2026-06-11")
    ax.axvline(hoje, color="#e74c3c", lw=1.5, ls="--", label="Hoje (11/06/2026)", zorder=3)

    for _, row in df.iterrows():
        cor   = CORES.get(row["status"], "#95a5a6")
        alpha = 0.9
        ax.barh(row["y"],
                (row["data_vencimento"] - row["data_criacao"]).days,
                left=row["data_criacao"], height=0.6,
                color=cor, alpha=alpha, edgecolor="white", linewidth=1)

        # Marca atraso
        if row["atrasada"]:
            ax.plot(row["data_vencimento"], row["y"], "X",
                    color="#c0392b", markersize=9, zorder=4)

        # Rótulo do título
        ax.text(row["data_criacao"], row["y"] + 0.32,
                row["titulo"], fontsize=8.5, va="bottom", color="#2c3e50")

    ax.set_yticks(df["y"])
    ax.set_yticklabels(df["responsavel_nome"], fontsize=9)
    ax.set_xlabel("Data")
    ax.set_title("Timeline das Tarefas por Responsável")

    patches = [mpatches.Patch(color=CORES[s], label=s)
               for s in ["Concluído", "Em Progresso", "Pendente"]]
    patches.append(mpatches.Patch(facecolor="white", edgecolor="white", label="✕ = Atrasada"))
    ax.legend(handles=patches, loc="lower right", frameon=False, fontsize=9)

    ax.xaxis.set_major_formatter(
        plt.matplotlib.dates.DateFormatter("%d/%m")
    )
    fig.autofmt_xdate()
    fig.tight_layout()
    return _salvar(fig, "05_timeline_tarefas.png")


# ── Gráfico 6 — Histórico de Mudanças de Status ───────────────────────────────

def grafico_historico_status(status_historico: pd.DataFrame) -> Path:
    """Fluxo de transições de status ao longo do tempo."""
    df = status_historico.copy()
    df["semana"] = df["data_mudanca"].dt.to_period("W").dt.start_time

    contagem = (
        df.groupby(["semana", "status_novo"])
        .size()
        .unstack(fill_value=0)
    )

    fig, ax = plt.subplots(figsize=(10, 4.5))
    for col in contagem.columns:
        cor = CORES.get(col, "#95a5a6")
        ax.plot(contagem.index, contagem[col], marker="o",
                color=cor, linewidth=2.5, markersize=7, label=col)
        ax.fill_between(contagem.index, contagem[col], alpha=0.10, color=cor)

    ax.set_title("Evolução Semanal das Mudanças de Status")
    ax.set_xlabel("Semana")
    ax.set_ylabel("Número de Mudanças")
    ax.yaxis.set_major_locator(plt.MaxNLocator(integer=True))
    ax.legend(frameon=False)
    ax.xaxis.set_major_formatter(plt.matplotlib.dates.DateFormatter("%d/%m"))
    fig.autofmt_xdate()
    fig.tight_layout()
    return _salvar(fig, "06_historico_status.png")


# ── Dashboard de Apresentação Final ──────────────────────────────────────────

def dashboard_apresentacao(atividades: pd.DataFrame, metricas: dict) -> Path:
    """
    Painel único 2x3 para apresentação executiva.
    Combina os principais gráficos em uma única figura coesa.
    """
    r = metricas["resumo"]

    fig = plt.figure(figsize=(18, 11))
    fig.patch.set_facecolor("#f0f4f8")
    gs  = gridspec.GridSpec(3, 3, figure=fig, hspace=0.55, wspace=0.4,
                            top=0.88, bottom=0.06, left=0.06, right=0.97)

    # ── Linha 0: KPI Cards ────────────────────────────────────────────────
    kpis = [
        ("Total",        r["quantidade_tarefas"],     "#3498db"),
        ("Concluídas",   r["tarefas_concluidas"],      "#2ecc71"),
        ("Em Andamento", r["tarefas_em_andamento"],    "#3498db"),
        ("Pendentes",    r["tarefas_pendentes"],       "#e74c3c"),
        ("Atrasadas",    r["tarefas_atrasadas"],       "#e67e22"),
        ("Taxa Conclusão", f"{r['taxa_conclusao']:.0f}%", "#9b59b6"),
    ]

    # 6 cards em linha dupla usando subgridspec
    gs_kpi = gridspec.GridSpecFromSubplotSpec(1, 6, subplot_spec=gs[0, :], wspace=0.25)
    for i, (label, valor, cor) in enumerate(kpis):
        ax = fig.add_subplot(gs_kpi[0, i])
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis("off")
        fundo = mpatches.FancyBboxPatch(
            (0.05, 0.05), 0.9, 0.9,
            boxstyle="round,pad=0.05",
            linewidth=2, edgecolor=cor, facecolor=cor + "22"
        )
        ax.add_patch(fundo)
        ax.text(0.5, 0.60, str(valor), ha="center", va="center",
                fontsize=22, fontweight="bold", color=cor)
        ax.text(0.5, 0.22, label, ha="center", va="center",
                fontsize=9, color="#555")

    # ── Linha 1 col 0-1: Pizza de Status ──────────────────────────────────
    ax_pizza = fig.add_subplot(gs[1, 0:2])
    contagem = atividades["status"].value_counts()
    cores    = [CORES.get(s, "#95a5a6") for s in contagem.index]
    wedges, texts, autotexts = ax_pizza.pie(
        contagem.values, labels=contagem.index, colors=cores,
        autopct="%1.0f%%", startangle=90,
        wedgeprops={"linewidth": 2, "edgecolor": "white"},
        textprops={"fontsize": 10},
    )
    for at in autotexts:
        at.set_fontsize(11); at.set_fontweight("bold"); at.set_color("white")
    ax_pizza.set_title("Tarefas por Status")

    # ── Linha 1 col 2: Gauge de conclusão ─────────────────────────────────
    ax_gauge = fig.add_subplot(gs[1, 2])
    _desenhar_gauge(ax_gauge, r["taxa_conclusao"], "Taxa de Conclusão")

    # ── Linha 2 col 0-1: Barras empilhadas por responsável ────────────────
    ax_resp = fig.add_subplot(gs[2, 0:2])
    pivot   = (
        atividades.groupby(["responsavel_nome", "status"])
        .size().unstack(fill_value=0)
    )
    for col in ["Concluído", "Em Progresso", "Pendente"]:
        if col not in pivot.columns:
            pivot[col] = 0
    pivot = pivot[["Concluído", "Em Progresso", "Pendente"]]
    pivot.plot(kind="bar", stacked=True, ax=ax_resp,
               color=[CORES[c] for c in pivot.columns],
               width=0.55, edgecolor="white", linewidth=1.2, legend=True)
    ax_resp.set_title("Tarefas por Responsável e Status")
    ax_resp.set_xlabel("Responsável")
    ax_resp.set_ylabel("Tarefas")
    ax_resp.set_xticklabels(pivot.index, rotation=15, ha="right", fontsize=9)
    ax_resp.yaxis.set_major_locator(plt.MaxNLocator(integer=True))
    ax_resp.get_legend().set_visible(False)
    for i, total in enumerate(pivot.sum(axis=1)):
        ax_resp.text(i, total + 0.05, str(int(total)),
                     ha="center", fontweight="bold", fontsize=10)

    # ── Linha 2 col 2: Prioridade ──────────────────────────────────────────
    ax_prio = fig.add_subplot(gs[2, 2])
    ordem     = ["Alta", "Média"]
    cnt_prio  = atividades["prioridade"].value_counts().reindex(ordem).dropna()
    bar_cores = [CORES.get(p, "#95a5a6") for p in cnt_prio.index]
    bars = ax_prio.bar(cnt_prio.index, cnt_prio.values,
                       color=bar_cores, edgecolor="white", linewidth=1.5, width=0.5)
    ax_prio.set_title("Tarefas por Prioridade")
    ax_prio.set_ylabel("Tarefas")
    ax_prio.yaxis.set_major_locator(plt.MaxNLocator(integer=True))
    for bar in bars:
        ax_prio.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.05,
                     str(int(bar.get_height())),
                     ha="center", fontweight="bold", fontsize=11)

    # ── Título geral ──────────────────────────────────────────────────────
    fig.suptitle("TaskInsight — Dashboard de Produtividade",
                 fontsize=17, fontweight="bold", y=0.96, color="#2c3e50")
    fig.text(0.97, 0.01, f"Gerado em {datetime.now().strftime('%d/%m/%Y %H:%M')}",
             ha="right", fontsize=8, color="#999")

    return _salvar(fig, "00_dashboard_apresentacao.png")


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    print("\n🎨  TaskInsight — Gerando visualizações…\n")
    atividades, responsaveis, status_historico, metricas = carregar_dados()

    print("📊  Gráficos individuais:")
    grafico_tarefas_por_status(atividades)
    grafico_produtividade_geral(metricas)
    grafico_tarefas_por_responsavel(atividades)
    grafico_prioridade(atividades)
    grafico_timeline(atividades)
    grafico_historico_status(status_historico)

    print("\n🖥️   Dashboard de apresentação:")
    dashboard_apresentacao(atividades, metricas)

    print(f"\n✅  Todos os gráficos salvos em: {CHARTS_DIR}\n")


if __name__ == "__main__":
    main()
