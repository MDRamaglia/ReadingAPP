/**
 * Copia a `public/vendor/` los recursos binarios que pdf.js y Tesseract
 * necesitan en tiempo de ejecución (tablas CMap, fuentes estándar, núcleo WASM
 * del OCR y el modelo de idioma español). Así la app los sirve desde su propio
 * origen y nunca depende de un CDN externo: ningún documento ni petición sale
 * del dispositivo durante la lectura o el reconocimiento de texto.
 */
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { Plugin } from 'vite';

const root = resolve(import.meta.dirname, '..');
const nm = (p: string) => resolve(root, 'node_modules', p);
const out = (p: string) => resolve(root, 'public/vendor', p);

const copies: Array<[string, string]> = [
  [nm('pdfjs-dist/cmaps'), out('pdfjs/cmaps')],
  [nm('pdfjs-dist/standard_fonts'), out('pdfjs/standard_fonts')],
  [nm('pdfjs-dist/wasm'), out('pdfjs/wasm')],
  [nm('pdfjs-dist/iccs'), out('pdfjs/iccs')],
  [nm('tesseract.js/dist/worker.min.js'), out('tesseract/worker.min.js')],
  [nm('tesseract.js-core/tesseract-core-lstm.wasm.js'), out('tesseract/core/tesseract-core-lstm.wasm.js')],
  [nm('tesseract.js-core/tesseract-core-simd-lstm.wasm.js'), out('tesseract/core/tesseract-core-simd-lstm.wasm.js')],
  [nm('tesseract.js-core/tesseract-core-relaxedsimd-lstm.wasm.js'), out('tesseract/core/tesseract-core-relaxedsimd-lstm.wasm.js')],
  [nm('@tesseract.js-data/spa/4.0.0_best_int/spa.traineddata.gz'), out('tesseract/lang/spa.traineddata.gz')],
];

export function copyVendorAssets(): void {
  for (const [from, to] of copies) {
    if (!existsSync(from)) throw new Error(`Falta el recurso ${from}. ¿Ejecutaste npm install?`);
    mkdirSync(dirname(to), { recursive: true });
    cpSync(from, to, { recursive: true });
  }
}

export function vendorAssets(): Plugin {
  return {
    name: 'renglon-vendor-assets',
    configResolved() {
      copyVendorAssets();
    },
  };
}
