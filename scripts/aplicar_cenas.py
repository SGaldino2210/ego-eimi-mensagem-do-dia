"""Aplica os lotes de "A Cena do Dia" (data/cenas/lote-*.json) na base de mensagens.

Cada lote traz, por id de mensagem, os campos cena, sentido e hoje.
Rodar de novo é seguro: os campos são sobrescritos com o conteúdo dos lotes.

Uso: python3 scripts/aplicar_cenas.py
"""
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
BASE = RAIZ / "data" / "ego_eimi_mensagens.json"
CAMPOS = ("cena", "sentido", "hoje")

dados = json.loads(BASE.read_text(encoding="utf-8"))
por_id = {m["id"]: m for m in dados["mensagens"]}

total = 0
for lote in sorted((RAIZ / "data" / "cenas").glob("lote-*.json")):
    cenas = json.loads(lote.read_text(encoding="utf-8"))["cenas"]
    for id_str, campos in cenas.items():
        faltando = [c for c in CAMPOS if not campos.get(c)]
        if faltando:
            raise SystemExit(f"{lote.name}: mensagem {id_str} sem {faltando}")
        por_id[int(id_str)].update({c: campos[c] for c in CAMPOS})
        total += 1
    print(f"{lote.name}: {len(cenas)} cenas")

BASE.write_text(json.dumps(dados, ensure_ascii=False, indent=2), encoding="utf-8")
com_cena = sum(1 for m in dados["mensagens"] if m.get("cena"))
print(f"Aplicadas {total} cenas. Mensagens com cena: {com_cena} de {len(dados['mensagens'])}.")
