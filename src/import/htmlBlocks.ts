/**
 * Convierte el HTML que produce la conversión de Word en la lista plana de
 * bloques de la app, con una lista blanca estricta de etiquetas y atributos.
 */
import type { Block, BlockType } from '../lib/types';
import { escapeHtml, normalizeSpaces } from '../lib/text';

const INLINE_MAP: Record<string, string> = {
  STRONG: 'strong',
  B: 'strong',
  EM: 'em',
  I: 'em',
  U: 'u',
  S: 's',
  DEL: 's',
  SUB: 'sub',
  SUP: 'sup',
  CODE: 'code',
  SMALL: 'small',
  MARK: 'mark',
  SPAN: 'span',
};

const measureEl = () => document.createElement('div');

/** Longitud de texto visible de un fragmento HTML, igual a la del DOM renderizado. */
export function textLength(html: string): number {
  const d = measureEl();
  d.innerHTML = html;
  return d.textContent?.length ?? 0;
}

export function htmlToText(html: string): string {
  const d = measureEl();
  d.innerHTML = html;
  return d.textContent ?? '';
}

function safeHref(href: string | null): string | null {
  if (!href) return null;
  const h = href.trim();
  if (/^(https?:|mailto:)/i.test(h)) return h;
  return null;
}

/** Saneado de contenido en línea: solo formato básico, enlaces seguros e imágenes locales. */
export function sanitizeInline(node: Node): string {
  let out = '';
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      out += escapeHtml(normalizeSpaces(child.textContent ?? ''));
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const el = child as Element;
    const tag = el.tagName;
    if (tag === 'BR') {
      out += '<br>';
      return;
    }
    if (tag === 'IMG') {
      const src = el.getAttribute('src') ?? '';
      if (src.startsWith('asset:')) {
        out += `<img class="inline" data-asset="${escapeHtml(src.slice(6))}" alt="${escapeHtml(el.getAttribute('alt') ?? '')}">`;
      }
      return;
    }
    if (tag === 'A') {
      const href = safeHref(el.getAttribute('href'));
      const inner = sanitizeInline(el);
      out += href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${inner}</a>` : inner;
      return;
    }
    const mapped = INLINE_MAP[tag];
    const inner = sanitizeInline(el);
    if (mapped && mapped !== 'span') out += inner ? `<${mapped}>${inner}</${mapped}>` : '';
    else out += inner;
  });
  return out;
}

/** Quita espacios al principio y al final de un fragmento en línea ya saneado. */
function trimInline(html: string): string {
  return html.replace(/^(\s|<br>)+/, '').replace(/(\s|<br>)+$/, '');
}

function sanitizeTable(table: Element): string {
  let out = '';
  table.querySelectorAll('tr').forEach((tr) => {
    let row = '';
    tr.querySelectorAll(':scope > td, :scope > th').forEach((cell) => {
      const tag = cell.tagName === 'TH' ? 'th' : 'td';
      const span = Number(cell.getAttribute('colspan') ?? '1');
      const colspan = span > 1 && span < 50 ? ` colspan="${span}"` : '';
      // Los párrafos dentro de una celda se separan con salto de línea.
      const parts: string[] = [];
      cell.childNodes.forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE && /^(P|H[1-6]|LI|DIV)$/.test((n as Element).tagName)) {
          const s = trimInline(sanitizeInline(n));
          if (s) parts.push(s);
        } else if (n.nodeType === Node.ELEMENT_NODE && /^(UL|OL)$/.test((n as Element).tagName)) {
          (n as Element).querySelectorAll('li').forEach((li) => {
            const s = trimInline(sanitizeInline(li));
            if (s) parts.push('• ' + s);
          });
        } else {
          const wrap = document.createElement('span');
          wrap.appendChild(n.cloneNode(true));
          const s = trimInline(sanitizeInline(wrap));
          if (s) parts.push(s);
        }
      });
      row += `<${tag}${colspan}>${parts.join('<br>')}</${tag}>`;
    });
    if (row) out += `<tr>${row}</tr>`;
  });
  return out ? `<table><tbody>${out}</tbody></table>` : '';
}

const BULLETS = ['•', '◦', '▪'];

export interface HtmlBlocksResult {
  blocks: Block[];
}

/**
 * Recorre el HTML y produce bloques. Los saltos de página de Word llegan como
 * `<hr class="pb">` y marcan el bloque siguiente para empezar página nueva.
 */
export function htmlToBlocks(html: string): Block[] {
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const blocks: Block[] = [];
  let pendingBreak = false;

  const push = (t: BlockType, inner: string, extra: Partial<Block> = {}) => {
    const clean = t === 'table' ? inner : trimInline(inner);
    if (!clean && t !== 'hr' && t !== 'img') return;
    const b: Block = { t, html: clean, len: t === 'img' || t === 'hr' ? 0 : textLength(clean), ...extra };
    if (b.len === 0 && t !== 'img' && t !== 'hr' && !/<img/.test(clean)) return;
    if (pendingBreak) {
      b.brk = true;
      pendingBreak = false;
    }
    blocks.push(b);
  };

  /** Un párrafo con imágenes se parte en texto e imágenes, respetando el orden. */
  const pushParagraph = (el: Element, t: BlockType, extra: Partial<Block> = {}) => {
    const imgs = el.querySelectorAll('img');
    if (!imgs.length) {
      push(t, sanitizeInline(el), extra);
      return;
    }
    let buffer = document.createElement('span');
    const flush = () => {
      push(t, sanitizeInline(buffer), extra);
      buffer = document.createElement('span');
    };
    const walk = (parent: Node) => {
      parent.childNodes.forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName === 'IMG') {
          flush();
          const src = (n as Element).getAttribute('src') ?? '';
          if (src.startsWith('asset:')) push('img', '', { img: src.slice(6), alt: (n as Element).getAttribute('alt') ?? '' });
          return;
        }
        if (n.nodeType === Node.ELEMENT_NODE && (n as Element).querySelector('img')) {
          walk(n);
          return;
        }
        buffer.appendChild(n.cloneNode(true));
      });
    };
    walk(el);
    flush();
  };

  const walkList = (list: Element, lvl: number) => {
    const ordered = list.tagName === 'OL';
    let n = Number(list.getAttribute('start') ?? '1') || 1;
    list.querySelectorAll(':scope > li').forEach((li) => {
      const own = document.createElement('span');
      const nested: Element[] = [];
      li.childNodes.forEach((c) => {
        if (c.nodeType === Node.ELEMENT_NODE && /^(UL|OL)$/.test((c as Element).tagName)) nested.push(c as Element);
        else own.appendChild(c.cloneNode(true));
      });
      const mk = ordered ? `${n}.` : BULLETS[Math.min(lvl, BULLETS.length - 1)]!;
      n++;
      pushParagraph(own, 'li', { mk, lvl });
      nested.forEach((sub) => walkList(sub, lvl + 1));
    });
  };

  const walk = (parent: ParentNode) => {
    parent.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const s = normalizeSpaces(node.textContent ?? '').trim();
        if (s) push('p', escapeHtml(s));
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const el = node as Element;
      const tag = el.tagName;
      if (/^H[1-6]$/.test(tag)) {
        pushParagraph(el, tag.toLowerCase() as BlockType);
      } else if (tag === 'P') {
        pushParagraph(el, 'p');
      } else if (tag === 'UL' || tag === 'OL') {
        walkList(el, 0);
      } else if (tag === 'TABLE') {
        const t = sanitizeTable(el);
        if (t) push('table', t);
      } else if (tag === 'BLOCKQUOTE') {
        el.querySelectorAll(':scope > p').length
          ? el.querySelectorAll(':scope > p').forEach((p) => pushParagraph(p, 'quote'))
          : pushParagraph(el, 'quote');
      } else if (tag === 'PRE') {
        push('pre', escapeHtml(el.textContent ?? ''));
      } else if (tag === 'HR') {
        if (el.classList.contains('pb')) pendingBreak = blocks.length > 0;
        else push('hr', '');
      } else if (tag === 'IMG') {
        const src = el.getAttribute('src') ?? '';
        if (src.startsWith('asset:')) push('img', '', { img: src.slice(6), alt: el.getAttribute('alt') ?? '' });
      } else if (tag === 'SCRIPT' || tag === 'STYLE') {
        // nunca
      } else if (INLINE_MAP[tag] || tag === 'A') {
        pushParagraph(el, 'p');
      } else {
        walk(el);
      }
    });
  };

  walk(tpl.content);
  return blocks;
}

/**
 * Los títulos de nivel 1 abren página nueva en el modo libro, como capítulos,
 * solo si las secciones son largas (en un contrato con cláusulas cortas
 * titulado con «Título 1» no tendría sentido dejar páginas casi vacías).
 */
export function markChapterBreaks(blocks: Block[]): void {
  const h1 = blocks.map((b, i) => (b.t === 'h1' ? i : -1)).filter((i) => i > 0);
  if (!h1.length) return;
  const total = blocks.reduce((s, b) => s + b.len, 0);
  const avgSection = total / (h1.length + 1);
  if (avgSection < 1000) return;
  for (const i of h1) {
    // Un título inmediatamente después de otro no fuerza página nueva.
    const prev = blocks[i - 1]!;
    if (!/^h[1-3]$/.test(prev.t)) blocks[i]!.brk = true;
  }
}
