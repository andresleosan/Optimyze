import { expect, test, type Page } from '@playwright/test';
import { analizadorDestellos, decodificarCaptura, type FotogramaRGB } from '../src/viaje/destellos';

const RUTA = '/es/?software';
const PASO = 16;
const ESCALA = 0.5;
const LIMITE = 0.25;

test.use({ launchOptions: { args: ['--disable-smooth-scrolling'] } });

async function pulsar(page: Page, selector: string, hash: string) {
  // Con el reloj detenido, click() de Playwright esperaría fotogramas de estabilidad.
  await page.locator(selector).evaluate((enlace: HTMLAnchorElement) => enlace.click());
  await expect(page).toHaveURL(new RegExp(`#${hash}$`));
  await expect(page.locator('html')).toHaveAttribute('data-salto', '1');
}

async function bajar(page: Page, fraccion: number) {
  await page.evaluate((f) => scrollTo({
    top: f * (document.documentElement.scrollHeight - innerHeight),
    behavior: 'instant',
  }), fraccion);
}

const alContacto = (page: Page) => pulsar(page, 'nav a[href="#contacto"]', 'contacto');
const escenarios = [
  { nombre: 'salto largo', empezar: alContacto },
  {
    nombre: 'salto corto',
    empezar: (page: Page) => pulsar(page, '.inicio a[href="#servicios"]', 'servicios'),
  },
  {
    nombre: 'salto atrás',
    preparar: async (page: Page) => {
      await alContacto(page);
      await page.clock.runFor(2400);
    },
    empezar: (page: Page) => pulsar(page, 'a.marca', 'inicio'),
  },
  {
    nombre: 'tecla Fin',
    empezar: async (page: Page) => {
      await page.keyboard.press('End');
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    },
  },
  {
    nombre: 'barrido en un segundo',
    avanzar: (page: Page, ms: number) => bajar(page, Math.min(ms / 1000, 1)),
  },
];

test.describe('destellos generales de la escena', () => {
  test.use({ deviceScaleFactor: ESCALA });

  for (const escenario of escenarios) {
    test(escenario.nombre, async ({ page }, info) => {
      test.slow(); // captura cada fotograma, también cuando Chrome dibuja por software
      const inicio = Date.UTC(2026, 0, 1);
      await page.clock.install({ time: inicio });
      await page.clock.pauseAt(inicio + 5000);
      await page.goto(RUTA);
      // La transición CSS pasa en tiempo real. Aislamos el dibujo sin cambiar el flujo del documento.
      await page.addStyleTag({ content: '#viaje { transition: none } .cabecera, main, .pie, .saltar { visibility: hidden }' });
      await page.clock.runFor(512);
      const raiz = page.locator('html');
      await expect(raiz).toHaveAttribute('data-viaje', 'vivo');
      await escenario.preparar?.(page);

      const captura = async () => decodificarCaptura(await page.screenshot());
      const base = await captura();
      const t0 = await page.evaluate(() => performance.now());
      const analizador = analizadorDestellos(base.ancho, base.alto, ESCALA);
      analizador.anotar(base, 0);
      await escenario.empezar?.(page);
      let ultima = base;
      for (let ms = PASO; ms <= 2400; ms += PASO) {
        if (escenario.avanzar && ms <= 1000 + PASO) await escenario.avanzar(page, ms);
        await page.clock.runFor(PASO);
        ultima = await captura();
        analizador.anotar(ultima, ms);
      }
      expect(await page.evaluate(() => performance.now()) - t0).toBe(2400);
      expect(Buffer.from(ultima.pixeles).equals(base.pixeles), 'El fondo debe cambiar durante la acción').toBe(false);
      await expect(raiz).toHaveAttribute('data-viaje', 'vivo');
      await expect(raiz).not.toHaveAttribute('data-salto', /.+/);
      const posicion = await page.evaluate(() => scrollY / (document.documentElement.scrollHeight - innerHeight));
      if (escenario.nombre === 'salto atrás') expect(posicion).toBe(0);
      else if (escenario.nombre === 'salto corto') expect(posicion).toBeGreaterThan(0);
      else expect(posicion).toBeGreaterThan(0.9);
      const porcentaje = (analizador.areaMaxima * 100).toFixed(2);
      info.annotations.push({ type: 'Área máxima', description: `${porcentaje} %` });
      expect(analizador.areaMaxima, `Área máxima con más de tres destellos por segundo: ${porcentaje} %`).toBeLessThanOrEqual(LIMITE);
    });
  }
});

