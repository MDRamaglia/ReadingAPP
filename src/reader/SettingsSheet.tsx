import { LIMITS, clamp, updateSettings } from '../lib/settings';
import type { Settings, Theme } from '../lib/types';
import { Sheet } from '../ui/Sheet';
import { IconMinus, IconPlus } from '../ui/icons';

const THEMES: Array<{ id: Theme; label: string }> = [
  { id: 'light', label: 'Claro' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'dark', label: 'Oscuro' },
];

const round1 = (n: number) => Math.round(n * 10) / 10;

export function SettingsSheet({ settings: s, onClose, pdfBook }: { settings: Settings; onClose: () => void; pdfBook: boolean }) {
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
          Ancho de lectura <small>{s.width} em</small>
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
