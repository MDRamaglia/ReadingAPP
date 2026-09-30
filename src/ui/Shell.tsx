/**
 * Marco común de las secciones (todas menos el lector): encabezado con el
 * logo y el lema, navegación arriba en pantallas anchas y barra de pestañas
 * abajo en el celular, al alcance del pulgar.
 */
import type { ComponentChildren } from 'preact';
import { DevPanel } from '../dev/DevPanel';
import { devToolsEnabled } from '../dev/devtools';
import type { Section } from '../router';
import { useAccount } from '../services/account';
import { BrandMark, BrandWordmark } from './Brand';
import { IconClub, IconLibrary, IconReview, IconSpark, IconUser } from './icons';

const SECTIONS: Array<{ id: Section; href: string; label: string; icon: (p: { size?: number }) => preact.JSX.Element }> = [
  { id: 'library', href: '#/', label: 'Biblioteca', icon: IconLibrary },
  { id: 'reviews', href: '#/resenas', label: 'Reseñas', icon: IconReview },
  { id: 'club', href: '#/club', label: 'Reading Club', icon: IconClub },
  { id: 'plans', href: '#/planes', label: 'Planes', icon: IconSpark },
];

export function Shell({ section, children }: { section: Section; children: ComponentChildren }) {
  const { user } = useAccount();
  const account = { id: 'account' as Section, href: '#/cuenta', label: user ? user.username : 'Cuenta', icon: IconUser };
  return (
    <div class="shell">
      <header class="app-head">
        <a class="brand" href="#/" aria-label="Knowmadic, ir a la biblioteca">
          <BrandMark size={44} />
          <span class="brand-text">
            <span class="brand-name">
              <BrandWordmark height={24} />
              <span class="visually-hidden">Knowmadic</span>
            </span>
            <span class="brand-tag">Un lugar para leer. Un espacio para pensar.</span>
          </span>
        </a>
        <nav class="top-nav" aria-label="Secciones">
          {SECTIONS.map((s) => (
            <a key={s.id} href={s.href} class={section === s.id ? 'is-on' : ''} aria-current={section === s.id ? 'page' : undefined}>
              {s.label}
            </a>
          ))}
        </nav>
        <a class={`account-chip${section === 'account' ? ' is-on' : ''}`} href="#/cuenta" data-testid="account-chip">
          <span class="avatar" aria-hidden="true">
            {user ? user.username.slice(0, 1).toUpperCase() : <IconUser size={18} />}
          </span>
          <span class="account-chip-label">{user ? user.username : 'Ingresar'}</span>
          {user?.plan === 'premium' && <span class="plan-pill">Premium</span>}
        </a>
      </header>

      <main class="page">{children}</main>

      <nav class="tab-bar" aria-label="Secciones">
        {[SECTIONS[0]!, SECTIONS[1]!, SECTIONS[2]!, account].map((s) => (
          <a key={s.id} href={s.href} class={section === s.id ? 'is-on' : ''} aria-current={section === s.id ? 'page' : undefined}>
            <s.icon size={22} />
            <span>{s.id === 'club' ? 'Club' : s.label}</span>
          </a>
        ))}
      </nav>
      {devToolsEnabled() && <DevPanel />}
    </div>
  );
}
