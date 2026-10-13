#!/usr/bin/env python3
"""Comprobaciones estáticas mínimas para ATT&CK LAB (sin dependencias Python externas)."""
from pathlib import Path
from html.parser import HTMLParser
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent

class LocalAssets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == "script" and data.get("src"):
            self.refs.append(data["src"])
        if tag == "link" and data.get("href"):
            self.refs.append(data["href"])

def main():
    errors = []
    html = ROOT / "index.html"
    if not html.is_file():
        errors.append("No existe index.html")
    else:
        parser = LocalAssets()
        parser.feed(html.read_text(encoding="utf-8"))
        for ref in parser.refs:
            if ref.startswith(("http:", "https:", "//", "data:")):
                continue
            path = ref.split("?", 1)[0].split("#", 1)[0]
            if not (ROOT / path).is_file():
                errors.append(f"Referencia rota en index.html: {ref}")
        print(f"Recursos locales HTML comprobados: {len(parser.refs)}")
    js_files = sorted(ROOT.rglob("*.js"))
    if not js_files:
        errors.append("No se encontraron archivos JavaScript")
    for f in js_files:
        try:
            result = subprocess.run(["node", "--check", str(f)], capture_output=True, text=True)
        except FileNotFoundError:
            errors.append("Node.js no está instalado; no puede validarse la sintaxis JS")
            break
        if result.returncode:
            errors.append(f"Error JS en {f.name}: {result.stderr.strip()}")
    print(f"Archivos JavaScript inspeccionados (recursivo): {len(js_files)}")
    if errors:
        for issue in errors:
            print("ERROR:", issue, file=sys.stderr)
        return 1
    print("Validación estática completada correctamente.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
