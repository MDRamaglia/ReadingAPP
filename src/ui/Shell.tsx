/**
 * Marco común de las secciones (todas menos el lector): encabezado con el
 * logo y el lema, navegación arriba en pantallas anchas y barra de pestañas
 * abajo en el celular, al alcance del pulgar.
 */
import type { ComponentChildren } from 'preact';
import { DevPanel } from '../dev/DevPanel';
import { devToolsEnabled } from '../dev/devtools';
import { t, type Key } from '../i18n';
import type { Section } from '../router';
import { useAccount } from '../services/account';
import { BrandMark, BrandWordmark } from './Brand';
import { IconClub, IconLibrary, IconReview, IconSpark, IconUser } from './icons';

type NavItem = { id: Section; href: string; label: string; icon: (p: { size?: number }) => preact.JSX.Element };

const SECTIONS: Array<Omit<NavItem, 'label'> & { label: Key }> = [
  { id: 'library', href: '#/', label: 'nav.library', icon: IconLibrary },
  { id: 'reviews', href: '#/resenas', label: 'nav.reviews', icon: IconReview },
  { id: 'club', href: '#/club', label: 'nav.club', icon: IconClub },
  { id: 'plans', href: '#/planes', label: 'nav.plans', icon: IconSpark },
];

export function Shell({ section, children }: { section: Section; children: ComponentChildren }) {
  const { user } = useAccount();
  const sections: NavItem[] = SECTIONS.map((s) => ({ ...s, label: t(s.label) }));
  const account: NavItem = { id: 'account', href: '#/cuenta', label: user ? user.username : t('nav.account'), icon: IconUser };
  return (
    <div class="shell">
      <header class="app-head">
        <a class="brand" href="#/" aria-label={t('brand.homeLabel')}>
          <BrandMark size={44} />
          <span class="brand-text">
            <span class="brand-name">
              <BrandWordmark height={24} />
              <span class="visually-hidden">Knowmadic</span>
            </span>
            <span class="brand-tag">{t('brand.tagline')}</span>
          </span>
        </a>
        <nav class="top-nav" aria-label={t('nav.sections')}>
          {sections.map((s) => (
            <a key={s.id} href={s.href} class={section === s.id ? 'is-on' : ''} aria-current={section === s.id ? 'page' : undefined}>
              {s.label}
            </a>
          ))}
        </nav>
        <a class={`account-chip${section === 'account' ? ' is-on' : ''}`} href="#/cuenta" data-testid="account-chip">
          <span class="avatar" aria-hidden="true">
            {user ? user.username.slice(0, 1).toUpperCase() : <IconUser size={18} />}
          </span>
          <span class="account-chip-label">{user ? user.username : t('nav.signIn')}</span>
          {user?.plan === 'premium' && <span class="plan-pill">{t('plans.pill')}</span>}
        </a>
      </header>

      <main class="page">{children}</main>

      <nav class="tab-bar" aria-label={t('nav.sections')}>
        {[sections[0]!, sections[1]!, sections[2]!, account].map((s) => (
          <a key={s.id} href={s.href} class={section === s.id ? 'is-on' : ''} aria-current={section === s.id ? 'page' : undefined}>
            <s.icon size={22} />
            <span>{s.id === 'club' ? t('nav.clubShort') : s.label}</span>
          </a>
        ))}
      </nav>
      {devToolsEnabled() && <DevPanel />}
    </div>
  );
}
