// Lógica pura del viaje (sin DOM ni WebGL): se prueba en Node sin GPU.
// Unidades de distancia: radios de Schwarzschild del agujero (r_s = 1).

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Encuadre de la cámara en una parada. cx, cy: posición del agujero en pantalla (y en [-1,1]; x en [-aspecto, aspecto]). */
export interface Encuadre {
  dist: number;
  cx: number;
  cy: number;
  incl: number;
  roll: number;
  exposure: number;
  fov: number;
}

const DIST_INICIO = 60; // agujero entero y lejano
const DIST_LLEGADA = 4.6; // la sombra llena el centro de la pantalla
const FOV = 0.6;

/**
 * Encuadres de n paradas, de la primera (lejos) a la última (llegada). Se calculan del número de paradas:
 * añadir o quitar una sección no obliga a tocar nada aquí.
 * Horizontal: el agujero queda a la derecha del texto y deriva al centro al llegar.
 * Vertical: centrado, en la franja superior, y baja al centro al llegar.
 */
export function encuadres(n: number, aspecto: number): Encuadre[] {
  const vertical = aspecto < 1;
  return Array.from({ length: n }, (_, i) => {
    const t = n > 1 ? i / (n - 1) : 0;
    return {
      dist: DIST_INICIO * Math.pow(DIST_LLEGADA / DIST_INICIO, t), // geométrica: el tamaño aparente crece de forma uniforme
      cx: vertical ? 0 : 0.46 * aspecto * (1 - t * t * t),
      cy: vertical ? 0.5 * Math.pow(1 - t, 1.5) : mix(0.1, -0.1, t),
      incl: mix(0.16, 0.075, t),
      roll: mix(-0.18, 0, t),
      exposure: mix(1, 0.7, t),
      fov: vertical ? FOV * 1.3 : FOV,
    };
  });
}

/** Mezcla de dos encuadres. La distancia se interpola en escala logarítmica. */
export function mezclar(a: Encuadre, b: Encuadre, t: number): Encuadre {
  return {
    dist: Math.exp(mix(Math.log(a.dist), Math.log(b.dist), t)),
    cx: mix(a.cx, b.cx, t),
    cy: mix(a.cy, b.cy, t),
    incl: mix(a.incl, b.incl, t),
    roll: mix(a.roll, b.roll, t),
    exposure: mix(a.exposure, b.exposure, t),
    fov: mix(a.fov, b.fov, t),
  };
}

/** Encuadre en la posición fraccionaria u (0 = primera parada, n-1 = última). */
export function encuadreEn(lista: Encuadre[], u: number): Encuadre {
  const n = lista.length;
  if (n === 1) return lista[0]!;
  const uu = clamp(u, 0, n - 1);
  const i = Math.min(n - 2, Math.floor(uu));
  return mezclar(lista[i]!, lista[i + 1]!, smooth(uu - i));
}

/**
 * Nudos de scroll: en qué scrollY se alcanza cada parada. La ÚLTIMA parada se alcanza al final de la
 * página aunque su sección sea más corta que la ventana, y los nudos siempre crecen.
 */
export function nudosDeScroll(tops: number[], altoDoc: number, altoVentana: number, margen = 0): number[] {
  const yMax = Math.max(0, altoDoc - altoVentana);
  const k = tops.map((t) => clamp(t - margen, 0, yMax));
  const n = k.length;
  k[0] = 0;
  k[n - 1] = yMax;
  const hueco = Math.max(1, Math.min(altoVentana * 0.25, yMax / (n * 2)));
  for (let i = n - 2; i >= 0; i--) k[i] = Math.min(k[i]!, k[i + 1]! - hueco);
  for (let i = 1; i < n; i++) k[i] = Math.max(k[i]!, k[i - 1]! + Math.min(hueco, 1));
  k[0] = 0;
  return k;
}

/** scrollY -> posición fraccionaria u según los nudos. */
export function posicionDesdeScroll(nudos: number[], y: number): number {
  const n = nudos.length;
  if (n < 2 || y <= nudos[0]!) return 0;
  if (y >= nudos[n - 1]!) return n - 1;
  let i = 0;
  while (i < n - 2 && y >= nudos[i + 1]!) i++;
  return i + (y - nudos[i]!) / (nudos[i + 1]! - nudos[i]!);
}

/** Seguidor exponencial independiente de los fps. */
export const seguir = (actual: number, objetivo: number, dt: number, rapidez = 9) =>
  actual + (objetivo - actual) * (1 - Math.exp(-dt * rapidez));

/**
 * Estela por scroll (0..TOPE_SCROLL) a partir de la velocidad real en paradas/segundo.
 * El scroll solo insinúa el avance: la hipervelocidad completa es exclusiva del salto por enlace.
 */
export const TOPE_SCROLL = 0.16;
export const estelaDesdeScroll = (v: number, v0 = 0.5, v1 = 3.2) =>
  TOPE_SCROLL * smooth(clamp((Math.abs(v) - v0) / (v1 - v0)));

/** Duración del salto (ms) según cuántas paradas se saltan. */
export const duracionSalto = (saltos: number) => clamp(750 + 150 * Math.abs(saltos), 900, 1400);

/** Envolvente del salto: una sola subida y una sola bajada. */
export const envolventeSalto = (k: number) => (k <= 0 || k >= 1 ? 0 : Math.pow(Math.sin(Math.PI * k), 1.5));

/**
 * Limitador de destello (WCAG 2.3.1): el aporte de luminancia a pantalla completa nunca sube ni baja más
 * de `maxPorSegundo` por segundo, así que no puede haber tres destellos en un segundo.
 */
export function limitarDestello(previo: number, deseado: number, dt: number, maxPorSegundo = 0.09): number {
  const paso = maxPorSegundo * dt;
  return previo + clamp(deseado - previo, -paso, paso);
}

/** Luz de la escena (1 = normal): se apaga rápido al coger velocidad y se recupera despacio, sin fogonazo. */
export function seguirLuz(previa: number, objetivo: number, dt: number, bajada = 12, subidaMax = 0.5): number {
  return objetivo < previa ? seguir(previa, objetivo, dt, bajada) : Math.min(objetivo, previa + subidaMax * dt);
}

/** Gobernador de calidad: baja rápido, sube despacio. Devuelve -1, 0 o +1. */
export interface EstadoGobernador {
  ema?: number | null;
  t?: number;
}
export function gobernador(estado: EstadoGobernador, dtMs: number): -1 | 0 | 1 {
  estado.ema = estado.ema == null ? dtMs : estado.ema * 0.9 + dtMs * 0.1;
  estado.t = (estado.t || 0) + dtMs;
  if (estado.ema > 24 && estado.t > 600) {
    estado.t = 0;
    estado.ema = null;
    return -1;
  }
  if (estado.ema < 13 && estado.t > 4000) {
    estado.t = 0;
    return 1;
  }
  return 0;
}

/** Tamaño interno del lienzo con tope de DPR y presupuesto de píxeles. */
export function tamanoInterno(cssW: number, cssH: number, dpr: number, maxDpr: number, maxPixeles: number) {
  let s = Math.min(dpr, maxDpr);
  const px = cssW * cssH * s * s;
  if (px > maxPixeles) s *= Math.sqrt(maxPixeles / px);
  return { w: Math.max(2, Math.round(cssW * s)), h: Math.max(2, Math.round(cssH * s)) };
}

/** Color #rrggbb (sRGB) a RGB lineal, que es lo que espera el shader. */
export function hexALineal(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1]!, 16);
  const canal = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return [canal((n >> 16) & 255), canal((n >> 8) & 255), canal(n & 255)];
}
