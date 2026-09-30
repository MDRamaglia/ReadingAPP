/**
 * Logo de Knowmadic en línea: la marca (dos hojas, la de adelante con la
 * esquina levantada) y el logotipo. Los colores vienen de CSS (--mark-*,
 * --brand-word) para que se adapten al tema oscuro.
 */
import { MARK_BACK, MARK_CURL, MARK_FRONT, MARK_TRANSFORM, MARK_VIEWBOX, WORD_TRANSFORM, WORD_VIEWBOX, WORDMARK } from './brandPaths';

export function BrandMark({ size = 40, class: cls = '' }: { size?: number; class?: string }) {
  const [, , w, h] = MARK_VIEWBOX.split(' ').map(Number);
  return (
    <svg class={`brand-mark ${cls}`} viewBox={MARK_VIEWBOX} width={(size * w!) / h!} height={size} aria-hidden="true" focusable="false">
      <g transform={MARK_TRANSFORM}>
        <path class="mark-back" d={MARK_BACK} />
        <path class="mark-curl" d={MARK_CURL} />
        <path class="mark-front" d={MARK_FRONT} />
      </g>
    </svg>
  );
}

export function BrandWordmark({ height = 26 }: { height?: number }) {
  const [, , w, h] = WORD_VIEWBOX.split(' ').map(Number);
  return (
    <svg class="brand-word" viewBox={WORD_VIEWBOX} width={(height * w!) / h!} height={height} aria-hidden="true" focusable="false">
      <g transform={WORD_TRANSFORM}>
        <path d={WORDMARK} />
      </g>
    </svg>
  );
}
