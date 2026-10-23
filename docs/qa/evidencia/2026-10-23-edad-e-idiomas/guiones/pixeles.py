import glob, os, sys
from PIL import Image, ImageChops
dev = sys.argv[1]
a_dir, b_dir = f'evidencia/textos/anterior-{dev}', f'evidencia/textos/nueva-{dev}'
names_b = {f.split('-', 1)[1]: f for f in os.listdir(b_dir) if f.endswith('.png')}
os.makedirs(f'evidencia/diff-{dev}', exist_ok=True)
for fa in sorted(os.listdir(a_dir)):
    if not fa.endswith('.png'): continue
    key = fa.split('-', 1)[1]
    if key not in names_b: print(f'{key}: sin par'); continue
    A = Image.open(f'{a_dir}/{fa}').convert('RGB'); B = Image.open(f'{b_dir}/{names_b[key]}').convert('RGB')
    if A.size != B.size:
        print(f'{key}: tamaño distinto {A.size} → {B.size}'); continue
    d = ImageChops.difference(A, B)
    bbox = d.getbbox()
    if not bbox: print(f'{key}: idéntica'); continue
    g = d.convert('L').point(lambda v: 255 if v > 24 else 0)
    n = sum(1 for v in g.getdata() if v)
    pct = 100 * n / (A.size[0] * A.size[1])
    print(f'{key}: difiere {pct:.2f} % en {bbox}')
    if pct > 0.01:
        side = Image.new('RGB', (A.size[0] * 2 + 10, A.size[1]), 'red')
        side.paste(A, (0, 0)); side.paste(B, (A.size[0] + 10, 0))
        side.save(f'evidencia/diff-{dev}/{key}')
