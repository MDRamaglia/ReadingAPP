import { useEffect, useState } from 'preact/hooks';
import { ProfilePage, RecoverPage, SignInPage, SignUpPage } from './account/AccountPages';
import { ClubPage, ThreadFormPage, ThreadPage } from './community/Club';
import { ReviewFormPage, ReviewPage, ReviewsPage } from './community/Reviews';
import { Library } from './library/Library';
import { PlansPage } from './plans/Plans';
import { Reader } from './reader/Reader';
import { parseRoute, sectionOf, type Route } from './router';
import { Shell } from './ui/Shell';

function page(route: Route, open: (id: string) => void) {
  switch (route.name) {
    case 'reviews':
      return <ReviewsPage />;
    case 'review':
      return <ReviewPage id={route.id} />;
    case 'reviewNew':
      return <ReviewFormPage />;
    case 'reviewEdit':
      return <ReviewFormPage id={route.id} />;
    case 'club':
      return <ClubPage />;
    case 'thread':
      return <ThreadPage id={route.id} />;
    case 'threadNew':
      return <ThreadFormPage />;
    case 'threadEdit':
      return <ThreadFormPage id={route.id} />;
    case 'plans':
      return <PlansPage />;
    case 'account':
      return <ProfilePage />;
    case 'signin':
      return <SignInPage back={route.back} />;
    case 'signup':
      return <SignUpPage back={route.back} />;
    case 'recover':
      return <RecoverPage />;
    default:
      return <Library onOpen={open} />;
  }
}

export function App() {
  const [route, setRoute] = useState(() => parseRoute(location.hash));
  useEffect(() => {
    const on = () => {
      setRoute(parseRoute(location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    // Si el hash cambió entre el primer dibujo y este efecto, ese aviso se perdió.
    const now = parseRoute(location.hash);
    setRoute((r) => (JSON.stringify(r) === JSON.stringify(now) ? r : now));
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const open = (id: string) => {
    location.hash = `#/leer/${id}`;
  };
  const exit = () => {
    if (history.length > 1 && route.name === 'reader') history.back();
    else location.hash = '#/';
    // Si el historial no tenía la biblioteca (enlace directo), se fuerza.
    window.setTimeout(() => {
      if (parseRoute(location.hash).name === 'reader') location.hash = '#/';
    }, 50);
  };

  if (route.name === 'reader') return <Reader key={route.id} docId={route.id} onExit={exit} />;
  return <Shell section={sectionOf(route)}>{page(route, open)}</Shell>;
}
