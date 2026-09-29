import { render } from 'preact';
import '@fontsource-variable/literata/wght.css';
import '@fontsource-variable/literata/wght-italic.css';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '@fontsource/atkinson-hyperlegible/400-italic.css';
import './styles/tokens.css';
import './styles/app.css';
import './styles/reader.css';
import { App } from './app';
import { applyTheme, getSettings } from './lib/settings';

applyTheme(getSettings());
render(<App />, document.getElementById('app')!);

// Funcionamiento sin conexión e instalación en la pantalla de inicio.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  void import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }));
}
