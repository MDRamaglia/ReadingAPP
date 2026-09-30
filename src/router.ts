/**
 * Rutas por hash (la app se sirve como sitio estático):
 *   #/                     biblioteca          #/leer/<id>          lector
 *   #/resenas              reseñas             #/resenas/<id>       una reseña
 *   #/resenas/nueva        escribir reseña     #/resenas/<id>/editar
 *   #/club                 Reading Club        #/club/<id>          una conversación
 *   #/club/nueva           publicar            #/club/<id>/editar
 *   #/planes               planes
 *   #/cuenta               perfil              #/cuenta/ingresar, /registro, /recuperar
 * «?volver=<ruta>» indica adónde ir después de iniciar sesión.
 */
export type Route =
  | { name: 'library' }
  | { name: 'reader'; id: string }
  | { name: 'reviews' }
  | { name: 'review'; id: string }
  | { name: 'reviewNew' }
  | { name: 'reviewEdit'; id: string }
  | { name: 'club' }
  | { name: 'thread'; id: string }
  | { name: 'threadNew' }
  | { name: 'threadEdit'; id: string }
  | { name: 'plans' }
  | { name: 'account' }
  | { name: 'signin'; back?: string }
  | { name: 'signup'; back?: string }
  | { name: 'recover' };

export type Section = 'library' | 'reviews' | 'club' | 'account' | 'plans';

export function parseRoute(hash: string): Route {
  const [path = '', query = ''] = hash.replace(/^#/, '').split('?');
  const back = new URLSearchParams(query).get('volver') ?? undefined;
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  const [a, b, c] = parts;
  switch (a) {
    case 'leer':
      return b ? { name: 'reader', id: b } : { name: 'library' };
    case 'resenas':
      if (!b) return { name: 'reviews' };
      if (b === 'nueva') return { name: 'reviewNew' };
      return c === 'editar' ? { name: 'reviewEdit', id: b } : { name: 'review', id: b };
    case 'club':
      if (!b) return { name: 'club' };
      if (b === 'nueva') return { name: 'threadNew' };
      return c === 'editar' ? { name: 'threadEdit', id: b } : { name: 'thread', id: b };
    case 'planes':
      return { name: 'plans' };
    case 'cuenta':
      if (b === 'ingresar') return { name: 'signin', back };
      if (b === 'registro') return { name: 'signup', back };
      if (b === 'recuperar') return { name: 'recover' };
      return { name: 'account' };
    default:
      return { name: 'library' };
  }
}

export function sectionOf(r: Route): Section {
  if (r.name.startsWith('review')) return 'reviews';
  if (r.name === 'club' || r.name.startsWith('thread')) return 'club';
  if (r.name === 'plans') return 'plans';
  if (r.name === 'account' || r.name === 'signin' || r.name === 'signup' || r.name === 'recover') return 'account';
  return 'library';
}

export const navigate = (path: string): void => {
  location.hash = path;
};

/** Ruta actual (sin «#»), para volver a ella después de iniciar sesión. */
export const currentPath = (): string => location.hash.replace(/^#/, '').split('?')[0] || '/';

export const signInHref = (back = currentPath()): string => `#/cuenta/ingresar?volver=${encodeURIComponent(back)}`;
