/**
 * Convierte bloques en HTML para los dos modos de lectura. El mismo marcado
 * se usa en el libro de Word y en el modo renglón, de modo que los
 * desplazamientos de caracteres son idénticos en ambos.
 */
import type { Block } from '../lib/types';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function blockHtml(b: Block, i: number): string {
  const cls = `b b-${b.t}${b.brk ? ' brk' : ''}${b.unsure ? ' b-unsure' : ''}`;
  const attrs = `class="${cls}" data-b="${i}"`;
  switch (b.t) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return `<${b.t} ${attrs}>${b.html}</${b.t}>`;
    case 'li':
      return `<p ${attrs} data-mk="${esc(b.mk ?? '•')}" style="--lvl:${b.lvl ?? 0}">${b.html}</p>`;
    case 'quote':
      return `<blockquote ${attrs}>${b.html}</blockquote>`;
    case 'pre':
      return `<pre ${attrs}>${b.html}</pre>`;
    case 'img': {
      const size = b.w && b.h ? ` width="${b.w}" height="${b.h}"` : '';
      return `<figure ${attrs}><img data-asset="${esc(b.img ?? '')}" alt="${esc(b.alt ?? '')}"${size} decoding="async"></figure>`;
    }
    case 'table':
      return `<div ${attrs}>${b.html}</div>`;
    case 'hr':
      return `<hr ${attrs}>`;
    case 'notice':
      return `<p ${attrs} role="note">${b.html}</p>`;
    default:
      return `<p ${attrs}>${b.html}</p>`;
  }
}

export function blocksHtml(blocks: Block[]): string {
  let out = '';
  for (let i = 0; i < blocks.length; i++) out += blockHtml(blocks[i]!, i);
  return out;
}

/** Asigna las URL locales de las imágenes después de insertar el HTML. */
export function hydrateImages(root: Element, urls: Map<string, string>): void {
  root.querySelectorAll<HTMLImageElement>('img[data-asset]').forEach((img) => {
    const url = urls.get(img.dataset.asset ?? '');
    if (url) img.src = url;
    else img.replaceWith(Object.assign(document.createElement('span'), { className: 'img-missing', textContent: '[imagen]' }));
  });
}

export function blockElements(root: Element): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(':scope > [data-b]'));
}
