import { defineConfig } from '@playwright/test';

// Recorrido en navegador contra `wrangler pages dev`: lo mismo que servirá Cloudflare Pages (cabeceras, 404, barras finales).
// Usa el Chrome del sistema. Un solo worker: sin GPU, WebGL corre por software y en paralelo salen timeouts falsos.
export default defineConfig({
  testDir: 'e2e',
  workers: 1,
  retries: 2, // esta máquina mata navegadores por memoria: un cierre suelto no es un fallo de la web
  reporter: 'list',
  timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:4399', channel: 'chrome' },
  projects: [
    { name: 'movil-360', use: { viewport: { width: 360, height: 800 } } },
    { name: 'escritorio-1280', use: { viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: 'pnpm exec wrangler pages dev dist --ip 127.0.0.1 --port 4399',
    url: 'http://127.0.0.1:4399/',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
