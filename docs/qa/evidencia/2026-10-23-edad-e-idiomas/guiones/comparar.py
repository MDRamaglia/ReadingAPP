"""Compara los textos de dos recorridos (versión anterior y nueva)."""
import difflib
import json
import sys

a_path, b_path = sys.argv[1], sys.argv[2]
a = json.load(open(a_path))
b = json.load(open(b_path))


def lines(d):
    out = [l.strip() for l in d['text'].split('\n') if l.strip()]
    out += sorted(d['attrs'])
    out.append(f"html lang={d['lang']}")
    out.append(f"title={d['title']}")
    return out


total = 0
for name in list(dict.fromkeys(list(a) + list(b))):
    if name not in a:
        print(f'\n=== {name}: solo en la versión nueva')
        for l in lines(b[name]):
            print(f'   + {l}')
        continue
    if name not in b:
        print(f'\n=== {name}: solo en la versión anterior')
        continue
    la, lb = lines(a[name]), lines(b[name])
    diff = [d for d in difflib.unified_diff(la, lb, lineterm='', n=0) if not d.startswith(('---', '+++', '@@'))]
    if diff:
        total += 1
        print(f'\n=== {name}')
        for d in diff:
            print(f'   {d}')
print(f'\nPantallas con diferencias: {total} de {len(set(a) | set(b))}')
