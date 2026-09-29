import { useEffect, useState } from 'preact/hooks';
import { Library } from './library/Library';
import { Reader } from './reader/Reader';

/** Rutas mínimas por hash: «#/» biblioteca, «#/leer/<id>» lector. */
function readRoute(): { docId: string | null } {
  const m = /^#\/leer\/([\w-]+)/.exec(location.hash);
  return { docId: m ? m[1]! : null };
}

export function App() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const on = () => setRoute(readRoute());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const open = (id: string) => {
    location.hash = `#/leer/${id}`;
  };
  const exit = () => {
    if (history.length > 1 && route.docId) history.back();
    else location.hash = '#/';
    // Si el historial no tenía la biblioteca (enlace directo), se fuerza.
    window.setTimeout(() => {
      if (readRoute().docId) location.hash = '#/';
    }, 50);
  };

  return route.docId ? <Reader key={route.docId} docId={route.docId} onExit={exit} /> : <Library onOpen={open} />;
}
