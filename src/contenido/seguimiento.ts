import { contenidos, correoPublico, identidadPublica, negocio } from './index';

interface Requisito {
  id: string;
  titulo: string;
  hecha: boolean;
  tareas: string[];
  pasos: string[];
  comprobacion: string;
  antes?: string;
  enlaces?: { texto: string; url: string }[];
}

export function requisitosDeLanzamiento(dominioConfigurado: boolean) {
  const lenguas = Object.values(contenidos);
  const muestras = lenguas.flatMap((contenido) => contenido.trabajo.muestras);
  const requisitos: Requisito[] = [
    {
      id: 'correo', titulo: 'Confirmar el correo de contacto', hecha: Boolean(correoPublico), tareas: ['DUE-02'],
      pasos: [
        'Indica la dirección exacta que quieres publicar, quién atiende el buzón y con qué proveedor funciona.',
        'Fija cuánto tiempo se guardan las consultas que no terminan en encargo, o el criterio para borrarlas.',
        'Decide si el enlace debe abrir el mensaje con un asunto prellenado. Si lo quieres, indica el asunto en español y en inglés.',
      ],
      comprobacion: 'La dirección confirmada aparece donde corresponde en ambas versiones de la web y el aviso describe el tratamiento de las consultas.',
    },
    {
      id: 'identidad', titulo: 'Confirmar la identidad legal', hecha: Boolean(identidadPublica), tareas: ['DUE-03'],
      pasos: [
        'Indica el nombre legal, la forma jurídica, la dirección publicable en Jersey y si Optimyze es un nombre comercial distinto.',
        'Si es una sociedad, facilita su número mercantil. Confirma también si hay un delegado de protección de datos y quién es.',
        'Decide si quieres una línea de copyright en el pie y quién debe figurar en ella.',
      ],
      comprobacion: 'El pie y el aviso muestran la identidad aprobada en los dos idiomas.',
    },
    {
      id: 'registro', titulo: 'Confirmar el registro de protección de datos', tareas: ['DUE-04'],
      hecha: negocio.registroPrivacidad.confirmado && Boolean(negocio.registroPrivacidad.numero.trim()),
      pasos: [
        'Busca el nombre legal del negocio en el registro público de la autoridad de protección de datos de Jersey (JOIC).',
        'Si ya consta, confirma el número de registro. Si falta el alta o la renovación, consulta el procedimiento oficial y confirma el número cuando esté vigente.',
      ],
      enlaces: [
        { texto: 'Consultar el registro de JOIC', url: 'https://portal.jerseyoic.org/Registrations/RegistrySearch/Index' },
        { texto: 'Alta y renovación', url: 'https://jerseyoic.org/register-renew' },
      ],
      comprobacion: 'El número de registro confirmado figura en el pie de las dos versiones.',
    },
    {
      id: 'privacidad', titulo: 'Aprobar el aviso de privacidad en los dos idiomas', hecha: negocio.avisoPrivacidad.confirmado, tareas: ['DUE-09'],
      antes: 'Confirma primero el correo (DUE-02) y la identidad (DUE-03). Indica también el alcance geográfico de la web en español (DUE-06).',
      pasos: [
        'Envía los borradores a un profesional de protección de datos de Jersey para que revise ambas versiones, incluidas las transferencias relacionadas con el alojamiento y el correo.',
        'Devuelve las correcciones y aprueba el texto final en ambos idiomas y su fecha de actualización.',
      ],
      enlaces: [
        { texto: 'Borrador en español', url: '/es/privacidad/' },
        { texto: 'Borrador en inglés', url: '/privacy/' },
      ],
      comprobacion: 'Los dos avisos publicados incorporan las correcciones y muestran la fecha aprobada.',
    },
    {
      id: 'perfiles', titulo: 'Confirmar los perfiles profesionales que se enlazan', hecha: negocio.perfiles.confirmado, tareas: ['DUE-12'],
      pasos: [
        'Pasa los enlaces exactos de los perfiles profesionales activos que quieres mostrar, o confirma que no se enlaza ninguno.',
        'Decide si se muestra teléfono o WhatsApp. Si eliges alguno, indica el número que se puede publicar y quién lo atiende.',
      ],
      comprobacion: 'Los perfiles aprobados aparecen en la vista previa y cada enlace lleva al perfil indicado.',
    },
    {
      id: 'permiso', titulo: 'Confirmar los permisos de las muestras o retirarlas', tareas: ['DUE-07'],
      hecha: muestras.every((muestra) => muestra.aprobada),
      pasos: [
        'Para cada muestra que quieras conservar, confirma por escrito el permiso para publicar el nombre y la pieza exacta. Indica la fecha, el alcance y quién tiene los derechos de las imágenes.',
        'Si falta un permiso, decide si publicamos solo la muestra autorizada, retiramos la sección o esperamos.',
      ],
      comprobacion: 'Cada muestra visible coincide con su permiso o se retira de la vista previa según lo acordado.',
    },
    {
      id: 'imagen', titulo: 'Incorporar imágenes autorizadas a las muestras que se mantengan', tareas: ['DUE-07'],
      hecha: muestras.every((muestra) => Boolean(muestra.imagen)),
      antes: 'Resuelve el permiso de cada muestra que se vaya a publicar (DUE-07).',
      pasos: [
        'Entrega el archivo exacto autorizado de cada muestra que se mantenga. Si se publica una captura de la muestra B, usa datos ficticios.',
        'Si cambia la pieza respecto a la que describe el texto actual, aprueba también la nueva descripción.',
      ],
      comprobacion: 'Todas las muestras visibles cargan la imagen autorizada y cuentan con texto alternativo en ambos idiomas.',
    },
    {
      id: 'texto', titulo: 'Aprobar los textos de los dos idiomas', tareas: ['DUE-06', 'DUE-18'],
      hecha: lenguas.every((contenido) => contenido.meta.revisado),
      pasos: [
        'En DUE-06, confirma el idioma que abre la web, quién revisa el inglés británico y si la versión en español se dirige a clientes fuera de Jersey.',
        'En DUE-18, pide al revisor que marque qué aprueba y qué corrige del inglés. Revisa también el menú, los controles y la página de error en ambos idiomas, junto con títulos, descripciones y textos alternativos.',
      ],
      enlaces: [
        { texto: 'Vista previa en español', url: '/es/' },
        { texto: 'Vista previa en inglés', url: '/' },
        { texto: 'Página de error', url: '/pagina-inexistente/' },
      ],
      comprobacion: 'Las correcciones están aplicadas y los textos de las dos versiones tienen visto bueno.',
    },
    {
      id: 'dominio', titulo: 'Definir el dominio de producción', hecha: dominioConfigurado, tareas: ['DUE-05'],
      pasos: [
        'Indica el dominio exacto, dónde está registrado, quién administra sus DNS y si tiene correo en uso.',
        'Elige si la web abrirá en el dominio raíz o en www. Si el correo ya funciona, revisa sus registros con el agente antes de cambiar DNS.',
        'Cuando se autorice el lanzamiento, conecta el dominio a Cloudflare Pages y verifica que abre por HTTPS. Si se movieron los DNS, prueba el envío y la recepción de correo.',
      ],
      enlaces: [{ texto: 'Guía de dominios de Cloudflare Pages', url: 'https://developers.cloudflare.com/pages/configuration/custom-domains/' }],
      comprobacion: 'El dominio acordado queda configurado en la web. La conexión DNS y el correo se comprueban al lanzar.',
    },
  ];
  return requisitos.sort((a, b) => Number(a.hecha) - Number(b.hecha));
}
