#!/usr/bin/env python3
"""Conecta ao MongoDB, limpa os dados e gera um relatório de produtividade em PDF.

Uso: python3 report_generator.py [output_path]
"""

import sys
import os
from pathlib import Path
from datetime import datetime

from dotenv import load_dotenv
from pymongo import MongoClient
from fpdf import FPDF

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/taskinsight")
OUTPUT_DIR = Path(__file__).parent / "outputs"


# ── MongoDB ───────────────────────────────────────────────────────────────────

def connect_mongodb():
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
    client.admin.command("ping")
    db = client.get_database()
    return client, db


# ── Limpeza de dados ──────────────────────────────────────────────────────────

def load_and_clean(db):
    raw = list(db.tasks.find({}))
    total_raw = len(raw)

    # Remove entradas com campos obrigatórios nulos
    valid = [t for t in raw if t.get("titulo") and t.get("status")]
    removed_nulls = total_raw - len(valid)

    # Remove duplicatas pelo _id
    seen, deduped = set(), []
    for t in valid:
        tid = str(t["_id"])
        if tid not in seen:
            seen.add(tid)
            deduped.append(t)
    removed_dupes = len(valid) - len(deduped)

    quality = {
        "total_raw": total_raw,
        "removed_nulls": removed_nulls,
        "removed_dupes": removed_dupes,
        "total_clean": len(deduped),
    }
    return deduped, quality


# ── Métricas de produtividade ─────────────────────────────────────────────────

def calc_metrics(tasks):
    total = len(tasks)
    concluidas = 0
    andamento = 0
    lead_days = []

    for t in tasks:
        status = (t.get("status") or "").lower()

        if "conclui" in status:
            concluidas += 1
            start = t.get("data_criacao") or t.get("createdAt")
            end = t.get("data_conclusao") or t.get("updatedAt")
            if start and end:
                try:
                    if isinstance(start, str):
                        start = datetime.fromisoformat(start.replace("Z", "+00:00"))
                    if isinstance(end, str):
                        end = datetime.fromisoformat(end.replace("Z", "+00:00"))
                    # Normaliza timezone para evitar erro de comparação
                    if getattr(start, "tzinfo", None) is not None:
                        start = start.replace(tzinfo=None)
                    if getattr(end, "tzinfo", None) is not None:
                        end = end.replace(tzinfo=None)
                    diff = (end - start).days
                    if diff >= 0:
                        lead_days.append(diff)
                except Exception:
                    pass

        elif "andamento" in status or "progresso" in status:
            andamento += 1

    avg_lead = round(sum(lead_days) / len(lead_days), 1) if lead_days else 0

    return {
        "total": total,
        "concluidas": concluidas,
        "andamento": andamento,
        "pendentes": max(0, total - concluidas - andamento),
        "avg_lead_time": avg_lead,
    }


# ── Geração do PDF ────────────────────────────────────────────────────────────

class RelatorioPDF(FPDF):
    PRIMARY = (15, 52, 96)
    TEXT = (26, 42, 74)
    MUTED = (107, 114, 128)
    GREEN = (22, 163, 74)

    def header(self):
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(*self.PRIMARY)
        self.cell(0, 12, "Relatório de Produtividade", ln=True, align="C")

        self.set_font("Helvetica", "", 9)
        self.set_text_color(*self.MUTED)
        now = datetime.now().strftime("%d/%m/%Y às %H:%M")
        self.cell(0, 6, f"Gerado em {now}  ·  TaskInsight", ln=True, align="C")
        self.ln(4)

        self.set_draw_color(*self.PRIMARY)
        self.set_line_width(0.4)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(8)

    def section_title(self, title):
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(*self.PRIMARY)
        self.cell(0, 8, title, ln=True)
        self.ln(2)

    def metric_row(self, label, value, highlight=False):
        self.set_font("Helvetica", "", 11)
        self.set_text_color(*self.TEXT)
        self.cell(130, 9, label)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*(self.GREEN if highlight else self.PRIMARY))
        self.cell(0, 9, str(value), ln=True)

    def divider(self):
        self.ln(4)
        self.set_draw_color(220, 228, 240)
        self.set_line_width(0.2)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(8)


def generate_pdf(metrics, quality, output_path):
    pdf = RelatorioPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=20)

    # Seção 1: Qualidade dos dados
    pdf.section_title("1. Qualidade dos Dados")
    pdf.metric_row("Registros brutos encontrados no MongoDB", quality["total_raw"])
    pdf.metric_row("Registros com campos nulos removidos", quality["removed_nulls"])
    pdf.metric_row("Duplicatas removidas", quality["removed_dupes"])
    pdf.metric_row("Registros válidos após limpeza", quality["total_clean"], highlight=True)
    pdf.divider()

    # Seção 2: Métricas de produtividade
    pdf.section_title("2. Métricas de Produtividade")
    pdf.metric_row("Total de Atividades", metrics["total"])
    pdf.metric_row("Atividades Concluídas", metrics["concluidas"])
    pdf.metric_row("Atividades Em Andamento", metrics["andamento"])
    pdf.metric_row("Atividades Pendentes", metrics["pendentes"])
    pdf.divider()

    # Seção 3: Indicadores
    pdf.section_title("3. Indicadores")
    if metrics["total"] > 0:
        taxa = round((metrics["concluidas"] / metrics["total"]) * 100, 1)
        pdf.metric_row("Taxa de Conclusão", f"{taxa}%", highlight=True)
    pdf.metric_row("Lead Time Médio", f"{metrics['avg_lead_time']} dias")

    # Nota de rodapé
    pdf.ln(12)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(*pdf.MUTED)
    pdf.multi_cell(
        0, 5,
        "Lead time calculado entre a data de criação e a data de conclusão/última "
        "atualização das tarefas concluídas. Campos ausentes são ignorados no cálculo.",
    )

    pdf.output(output_path)


# ── Ponto de entrada ──────────────────────────────────────────────────────────

def main():
    OUTPUT_DIR.mkdir(exist_ok=True)
    default_out = str(OUTPUT_DIR / "relatorio_produtividade.pdf")
    output_path = sys.argv[1] if len(sys.argv) > 1 else default_out

    print("Conectando ao MongoDB...", file=sys.stderr)
    try:
        client, db = connect_mongodb()
    except Exception as exc:
        print(f"ERRO: Falha na conexão com o MongoDB — {exc}", file=sys.stderr)
        sys.exit(1)

    try:
        tasks, quality = load_and_clean(db)
        metrics = calc_metrics(tasks)
        generate_pdf(metrics, quality, output_path)
        print(output_path)  # lido pelo Node.js via stdout
        print(f"Relatório salvo em: {output_path}", file=sys.stderr)
    except Exception as exc:
        print(f"ERRO ao gerar relatório: {exc}", file=sys.stderr)
        sys.exit(1)
    finally:
        client.close()


if __name__ == "__main__":
    main()
