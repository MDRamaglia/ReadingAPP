import { render } from 'preact';
import '@fontsource-variable/literata/wght.css';
import '@fontsource-variable/literata/wght-italic.css';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '@fontsource/atkinson-hyperlegible/400-italic.css';
import './styles/tokens.css';
import './styles/app.css';
import './styles/reader.css';
import './styles/sections.css';
import { App } from './app';
import { readDevParam } from './dev/devtools';
import { applyTheme, getSettings } from './lib/settings';
import { initAccount } from './services/account';

readDevParam();
applyTheme(getSettings());
void initAccount();
render(<App />, document.getElementById('app')!);

// Funcionamiento sin conexión, instalación en la pantalla de inicio y
// actualización automática cuando se publica una versión nueva.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  void import('./lib/update').then(({ startUpdates }) => startUpdates());
}
