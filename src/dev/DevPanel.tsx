/**
 * Panel de desarrollo (solo con las herramientas de desarrollo activas):
 * cambia el plan de la cuenta de prueba local para verificar premium.
 */
import { useState } from 'preact/hooks';
import { PLANS } from '../config/plans';
import { t } from '../i18n';
import { devSetPlan, useAccount } from '../services/account';

export function DevPanel() {
  const { user, backendKind, backendLabel } = useAccount();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const canSet = backendKind === 'local';
  const setPlan = async (plan: 'free' | 'premium') => {
    try {
      await devSetPlan(plan);
      setMsg(plan === 'premium' ? t('dev.nowPremium') : t('dev.nowFree'));
    } catch (e) {
      setMsg((e as Error).message);
    }
  };
  return (
    <aside class={`dev-panel${open ? ' is-open' : ''}`} data-testid="dev-panel">
      <button class="dev-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open} data-testid="dev-toggle">
        {t('dev.toggle')}
      </button>
      {open && (
        <div class="dev-body">
          <p class="dev-title">{t('dev.title')}</p>
          <p class="dev-note">{t('dev.note', { service: backendLabel })}</p>
          {!canSet && <p class="dev-note">{t('dev.cannotSetPlan')}</p>}
          {canSet && !user && <p class="dev-note">{t('dev.signInFirst')}</p>}
          {canSet && user && (
            <div class="segmented" role="radiogroup" aria-label={t('dev.planLabel')}>
              {(['free', 'premium'] as const).map((p) => (
                <button key={p} role="radio" aria-checked={user.plan === p} class={user.plan === p ? 'is-on' : ''} onClick={() => void setPlan(p)} data-testid={`dev-plan-${p}`}>
                  {PLANS[p].name}
                </button>
              ))}
            </div>
          )}
          {msg && <p class="dev-note" role="status">{msg}</p>}
          <a class="dev-off" href="?dev=0#/">
            {t('dev.off')}
          </a>
        </div>
      )}
    </aside>
  );
}
