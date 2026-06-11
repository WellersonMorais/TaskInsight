import os
import sys
import unittest

import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "dataAnalysis", "scripts"))

from data_analyzer import calculate_task_metrics


class TaskMetricsTests(unittest.TestCase):
    def test_calculate_task_metrics_returns_summary_and_patterns(self):
        tasks = pd.DataFrame(
            {
                "id": [1, 2, 3],
                "status": ["Concluído", "Pendente", "Em Progresso"],
                "prioridade": ["Alta", "Média", "Alta"],
                "responsavel_id": [1, 2, 1],
                "data_criacao": ["2026-01-01", "2026-01-02", "2026-01-03"],
                "data_vencimento": ["2026-01-10", "2026-01-05", "2026-01-20"],
            }
        )
        history = pd.DataFrame(
            {
                "atividade_id": [1, 1, 2],
                "status_novo": ["Em Progresso", "Concluído", "Pendente"],
                "data_mudanca": ["2026-01-04", "2026-01-05", "2026-01-03"],
            }
        )

        metrics = calculate_task_metrics(tasks, history)

        self.assertEqual(metrics["resumo"]["quantidade_tarefas"], 3)
        self.assertEqual(metrics["resumo"]["tarefas_concluidas"], 1)
        self.assertEqual(metrics["resumo"]["tarefas_pendentes"], 1)
        self.assertEqual(metrics["resumo"]["tarefas_em_andamento"], 1)
        self.assertEqual(metrics["padrões"]["status_distribution"]["Concluído"], 1)
        self.assertEqual(metrics["visualizacao"]["chart_data"]["series"][0]["data"][0], 1)


if __name__ == "__main__":
    unittest.main()
