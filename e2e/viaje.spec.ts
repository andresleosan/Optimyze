import { expect, test, type Page } from '@playwright/test';

// `?software` permite la escena en esta máquina sin GPU.
const conEscena = async (page: Page, ruta = '/es/') => {
  await page.goto(`${ruta}?software`);
  await expect(page.locator('html')).toHaveAttribute('data-viaje', 'vivo', { timeout: 30_000 });
};
const contenidoVisible = (page: Page) => page.evaluate(() => getComputedStyle(document.querySelector('main')!).opacity);

test('los dos idiomas muestran titular, menú y correo', async ({ page }) => {
  for (const [ruta, lang, contacto] of [['/', 'en-GB', '#contact'], ['/es/', 'es', '#contacto']] as const) {
    await page.goto(ruta);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav a')).toHaveCount(5);
    await expect(page.locator(`${contacto} .correo`)).toContainText('@');
    await expect(page.locator(`${contacto} a[href^="mailto:"]`)).toBeVisible();
  }
});

test('sin JavaScript se lee todo y no hay controles inútiles', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/es/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('#preguntas dt')).toHaveCount(6);
  await expect(page.locator('#preguntas dd').first()).toBeVisible(); // preguntas visibles, sin acordeón
  await expect(page.locator('#pausa')).toBeHidden();
  await ctx.close();
});

test('sin WebGL la página queda con el respaldo y los enlaces saltan como anclas normales', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto('/es/');
  await page.locator('nav a[href="#contacto"]').click();
  await expect(page).toHaveURL(/#contacto$/);
  await expect(page.locator('html')).not.toHaveAttribute('data-viaje', 'vivo');
  await expect(page.locator('#pausa')).toBeHidden();
  expect(await contenidoVisible(page)).toBe('1');
});

test('el enlace de sección salta: historial, foco en el encabezado y contenido visible', async ({ page }) => {
  await conEscena(page);
  await page.locator('nav a[href="#contacto"]').click();
  await expect(page).toHaveURL(/#contacto$/);
  await expect(page.locator('#contacto h2')).toBeFocused({ timeout: 10_000 });
  await expect(page.locator('html')).not.toHaveAttribute('data-salto', /.*/);
  await expect.poll(() => contenidoVisible(page)).toBe('1');
  await expect(page.locator('#progreso')).toHaveText(/6 de 6$/, { useInnerText: false });
  await expect(page.locator('nav a[href="#contacto"]')).toHaveAttribute('aria-current', 'true');
  await page.goBack(); // «atrás» vuelve al punto de partida, no sale del sitio
  await expect(page).toHaveURL(/\/es\/\?software$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(50);
});

test('pausar a mitad de un salto no deja la página sin contenido', async ({ page }) => {
  await conEscena(page);
  await page.locator('.inicio a[href="#servicios"]').click();
  await page.evaluate(() => (document.querySelector('#pausa') as HTMLButtonElement).click()); // dentro del mismo fotograma
  await expect(page.locator('#pausa')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => contenidoVisible(page)).toBe('1');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200);
  // La pausa se recuerda en la siguiente visita.
  await page.reload();
  await expect(page.locator('#pausa')).toHaveAttribute('aria-pressed', 'true', { timeout: 30_000 });
});

test('con movimiento reducido no hay salto animado', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await conEscena(page);
  await page.locator('nav a[href="#equipo"]').click();
  await expect(page).toHaveURL(/#equipo$/);
  await expect(page.locator('html')).not.toHaveAttribute('data-salto', /.*/);
  expect(await contenidoVisible(page)).toBe('1');
});

test('teclado: el primer Tab ofrece saltar al contenido y el control de pausa es alcanzable', async ({ page }) => {
  await conEscena(page);
  await page.keyboard.press('Tab');
  await expect(page.locator('.saltar')).toBeFocused();
  await expect(page.locator('#pausa')).toBeVisible();
  const caja = await page.locator('#pausa').boundingBox();
  expect(caja!.height).toBeGreaterThanOrEqual(24); // WCAG 2.5.8
});

test('la cabecera no tapa el destino de un ancla y no hay scroll horizontal', async ({ page }) => {
  await page.goto('/es/#visibilidad');
  const top = await page.locator('#visibilidad').evaluate((el) => el.getBoundingClientRect().top);
  const cabecera = await page.locator('.cabecera').evaluate((el) => el.getBoundingClientRect().bottom);
  expect(top).toBeGreaterThanOrEqual(cabecera - 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('página no encontrada: 404 bilingüe', async ({ page }) => {
  const r = await page.goto('/es/no-existe/');
  expect(r!.status()).toBe(404);
  await expect(page.locator('main')).toContainText('Volver al inicio');
  await expect(page.locator('main')).toContainText('Back to the start');
});
