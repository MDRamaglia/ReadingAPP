/**
 * Planes: comparación entre gratuito y premium, tomada de la configuración
 * central (config/plans.ts). La contratación queda preparada: los botones
 * llaman al servicio de suscripción, que hoy informa que estará disponible
 * próximamente.
 */
import { useState } from 'preact/hooks';
import { FEATURES, PLANS, TECHNICAL_LIMITS, type PlanId } from '../config/plans';
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
      <PageHead title="Planes" lead="Leer es gratis. Premium suma la biblioteca sin límite de cantidad, la animación de hoja y el Reading Club." />

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
                {p.price ?? 'Precio a definir'}
              </p>
              <p class="muted">{p.summary}</p>
              {isCurrent ? (
                <p class="plan-current">Tu plan actual</p>
              ) : id === 'premium' ? (
                <button class="btn btn-primary btn-block" onClick={() => void choose('premium')} data-testid="choose-premium">
                  Elegir premium
                </button>
              ) : !user ? (
                <a class="btn btn-block" href="#/cuenta/registro">
                  Crear una cuenta gratuita
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
              <th scope="col">Función</th>
              <th scope="col">Gratuito</th>
              <th scope="col">Premium</th>
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

      <p class="muted small">
        Los límites técnicos se aplican a todos los planes: hasta {Math.round(TECHNICAL_LIMITS.maxFileBytes / 1024 / 1024)} MB por archivo y el espacio que
        el navegador asigna a la biblioteca en cada dispositivo. «Sin límite de cantidad» se refiere solo a la cantidad de documentos.
      </p>
      <p class="muted small">La contratación del plan premium se habilitará cuando se conecte la plataforma de pagos. El precio está pendiente de definición.</p>
    </section>
  );
}
