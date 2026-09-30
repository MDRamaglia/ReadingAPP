import { LIMITS, clamp, updateSettings } from '../lib/settings';
import type { Settings, Theme } from '../lib/types';
import { Sheet } from '../ui/Sheet';
import { IconArrowsH, IconArrowsV, IconMinus, IconPlus, IconSpark } from '../ui/icons';
import type { CurlSpeed } from '../lib/types';

const THEMES: Array<{ id: Theme; label: string }> = [
  { id: 'light', label: 'Claro' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'dark', label: 'Oscuro' },
];

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Letras por renglón aproximadas (una letra promedio mide cerca de medio em).
 * Si la pantalla es más angosta que el ancho elegido, manda la pantalla.
 */
function widthLabel(s: Settings): string {
  const available = Math.max(200, window.innerWidth - 44);
  const px = Math.min(s.width * s.fontSize, available);
  const chars = Math.round(px / (s.fontSize * 0.5));
  return `≈ ${chars} letras por renglón${s.width * s.fontSize > available ? ' (máximo de esta pantalla)' : ''}`;
}

export function SettingsSheet({ settings: s, onClose, pdfBook, curlAllowed }: { settings: Settings; onClose: () => void; pdfBook: boolean; curlAllowed: boolean }) {
  const size = (d: number) => updateSettings({ fontSize: clamp(s.fontSize + d, LIMITS.fontSize.min, LIMITS.fontSize.max) });
  return (
    <Sheet title="Lectura" onClose={onClose} testId="settings-sheet">
      {pdfBook && <p class="hint">En el modo libro los PDF se muestran con su diseño original; la tipografía se aplica al modo renglón.</p>}

      <div class="field">
        <span class="field-label">Tamaño de letra</span>
        <div class="stepper">
          <button class="icon-btn" onClick={() => size(-1)} aria-label="Achicar letra" disabled={s.fontSize <= LIMITS.fontSize.min}>
            <IconMinus />
          </button>
          <output class="stepper-value" aria-live="polite" data-testid="font-size">
            {s.fontSize}
          </output>
          <button class="icon-btn" onClick={() => size(1)} aria-label="Agrandar letra" disabled={s.fontSize >= LIMITS.fontSize.max}>
            <IconPlus />
          </button>
        </div>
      </div>

      <label class="field">
        <span class="field-label">
          Ancho de lectura <small>{widthLabel(s)}</small>
        </span>
        <input
          type="range"
          min={LIMITS.width.min}
          max={LIMITS.width.max}
          step={LIMITS.width.step}
          value={s.width}
          onInput={(e) => updateSettings({ width: Number((e.target as HTMLInputElement).value) })}
          aria-label="Ancho de lectura"
        />
      </label>

      <label class="field">
        <span class="field-label">
          Interlineado <small>{s.lineHeight.toFixed(1)}</small>
        </span>
        <input
          type="range"
          min={LIMITS.lineHeight.min}
          max={LIMITS.lineHeight.max}
          step={LIMITS.lineHeight.step}
          value={s.lineHeight}
          onInput={(e) => updateSettings({ lineHeight: round1(Number((e.target as HTMLInputElement).value)) })}
          aria-label="Interlineado"
        />
      </label>

      <div class="field">
        <span class="field-label">Tema</span>
        <div class="swatches" role="radiogroup" aria-label="Tema">
          {THEMES.map((t) => (
            <button
              key={t.id}
              class={`swatch swatch-${t.id}${s.theme === t.id ? ' is-on' : ''}`}
              role="radio"
              aria-checked={s.theme === t.id}
              onClick={() => updateSettings({ theme: t.id })}
            >
              <span class="swatch-chip">Aa</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div class="field">
        <span class="field-label">Tipografía</span>
        <div class="segmented" role="radiogroup" aria-label="Tipografía">
          <button role="radio" aria-checked={s.font === 'literata'} class={s.font === 'literata' ? 'is-on' : ''} onClick={() => updateSettings({ font: 'literata' })}>
            <span style={{ fontFamily: 'var(--font-literata)' }}>Literata</span>
          </button>
          <button role="radio" aria-checked={s.font === 'atkinson'} class={s.font === 'atkinson' ? 'is-on' : ''} onClick={() => updateSettings({ font: 'atkinson' })}>
            <span style={{ fontFamily: 'var(--font-atkinson)' }}>Atkinson</span>
          </button>
        </div>
      </div>

      <BookNav s={s} curlAllowed={curlAllowed} />

      <div class="field">
        <span class="field-label">Modo renglón: texto alrededor</span>
        <div class="segmented" role="radiogroup" aria-label="Texto alrededor del renglón">
          <button role="radio" aria-checked={s.focusContext === 'dim'} class={s.focusContext === 'dim' ? 'is-on' : ''} onClick={() => updateSettings({ focusContext: 'dim' })}>
            Atenuado
          </button>
          <button role="radio" aria-checked={s.focusContext === 'hide'} class={s.focusContext === 'hide' ? 'is-on' : ''} onClick={() => updateSettings({ focusContext: 'hide' })}>
            Oculto
          </button>
        </div>
      </div>
    </Sheet>
  );
}

const SPEEDS: Array<[CurlSpeed, string]> = [
  ['slow', 'Lenta'],
  ['normal', 'Normal'],
  ['fast', 'Rápida'],
];

/**
 * Modo libro: dirección para pasar páginas y animación de hoja. La animación
 * es del plan premium y solo existe en horizontal; en vertical (o sin
 * premium) el interruptor queda deshabilitado pero la preferencia se conserva.
 */
function BookNav({ s, curlAllowed }: { s: Settings; curlAllowed: boolean }) {
  const horizontal = s.bookDirection === 'horizontal';
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const usable = horizontal && curlAllowed;
  let note = 'La hoja se dobla y descubre la página siguiente, como en un libro de papel.';
  if (!horizontal) note = 'Disponible solo al pasar páginas en horizontal.';
  else if (reduced) note = 'Tu dispositivo pide reducir el movimiento: por eso no se muestra.';
  return (
    <div class="field">
      <span class="field-label" id="book-nav-label">
        Modo libro: pasar página
      </span>
      <div class="segmented" role="radiogroup" aria-labelledby="book-nav-label">
        <button
          role="radio"
          aria-checked={horizontal}
          class={horizontal ? 'is-on' : ''}
          onClick={() => updateSettings({ bookDirection: 'horizontal' })}
          data-testid="dir-horizontal"
        >
          <IconArrowsH size={18} /> Horizontal
        </button>
        <button
          role="radio"
          aria-checked={!horizontal}
          class={horizontal ? '' : 'is-on'}
          onClick={() => updateSettings({ bookDirection: 'vertical' })}
          data-testid="dir-vertical"
        >
          <IconArrowsV size={18} /> Vertical
        </button>
      </div>
      <p class="field-note">
        {horizontal ? 'Hacia la izquierda o la derecha: tocá los costados o deslizá de lado.' : 'Hacia arriba o abajo: tocá arriba o abajo, o deslizá en vertical.'}
      </p>
      <label class={`switch-row${usable ? '' : ' is-disabled'}`}>
        <span class="switch-text">
          <span class="switch-title">
            Animación de página {!curlAllowed && <span class="plan-pill">Premium</span>}
          </span>
          {curlAllowed ? (
            <small>{note}</small>
          ) : (
            <small data-testid="curl-premium-note">
              <IconSpark size={13} /> La hoja que se dobla al pasar página es parte del plan premium.{' '}
              <a href="#/planes" data-testid="curl-see-plans">
                Ver planes
              </a>
            </small>
          )}
        </span>
        <input
          type="checkbox"
          role="switch"
          class="switch"
          checked={curlAllowed && s.pageCurl}
          aria-checked={curlAllowed && s.pageCurl}
          disabled={!usable}
          onChange={(e) => updateSettings({ pageCurl: (e.currentTarget as HTMLInputElement).checked })}
          data-testid="page-curl"
        />
      </label>
      {usable && s.pageCurl && (
        <div class="speed">
          <span class="field-note" id="curl-speed-label">
            Velocidad de la animación
          </span>
          <div class="segmented" role="radiogroup" aria-labelledby="curl-speed-label">
            {SPEEDS.map(([id, label]) => (
              <button
                key={id}
                role="radio"
                aria-checked={s.curlSpeed === id}
                class={s.curlSpeed === id ? 'is-on' : ''}
                onClick={() => updateSettings({ curlSpeed: id })}
                data-testid={`curl-speed-${id}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
