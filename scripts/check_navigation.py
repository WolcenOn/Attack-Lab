#!/usr/bin/env python3
"""Regression check: main navigation selector must return a collection."""
from pathlib import Path
import re
root=Path(__file__).resolve().parent.parent
app=(root/"app.js").read_text(encoding="utf-8")
assert "const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];" in app
assert "$$('.nav-link').forEach(" in app, "Nav state needs the multi-element selector"
assert "$$('.nav-link').find(" in app, "Active item lookup needs the multi-element selector"
assert not re.search(r"(?<!\$)\$\('\.nav-link'\)\.(?:forEach|find)\(",app), "Single-node selector used as an array"
print("Navigation-selector regression check passed")
