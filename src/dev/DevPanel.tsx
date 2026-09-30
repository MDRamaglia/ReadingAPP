/**
 * Panel de desarrollo (solo con las herramientas de desarrollo activas):
 * cambia el plan de la cuenta de prueba local para verificar premium.
 */
import { useState } from 'preact/hooks';
import { devSetPlan, useAccount } from '../services/account';

export function DevPanel() {
  const { user, backendKind, backendLabel } = useAccount();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const canSet = backendKind === 'local';
  const setPlan = async (plan: 'free' | 'premium') => {
    try {
      await devSetPlan(plan);
      setMsg(plan === 'premium' ? 'Cuenta de prueba en premium.' : 'Cuenta de prueba en gratuito.');
    } catch (e) {
      setMsg((e as Error).message);
    }
  };
  return (
    <aside class={`dev-panel${open ? ' is-open' : ''}`} data-testid="dev-panel">
      <button class="dev-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open} data-testid="dev-toggle">
        Desarrollo
      </button>
      {open && (
        <div class="dev-body">
          <p class="dev-title">Herramientas de desarrollo</p>
          <p class="dev-note">Servicio: {backendLabel}. Sirven solo para verificar funciones; con un servidor real el plan lo decide la suscripción.</p>
          {!canSet && <p class="dev-note">Este servicio no permite cambiar el plan desde la app.</p>}
          {canSet && !user && <p class="dev-note">Iniciá sesión con una cuenta de prueba para cambiar su plan.</p>}
          {canSet && user && (
            <div class="segmented" role="radiogroup" aria-label="Plan de la cuenta de prueba">
              {(['free', 'premium'] as const).map((p) => (
                <button key={p} role="radio" aria-checked={user.plan === p} class={user.plan === p ? 'is-on' : ''} onClick={() => void setPlan(p)} data-testid={`dev-plan-${p}`}>
                  {p === 'free' ? 'Gratuito' : 'Premium'}
                </button>
              ))}
            </div>
          )}
          {msg && <p class="dev-note" role="status">{msg}</p>}
          <a class="dev-off" href="?dev=0#/">
            Apagar herramientas de desarrollo
          </a>
        </div>
      )}
    </aside>
  );
}
