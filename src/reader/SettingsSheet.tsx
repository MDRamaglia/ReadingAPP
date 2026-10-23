import { fmtNumber, t, type Key } from '../i18n';
import { LIMITS, clamp, updateSettings } from '../lib/settings';
import type { Settings, Theme } from '../lib/types';
import { Sheet } from '../ui/Sheet';
import { IconArrowsH, IconArrowsV, IconMinus, IconPlus, IconSpark } from '../ui/icons';
import type { CurlSpeed } from '../lib/types';

const THEMES: Array<{ id: Theme; label: Key }> = [
  { id: 'light', label: 'settings.theme.light' },
  { id: 'sepia', label: 'settings.theme.sepia' },
  { id: 'dark', label: 'settings.theme.dark' },
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
  return t(s.width * s.fontSize > available ? 'settings.widthCharsMax' : 'settings.widthChars', { count: chars });
}

export function SettingsSheet({ settings: s, onClose, pdfBook, curlAllowed }: { settings: Settings; onClose: () => void; pdfBook: boolean; curlAllowed: boolean }) {
  const size = (d: number) => updateSettings({ fontSize: clamp(s.fontSize + d, LIMITS.fontSize.min, LIMITS.fontSize.max) });
  return (
    <Sheet title={t('settings.title')} onClose={onClose} testId="settings-sheet">
      {pdfBook && <p class="hint">{t('settings.pdfHint')}</p>}

      <div class="field">
        <span class="field-label">{t('settings.fontSize')}</span>
        <div class="stepper">
          <button class="icon-btn" onClick={() => size(-1)} aria-label={t('settings.smaller')} disabled={s.fontSize <= LIMITS.fontSize.min}>
            <IconMinus />
          </button>
          <output class="stepper-value" aria-live="polite" data-testid="font-size">
            {s.fontSize}
          </output>
          <button class="icon-btn" onClick={() => size(1)} aria-label={t('settings.bigger')} disabled={s.fontSize >= LIMITS.fontSize.max}>
            <IconPlus />
          </button>
        </div>
      </div>

      <label class="field">
        <span class="field-label">
          {t('settings.width')} <small>{widthLabel(s)}</small>
        </span>
        <input
          type="range"
          min={LIMITS.width.min}
          max={LIMITS.width.max}
          step={LIMITS.width.step}
          value={s.width}
          onInput={(e) => updateSettings({ width: Number((e.target as HTMLInputElement).value) })}
          aria-label={t('settings.width')}
        />
      </label>

      <label class="field">
        <span class="field-label">
          {t('settings.lineHeight')} <small>{fmtNumber(s.lineHeight, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</small>
        </span>
        <input
          type="range"
          min={LIMITS.lineHeight.min}
          max={LIMITS.lineHeight.max}
          step={LIMITS.lineHeight.step}
          value={s.lineHeight}
          onInput={(e) => updateSettings({ lineHeight: round1(Number((e.target as HTMLInputElement).value)) })}
          aria-label={t('settings.lineHeight')}
        />
      </label>

      <div class="field">
        <span class="field-label">{t('settings.theme')}</span>
        <div class="swatches" role="radiogroup" aria-label={t('settings.theme')}>
          {THEMES.map((th) => (
            <button
              key={th.id}
              class={`swatch swatch-${th.id}${s.theme === th.id ? ' is-on' : ''}`}
              role="radio"
              aria-checked={s.theme === th.id}
              onClick={() => updateSettings({ theme: th.id })}
            >
              <span class="swatch-chip">Aa</span>
              {t(th.label)}
            </button>
          ))}
        </div>
      </div>

      <div class="field">
        <span class="field-label">{t('settings.font')}</span>
        <div class="segmented" role="radiogroup" aria-label={t('settings.font')}>
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
        <span class="field-label">{t('settings.context')}</span>
        <div class="segmented" role="radiogroup" aria-label={t('settings.contextLabel')}>
          <button role="radio" aria-checked={s.focusContext === 'dim'} class={s.focusContext === 'dim' ? 'is-on' : ''} onClick={() => updateSettings({ focusContext: 'dim' })}>
            {t('settings.context.dim')}
          </button>
          <button role="radio" aria-checked={s.focusContext === 'hide'} class={s.focusContext === 'hide' ? 'is-on' : ''} onClick={() => updateSettings({ focusContext: 'hide' })}>
            {t('settings.context.hide')}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

const SPEEDS: Array<[CurlSpeed, Key]> = [
  ['slow', 'settings.speed.slow'],
  ['normal', 'settings.speed.normal'],
  ['fast', 'settings.speed.fast'],
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
  let note = t('settings.curl.note');
  if (!horizontal) note = t('settings.curl.horizontalOnly');
  else if (reduced) note = t('settings.curl.reducedMotion');
  return (
    <div class="field">
      <span class="field-label" id="book-nav-label">
        {t('settings.bookNav')}
      </span>
      <div class="segmented" role="radiogroup" aria-labelledby="book-nav-label">
        <button
          role="radio"
          aria-checked={horizontal}
          class={horizontal ? 'is-on' : ''}
          onClick={() => updateSettings({ bookDirection: 'horizontal' })}
          data-testid="dir-horizontal"
        >
          <IconArrowsH size={18} /> {t('settings.dir.horizontal')}
        </button>
        <button
          role="radio"
          aria-checked={!horizontal}
          class={horizontal ? '' : 'is-on'}
          onClick={() => updateSettings({ bookDirection: 'vertical' })}
          data-testid="dir-vertical"
        >
          <IconArrowsV size={18} /> {t('settings.dir.vertical')}
        </button>
      </div>
      <p class="field-note">
        {horizontal ? t('settings.dir.horizontalNote') : t('settings.dir.verticalNote')}
      </p>
      <label class={`switch-row${usable ? '' : ' is-disabled'}`}>
        <span class="switch-text">
          <span class="switch-title">
            {t('settings.curl.title')} {!curlAllowed && <span class="plan-pill">{t('plans.pill')}</span>}
          </span>
          {curlAllowed ? (
            <small>{note}</small>
          ) : (
            <small data-testid="curl-premium-note">
              <IconSpark size={13} /> {t('settings.curl.premium')}{' '}
              <a href="#/planes" data-testid="curl-see-plans">
                {t('common.seePlans')}
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
            {t('settings.speed')}
          </span>
          <div class="segmented" role="radiogroup" aria-labelledby="curl-speed-label">
            {SPEEDS.map(([id, key]) => (
              <button
                key={id}
                role="radio"
                aria-checked={s.curlSpeed === id}
                class={s.curlSpeed === id ? 'is-on' : ''}
                onClick={() => updateSettings({ curlSpeed: id })}
                data-testid={`curl-speed-${id}`}
              >
                {t(key)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
