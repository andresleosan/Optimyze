// Une el documento (scroll, enlaces de sección, preferencias) con el motor de la escena.
// Regla de oro: la visibilidad del contenido nunca depende de este bucle. Si el salto se interrumpe
// (pausa, movimiento reducido, pestaña oculta, contexto perdido o cualquier gesto), termina en el destino.
import { crearMotor, NIVELES, type Fotograma, type Nivel } from './motor';
import * as T from './tiempo';

const VIAJE_POR_PARADA = 16; // unidades de mundo que avanzan las estrellas entre dos paradas
const DERIVA = 0.12; // avance lento en reposo
const CLAVE_PAUSA = 'viaje-pausa';
const ORDEN: Nivel[] = ['baja', 'media', 'alta'];

interface Salto {
  t0: number;
  T: number;
  u0: number;
  i: number;
  destino: HTMLElement;
  movido: boolean;
  cam0: T.Encuadre;
}

export function montarViaje(canvas: HTMLCanvasElement): void {
  const raiz = document.documentElement;
  const paradas = [...document.querySelectorAll<HTMLElement>('[data-parada]')];
  if (paradas.length < 2) return;
  const acento = T.hexALineal(getComputedStyle(raiz).getPropertyValue('--disco')) ?? [1, 0.42, 0.02];
  // Ayudas de prueba para máquinas sin GPU: `?software` permite el dibujo por software y
  // `?estela=0.9` congela un fotograma de hipervelocidad para poder mirarlo.
  const consulta = new URLSearchParams(location.search);
  const estelaFija = Number(consulta.get('estela')) || 0;
  const motor = crearMotor(canvas, acento, consulta.has('software'));
  if (!motor) return; // sin WebGL2 útil: se queda el respaldo en CSS

  const reducido = matchMedia('(prefers-reduced-motion: reduce)');
  const boton = document.querySelector<HTMLButtonElement>('#pausa');
  let pausa = leerPausa();
  let lista: T.Encuadre[] = [];
  let nudos: number[] = [0, 1];
  let u = 0, vel = 0, estela = 0, destello = 0, luz = 1, reloj = 0, deriva = 0;
  let ultimo: number | null = null;
  let cam: T.Encuadre | null = null;
  let salto: Salto | null = null;
  let seguro = 0;
  let nivel: Nivel = 'media';
  let sucio = true;
  let raf = 0;
  const gob: T.EstadoGobernador = {};

  const fija = () => pausa || reducido.matches;

  function leerPausa(): boolean {
    try {
      return localStorage.getItem(CLAVE_PAUSA) === '1';
    } catch {
      return false;
    }
  }

  function medir() {
    const margen = parseFloat(getComputedStyle(raiz).scrollPaddingTop) || 0;
    const tops = paradas.map((p) => p.getBoundingClientRect().top + scrollY);
    nudos = T.nudosDeScroll(tops, raiz.scrollHeight, innerHeight, margen);
    lista = T.encuadres(paradas.length, innerWidth / innerHeight);
    const n = NIVELES[nivel];
    const { w, h } = T.tamanoInterno(canvas.clientWidth, canvas.clientHeight, devicePixelRatio, n.maxDpr, n.maxPixeles);
    motor!.tamano(w, h);
    motor!.nivel(nivel);
    sucio = true;
  }

  // --- salto de hipervelocidad: solo desde enlaces de sección ---
  function enfocar(destino: HTMLElement) {
    const h = destino.querySelector<HTMLElement>('h1,h2,h3') ?? destino;
    h.setAttribute('tabindex', '-1');
    h.focus({ preventScroll: true });
  }
  function moverScroll(s: Salto) {
    if (s.movido) return;
    s.movido = true;
    s.destino.scrollIntoView({ behavior: 'instant', block: 'start' });
    delete raiz.dataset.salto; // el contenido vuelve a verse (transición en CSS)
    enfocar(s.destino);
  }
  function terminarSalto() {
    if (!salto) return;
    moverScroll(salto);
    salto = null;
    clearTimeout(seguro);
    sucio = true;
  }
  function saltarA(i: number, destino: HTMLElement, hash: string, ahora: number) {
    terminarSalto();
    history.pushState(null, '', hash); // antes de mover el scroll: «atrás» vuelve al punto de partida
    salto = { t0: ahora, T: T.duracionSalto(i - u), u0: u, i, destino, movido: false, cam0: cam ?? T.encuadreEn(lista, u) };
    raiz.dataset.salto = '1';
    // Red de seguridad: aunque el bucle no corra, el salto termina y el contenido se ve.
    seguro = window.setTimeout(terminarSalto, salto.T + 300);
  }

  document.addEventListener('click', (ev) => {
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    if (fija() || motor.perdido || !raf) return; // sin animación, el enlace salta como cualquier ancla
    const a = (ev.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]:not([data-directo])');
    const destino = a && document.getElementById(decodeURIComponent(a.hash.slice(1)));
    if (!a || !destino) return;
    const parada = destino.matches('[data-parada]')
      ? destino
      : (destino.querySelector<HTMLElement>('[data-parada]') ?? destino.closest<HTMLElement>('[data-parada]'));
    const i = parada ? paradas.indexOf(parada) : -1;
    if (i < 0) return;
    ev.preventDefault();
    saltarA(i, destino, a.hash, performance.now());
  });
  // Cualquier gesto corta el salto: manda el visitante.
  for (const tipo of ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const)
    addEventListener(tipo, () => salto && terminarSalto(), { passive: true });

  // --- un paso del bucle ---
  function paso(ahora: number) {
    const dt = ultimo == null ? 1 / 60 : Math.min(0.1, Math.max(0.001, (ahora - ultimo) / 1000));
    ultimo = ahora;
    if (motor!.perdido) return;
    let objetivo = T.posicionDesdeScroll(nudos, scrollY);
    let uNueva: number;
    let env = 0;
    let camSalto: T.Encuadre | null = null;

    if (fija()) {
      uNueva = Math.round(objetivo); // sin movimiento continuo: un fotograma por parada
      if (uNueva === u && !sucio) return;
      vel = estela = destello = 0;
      luz = 1;
    } else {
      if (salto) {
        const s = salto;
        const k = (ahora - s.t0) / s.T;
        if (k >= 0.45) moverScroll(s);
        objetivo = s.movido ? T.posicionDesdeScroll(nudos, scrollY) : s.i;
        const facil = T.easeInOutCubic(T.clamp(k));
        env = T.envolventeSalto(k);
        uNueva = T.mix(s.u0, objetivo, facil);
        camSalto = T.mezclar(s.cam0, T.encuadreEn(lista, objetivo), facil); // recta origen->destino, sin pasar por los intermedios
        if (k >= 1) terminarSalto();
      } else {
        uNueva = T.seguir(u, objetivo, dt);
        if (Math.abs(uNueva - objetivo) < 1e-4) uNueva = objetivo;
      }
      vel = T.seguir(vel, (uNueva - u) / dt, dt, 14);
      estela = T.seguir(estela, Math.max(T.estelaDesdeScroll(vel), 0.9 * env), dt, 10);
      destello = T.limitarDestello(destello, 0.05 * estela * estela, dt);
      // En plena hipervelocidad, o con un scroll muy rápido, el agujero se apaga: solo quedan las estelas.
      luz = T.seguirLuz(luz, 1 - 0.97 * Math.max(env, T.atenuacionPorScroll(vel)), dt);
      reloj += dt;
      deriva += dt * DERIVA;
    }
    if (estelaFija) {
      estela = estelaFija;
      vel = 3;
      luz = 1 - 0.97 * estelaFija;
    }
    u = uNueva;
    sucio = false;
    cam = camSalto ?? T.encuadreEn(lista, u);
    const obturador = 0.03 + 0.22 * estela; // la estela es el recorrido real durante ese tiempo de «exposición»
    const f: Fotograma = {
      ...cam,
      fov: cam.fov * (1 + 0.2 * estela),
      exposure: cam.exposure * luz,
      time: reloj,
      flash: destello,
      travel: u * VIAJE_POR_PARADA + deriva,
      streak: T.clamp(vel * VIAJE_POR_PARADA * obturador, -14, 14) + 0.02,
      gain: 0.8 + 0.2 * luz,
    };
    motor!.dibujar(f);
  }

  const bucle = (ahora: number) => {
    raf = requestAnimationFrame(bucle);
    const antes = ultimo;
    paso(ahora);
    if (antes != null && !fija()) {
      const g = T.gobernador(gob, ahora - antes); // calidad según los fotogramas reales
      const siguiente = ORDEN[ORDEN.indexOf(nivel) + g];
      if (g && siguiente) {
        nivel = siguiente;
        medir();
      }
    }
  };
  const arrancar = () => {
    if (raf || document.hidden) return;
    ultimo = null;
    raf = requestAnimationFrame(bucle);
  };
  const parar = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    terminarSalto();
  };

  function pausar(si: boolean) {
    pausa = si;
    terminarSalto();
    sucio = true;
    boton?.setAttribute('aria-pressed', String(si));
    try {
      localStorage.setItem(CLAVE_PAUSA, si ? '1' : '0');
    } catch {
      /* sin almacenamiento: la pausa vale para esta visita */
    }
  }
  if (boton) {
    boton.hidden = false;
    boton.setAttribute('aria-pressed', String(pausa));
    boton.addEventListener('click', () => pausar(boton.getAttribute('aria-pressed') !== 'true'));
  }

  document.addEventListener('visibilitychange', () => (document.hidden ? parar() : arrancar()));
  reducido.addEventListener('change', () => {
    terminarSalto();
    sucio = true;
  });
  motor.alPerder = () => {
    parar();
    delete raiz.dataset.viaje; // vuelve el respaldo en CSS
  };
  motor.alRestaurar = () => {
    raiz.dataset.viaje = 'vivo';
    medir();
    arrancar();
  };
  let espera = 0;
  addEventListener('resize', () => {
    clearTimeout(espera);
    espera = window.setTimeout(medir, 150);
  });
  // Las fuentes y las imágenes cambian la altura del documento después de montar.
  addEventListener('load', medir);
  document.fonts?.ready.then(medir);

  medir();
  raiz.dataset.viaje = 'vivo';
  arrancar();
}
