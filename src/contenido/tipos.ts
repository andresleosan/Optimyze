// Forma del contenido. Un archivo por idioma (`es.ts`, `en.ts`) la cumple con `satisfies Contenido`:
// si a un idioma le falta o le sobra una clave, `pnpm check` falla.
// Secciones, pilares, muestras y preguntas son listas: de ellas salen el menú y las paradas del viaje.

export type Idioma = 'en' | 'es';

/** Texto con énfasis permitido (`<strong>`). Es contenido propio, no entrada de usuarios. */
export type Html = string;

export interface Pilar {
  ancla: string;
  nombre: string;
  pregunta: string;
  ayuda: Html;
}

export interface Muestra {
  titulo: string;
  texto: string;
  /** Texto alternativo de la imagen, cuando exista. */
  alt: string;
  /** Ruta de la imagen en `public/`, o null mientras no haya pieza autorizada. */
  imagen: string | null;
  /** false = pendiente de permiso del cliente: la compilación estricta falla. */
  aprobada: boolean;
}

export interface Pregunta {
  pregunta: string;
  respuesta: string;
}

export interface Contenido {
  /** revisado = false mientras el dueño no apruebe el texto de este idioma: la compilación estricta falla. */
  meta: { titulo: string; descripcion: string; imagenSocialAlt: string; revisado: boolean };
  ui: {
    saltar: string;
    marcaVolver: string;
    menu: string;
    secciones: string;
    /** «de» en «Servicios · 2 de 6». */
    de: string;
    pausar: string;
    otroIdioma: string;
    pendienteImagen: string;
    correoPendiente: string;
    identidadPendiente: string;
    registroPendiente: string;
    etiquetaRegistro: string;
    perfilesPendientes: string;
    noEncontrada: string;
    volverInicio: string;
  };
  inicio: {
    ancla: string;
    menu: string;
    titular: string;
    texto: string;
    accionPrincipal: string;
    accionContacto: string;
  };
  servicios: {
    ancla: string;
    menu: string;
    titulo: string;
    pilares: Pilar[];
    conexion: { ancla: string; titulo: string; texto: string; nota: string };
    apoyo: { rotulo: string; titulo: string; texto: string };
  };
  trabajo: { ancla: string; menu: string; titulo: string; muestras: Muestra[] };
  equipo: { ancla: string; menu: string; titulo: string; texto: string };
  preguntas: { ancla: string; menu: string; titulo: string; lista: Pregunta[] };
  aviso: {
    titulo: string;
    descripcion: string;
    borrador: string;
    responsable: string;
    correoPendiente: string;
    representantePendiente: string;
    fecha: string;
    idiomaAlterno: string;
    queja: string;
    secciones: { titulo: string; parrafos: string[] }[];
  };
  contacto: {
    ancla: string;
    menu: string;
    titulo: string;
    texto: string;
    accion: string;
  };
}
