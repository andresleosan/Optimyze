// Progreso («Servicios · 2 de 6») y enlace activo del menú. No depende de WebGL.
export function seguirSecciones(): void {
  const secciones = [...document.querySelectorAll<HTMLElement>('main > section[id]')];
  const progreso = document.querySelector<HTMLElement>('#progreso');
  const enlaces = [...document.querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]')];
  if (!secciones.length) return;
  const de = progreso?.dataset.de ?? '/';
  let actual = -1;
  let pendiente = false;

  const idioma = document.querySelector<HTMLAnchorElement>('#idioma');
  const portada = idioma?.getAttribute('href') ?? '';

  function indice() {
    const raiz = document.documentElement;
    const linea = scrollY + innerHeight * 0.4;
    let i = 0;
    secciones.forEach((s, k) => {
      if (s.getBoundingClientRect().top + scrollY <= linea) i = k;
    });
    if (scrollY + innerHeight >= raiz.scrollHeight - 2) i = secciones.length - 1; // fin de página = última sección
    return i;
  }

  // El conmutador lleva a la sección equivalente; sin ella (Inicio) o sin JavaScript, a la portada.
  function enlazarIdioma(i: number) {
    const otra = secciones[i]!.dataset.otra;
    idioma?.setAttribute('href', otra ? `${portada}#${otra}` : portada);
  }
  // Se recalcula al pulsar: el scroll de un enlace directo puede llegar después del último avance.
  idioma?.addEventListener('click', () => enlazarIdioma(indice()));

  function actualizar() {
    pendiente = false;
    const i = indice();
    enlazarIdioma(i);
    if (i === actual) return;
    actual = i;
    const s = secciones[i]!;
    if (progreso) progreso.textContent = `${s.dataset.nombre} · ${i + 1} ${de} ${secciones.length}`;
    for (const a of enlaces) {
      if (a.hash === `#${s.id}`) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    }
  }
  addEventListener(
    'scroll',
    () => {
      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(actualizar);
      }
    },
    { passive: true },
  );
  addEventListener('resize', actualizar);
  actualizar();
}
