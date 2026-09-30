import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { IconClose } from './icons';

interface Props {
  title: string;
  onClose?: () => void;
  children: ComponentChildren;
  /** Hoja ancha (índice, página original). */
  wide?: boolean;
  testId?: string;
}

/** Hoja inferior en el celular, diálogo centrado en pantallas grandes. */
export function Sheet({ title, onClose, children, wide, testId }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // Se lee la función vigente al apretar la tecla: si la hoja pasa de «cargando»
  // (sin cierre) a «listo», Escape funciona desde el primer instante.
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && close.current) {
        e.stopPropagation();
        close.current();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      prev?.focus?.();
    };
  }, []);

  return (
    <div class="sheet-backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div
        class={`sheet${wide ? ' sheet-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
        data-testid={testId}
      >
        <div class="sheet-grip" aria-hidden="true" />
        <header class="sheet-head">
          <h2>{title}</h2>
          {onClose && (
            <button class="icon-btn" onClick={onClose} aria-label="Cerrar">
              <IconClose />
            </button>
          )}
        </header>
        <div class="sheet-body">{children}</div>
      </div>
    </div>
  );
}
