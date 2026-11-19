// Progreso («Servicios · 2 de 6») y enlace activo del menú. No depende de WebGL.
export function seguirSecciones(): void {
  const secciones = [...document.querySelectorAll<HTMLElement>('main > section[id]')];
  const progreso = document.querySelector<HTMLElement>('#progreso');
  const enlaces = [...document.querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]')];
  if (!secciones.length) return;
  const de = progreso?.dataset.de ?? '/';
  let actual = -1;
  let pendiente = false;

  function actualizar() {
    pendiente = false;
    const raiz = document.documentElement;
    const linea = scrollY + innerHeight * 0.4;
    let i = 0;
    secciones.forEach((s, k) => {
      if (s.getBoundingClientRect().top + scrollY <= linea) i = k;
    });
    if (scrollY + innerHeight >= raiz.scrollHeight - 2) i = secciones.length - 1; // fin de página = última sección
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
