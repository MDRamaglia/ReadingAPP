/**
 * Planes: comparación entre gratuito y premium, tomada de la configuración
 * central (config/plans.ts). La contratación queda preparada: los botones
 * llaman al servicio de suscripción, que hoy informa que estará disponible
 * próximamente.
 */
import { useState } from 'preact/hooks';
import { CLUB_MIN_AGE } from '../config/community';
import { FEATURES, PLANS, TECHNICAL_LIMITS, type PlanId } from '../config/plans';
import { fmtNumber, t } from '../i18n';
import { planOf } from '../lib/access';
import { useAccount } from '../services/account';
import { backend } from '../services/backend';
import { IconLock, IconSpark } from '../ui/icons';
import { PageHead } from '../ui/page';

export function PlansPage() {
  const { user } = useAccount();
  const current = planOf(user);
  const [msg, setMsg] = useState('');
  const choose = async (plan: PlanId) => setMsg((await (await backend()).subscription.startCheckout(plan)).message);

  return (
    <section>
      <PageHead title={t('plans.title')} lead={t('plans.lead')} />

      <div class="plan-grid">
        {(['free', 'premium'] as const).map((id) => {
          const p = PLANS[id];
          const isCurrent = user ? current === id : false;
          return (
            <div class={`card plan${id === 'premium' ? ' plan-premium' : ''}`} key={id} data-testid={`plan-${id}`}>
              <p class="plan-name">
                {id === 'premium' && <IconSpark size={20} />} {p.name}
              </p>
              <p class="plan-price" data-testid={`price-${id}`}>
                {p.price ?? t('plans.priceTbd')}
              </p>
              <p class="muted">{p.summary}</p>
              {isCurrent ? (
                <p class="plan-current">{t('plans.current')}</p>
              ) : id === 'premium' ? (
                <button class="btn btn-primary btn-block" onClick={() => void choose('premium')} data-testid="choose-premium">
                  {t('plans.choosePremium')}
                </button>
              ) : !user ? (
                <a class="btn btn-block" href="#/cuenta/registro">
                  {t('plans.createFree')}
                </a>
              ) : null}
            </div>
          );
        })}
      </div>
      {msg && (
        <p class="form-pending" role="status" data-testid="plans-msg">
          {msg}
        </p>
      )}

      <div class="table-wrap">
        <table class="compare" data-testid="plans-table">
          <thead>
            <tr>
              <th scope="col">{t('plans.table.feature')}</th>
              <th scope="col">{PLANS.free.name}</th>
              <th scope="col">{PLANS.premium.name}</th>
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((f) => (
              <tr key={f.id}>
                <th scope="row">{f.label}</th>
                <td class={f.free.allowed ? '' : 'is-locked'}>
                  {!f.free.allowed && <IconLock size={14} />} {f.free.label}
                </td>
                <td>{f.premium.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p class="muted small" data-testid="plans-club-age">
        {t('plans.clubAgeNote', { age: CLUB_MIN_AGE })}
      </p>
      <p class="muted small">{t('plans.technicalNote', { mb: fmtNumber(Math.round(TECHNICAL_LIMITS.maxFileBytes / 1024 / 1024)) })}</p>
      <p class="muted small">{t('plans.paymentsNote')}</p>
    </section>
  );
}
