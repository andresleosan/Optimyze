import { en } from './en';
import { es } from './es';
import type { Contenido, Idioma } from './tipos';

export const contenidos: Record<Idioma, Contenido> = { en, es };

/** Etiqueta `lang` del HTML, código hreflang y ruta de la portada de cada idioma. */
export const idiomas: Record<Idioma, { html: string; hreflang: string; ruta: string }> = {
  en: { html: 'en-GB', hreflang: 'en', ruta: '/' },
  es: { html: 'es', hreflang: 'es', ruta: '/es/' },
};

/**
 * Datos del negocio que solo puede confirmar el dueño. Mientras `confirmado` sea false,
 * `pnpm check:release --strict` falla y la web no puede ir a producción.
 */
export const negocio = {
  nombre: 'Optimyze',
  correo: { direccion: 'hola@example.com', confirmado: false },
};

/** Secciones de primer nivel, en orden. De aquí salen el menú y el contador «2 de 6». */
export function secciones(c: Contenido) {
  const lista = [c.inicio, c.servicios, c.trabajo, c.equipo, c.preguntas, c.contacto];
  // Sin ninguna muestra, la sección «Nuestro trabajo» y su enlace no se muestran.
  return lista.filter((s) => s !== c.trabajo || c.trabajo.muestras.length > 0);
}