test('el analizador distingue frecuencia, brillo y área en el borde de la pantalla', () => {
  function medir(intervalo: number, claro: number, columnas: number) {
    const ancho = 32;
    const alto = 16;
    const analizador = analizadorDestellos(ancho, alto, 1 / 16);
    const pixeles = new Uint8Array(ancho * alto * 3);
    for (let i = 0; i < 9; i++) {
      const brillo = i % 2 ? claro : 20;
      pixeles.fill(20);
      for (let y = 0; y < alto; y++) {
        pixeles.fill(brillo, (y * ancho + ancho - columnas) * 3, (y + 1) * ancho * 3);
      }
      analizador.anotar({ ancho, alto, canales: 3, pixeles }, intervalo * i);
    }
    return analizador.areaMaxima;
  }

  expect(medir(125, 200, 32)).toBe(1);
  expect(medir(170, 200, 32)).toBe(0);
  expect(medir(125, 60, 32)).toBe(0);
  expect(medir(125, 200, 4)).toBeCloseTo(4 / 22);
  expect(medir(125, 200, 6)).toBeGreaterThan(LIMITE);
});

/** Puntos brillantes más claros que los cuatro vecinos: estrellas sobre cielo oscuro. */
function contarEstrellas({ ancho, alto, canales, pixeles }: FotogramaRGB) {
  const claro = (x: number, y: number) => {
    const i = (y * ancho + x) * canales;
    return Math.min(pixeles[i], pixeles[i + 1], pixeles[i + 2]);
  };
  let total = 0;
  for (let y = 2; y < alto - 2; y++) {
    for (let x = 2; x < ancho - 2; x++) {
      const pico = claro(x, y);
      const alrededor = Math.max(claro(x - 2, y), claro(x + 2, y), claro(x, y - 2), claro(x, y + 2));
      if (pico > 60 && pico - alrededor > 24) total++;
    }
  }
  return total;
}

test('se ven estrellas en la página y vuelven al restaurar WebGL', async ({ page }) => {
  await page.goto(RUTA);
  await page.addStyleTag({ content: '#viaje { transition: none }' });
  const raiz = page.locator('html');
  await expect(raiz).toHaveAttribute('data-viaje', 'vivo');

  // Franja por encima del titular, sin texto y dentro de la captura de la página.
  const clip = await page.evaluate(() => {
    const y = Math.ceil(document.querySelector('.cabecera')!.getBoundingClientRect().bottom) + 4;
    const fin = Math.floor(document.querySelector('h1')!.getBoundingClientRect().top) - 4;
    return { x: 0, y, width: innerWidth, height: fin - y };
  });
  expect(clip.height).toBeGreaterThan(20);
  const estrellas = async () => contarEstrellas(decodificarCaptura(await page.screenshot({ clip })));
  await expect.poll(estrellas).toBeGreaterThan(2);

  const extension = await page.locator('canvas#viaje').evaluateHandle((lienzo: HTMLCanvasElement) => {
    const extension = lienzo.getContext('webgl2')?.getExtension('WEBGL_lose_context');
    if (!extension) throw new Error('WEBGL_lose_context no disponible');
    return extension;
  });
  await extension.evaluate((gl) => gl.loseContext());
  await expect(raiz).not.toHaveAttribute('data-viaje', 'vivo');
  await expect(page.locator('h1')).toBeVisible();
  expect(await estrellas()).toBe(0);

  await extension.evaluate((gl) => gl.restoreContext());
  await expect(raiz).toHaveAttribute('data-viaje', 'vivo');
  await expect.poll(estrellas).toBeGreaterThan(2);
});
