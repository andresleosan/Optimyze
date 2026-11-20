import type { Contenido } from './tipos';

// Texto de trabajo en español: literal del documento de contenido de la primera versión.
export const es = {
  meta: {
    titulo: 'Optimyze · Marketing, contenido y webs para negocios en Jersey',
    descripcion:
      'Creamos contenido, diseñamos webs y planificamos campañas para negocios en Jersey: marca, visibilidad, fotografía y vídeo, y conversión.',
    imagenSocialAlt: 'Un disco ámbar rodea un agujero negro en un campo de estrellas.',
    revisado: true,
  },
  ui: {
    saltar: 'Saltar al contenido',
    marcaVolver: 'Optimyze, volver al inicio',
    menu: 'Secciones',
    secciones: 'Secciones de la página',
    de: 'de',
    pausar: 'Pausar animación',
    otroIdioma: 'English',
    pendienteImagen: 'Imagen pendiente de autorización',
    correoProvisional: 'Dirección provisional',
    noEncontrada: 'Esta página no existe.',
    volverInicio: 'Volver al inicio',
  },
  inicio: {
    ancla: 'inicio',
    menu: 'Inicio',
    titular: 'Marketing para que tus clientes te encuentren, entiendan lo que ofreces y se pongan en contacto.',
    texto:
      'En Optimyze creamos contenido, diseñamos webs y planificamos campañas para negocios en Jersey. Podemos ayudarte con algo tan concreto como fotografiar un servicio o trabajar contigo desde la primera búsqueda en Google hasta la reserva.',
    accionPrincipal: 'Ver nuestros servicios',
    accionContacto: 'Contacto',
  },
  servicios: {
    ancla: 'servicios',
    menu: 'Servicios',
    titulo: 'Cuatro pilares para que el marketing de tu empresa funcione',
    pilares: [
      {
        ancla: 'marca',
        nombre: 'Marca y oferta',
        pregunta: '¿Se entiende por qué deberían elegirte?',
        ayuda:
          'Definimos a quién te diriges, qué hace valioso tu servicio y cómo explicarlo. Diseñamos identidad visual, redactamos textos para la web y anuncios, y preparamos folletos y materiales comerciales.',
      },
      {
        ancla: 'visibilidad',
        nombre: 'Visibilidad y captación',
        pregunta: '¿Te encuentran las personas que necesitan lo que haces?',
        ayuda:
          'Trabajamos el posicionamiento en buscadores (<strong>SEO</strong>), el SEO local y el Perfil de Empresa en Google. Planificamos y gestionamos <strong>redes sociales</strong>, calendarios de publicaciones y campañas de pago en Google y redes como Instagram o Facebook. Elegimos los canales según el público y el presupuesto.',
      },
      {
        ancla: 'contenido',
        nombre: 'Contenido y confianza',
        pregunta: '¿Puede alguien ver la calidad de tu trabajo antes de comprarte?',
        ayuda:
          'Creamos y editamos <strong>fotografía</strong> comercial, <strong>vídeos</strong>, reels y piezas para anuncios. Preparamos el guion, contamos la historia y adaptamos el material a la web, las redes o la campaña. Una foto puede mostrar el acabado de un trabajo y un vídeo puede explicar una decisión que el cliente suele preguntar.',
      },
      {
        ancla: 'conversion',
        nombre: 'Conversión y fidelización',
        pregunta: 'Cuando alguien se interesa, ¿le resulta fácil consultar, comprar y volver?',
        ayuda:
          'Diseñamos webs y páginas de campaña con una acción clara. Revisamos el camino hasta la llamada, la reserva o la compra. Podemos preparar seguimiento comercial y campañas de email para clientes que quieran recibirlas. Acordamos qué resultado medir y usamos esa información para ajustar la siguiente campaña.',
      },
    ],
    conexion: {
      titulo: 'Así se conectan',
      texto:
        'Una cafetería quiere conseguir encargos de desayunos para oficinas. Primero aclara qué incluye cada pedido y en qué zona entrega. Después lo hace visible en búsquedas locales y redes. Una foto enseña la ración real y un vídeo muestra cómo llega el desayuno. Una página indica cómo encargarlo. Al cierre de la campaña, los pedidos confirmados y las oficinas que vuelven a comprar ayudan a decidir si merece la pena repetirla.',
      nota: 'Ejemplo ilustrativo.',
    },
    apoyo: {
      rotulo: 'Apoyo técnico',
      titulo: 'Cuando tu marketing necesita mejores sistemas',
      texto:
        'Si las consultas llegan, pero tu equipo pierde tiempo buscando mensajes o copiando datos, podemos conectar la web con la agenda o con un sistema de seguimiento de clientes (CRM), automatizar una tarea o desarrollar una aplicación a medida. Al diseñar la solución, revisamos qué información hace falta, quién puede acceder a ella y dónde se guarda.',
    },
  },
  trabajo: {
    ancla: 'trabajo',
    menu: 'Nuestro trabajo',
    titulo: 'Nuestro trabajo',
    // Muestras A y B: sin nombre de cliente ni imagen hasta que haya permiso confirmado.
    muestras: [
      {
        titulo: 'Fotografía y diseño inmobiliario',
        texto:
          'Preparamos fotografías para anuncios y diseñamos folletos de escaparate. Las imágenes y los datos de la propiedad comparten una pieza que la agencia puede imprimir y mostrar a pie de calle.',
        alt: '',
        imagen: null,
        aprobada: false,
      },
      {
        titulo: 'Software para la gestión de clases',
        texto:
          'Desarrollamos una aplicación de gestión de clases. Una vista del calendario permite explicar cómo el equipo organiza clases y configura sus plazas. Es una muestra del apoyo técnico que podemos sumar a un proyecto.',
        alt: '',
        imagen: null,
        aprobada: false,
      },
    ],
  },
  equipo: {
    ancla: 'equipo',
    menu: 'Quiénes somos',
    titulo: 'Quiénes somos',
    texto:
      'Somos Optimyze, un equipo en Jersey que reúne marketing, diseño y producción audiovisual. Colaboramos con especialistas en software cuando el proyecto necesita una web, una integración o una herramienta propia. Empezamos por entender qué quieres conseguir y qué materiales tienes. Después te proponemos qué producir, dónde utilizarlo y cómo valorar el resultado.',
  },
  preguntas: {
    ancla: 'preguntas',
    menu: 'Preguntas frecuentes',
    titulo: 'Preguntas frecuentes',
    lista: [
      {
        pregunta: '¿Qué servicios puedo contratar por separado?',
        respuesta:
          'Puedes empezar con una sesión de fotos, la edición de un vídeo, un folleto, una revisión de SEO local, la gestión de redes o una campaña. Si varias piezas tienen el mismo objetivo, podemos prepararlas como un solo proyecto.',
      },
      {
        pregunta: '¿Podéis trabajar con las fotos, los vídeos o la web que ya tengo?',
        respuesta:
          'Sí. Revisamos el material contigo y vemos qué se puede editar, reutilizar o mejorar. También podemos producir lo que falte.',
      },
      {
        pregunta: '¿Por dónde empiezo si tengo un presupuesto limitado?',
        respuesta:
          'Depende de dónde está la dificultad. Si casi nadie te descubre, revisamos visibilidad. Si ya recibes visitas pero pocas consultas, empezamos por la oferta, las pruebas de tu trabajo y la facilidad de contacto.',
      },
      {
        pregunta: '¿Cómo sabré si el marketing está funcionando?',
        respuesta:
          'Antes de empezar, acordamos qué acción tiene valor para tu negocio y qué ocurre hoy. Para una cafetería pueden ser encargos confirmados. Para una agencia inmobiliaria, solicitudes de visita que su equipo pueda atender. Revisamos esos resultados junto con el coste y los canales que los generaron, cuando se pueda identificar su origen.',
      },
      {
        pregunta: '¿También podéis ayudarme con sistemas o privacidad?',
        respuesta:
          'Sí. Podemos revisar los pasos que sigue una consulta, conectar las herramientas que utiliza tu equipo y acordar cómo se gestionan los accesos y el almacenamiento de la información.',
      },
      {
        pregunta: '¿Cómo pido información y cuánto cuesta?',
        respuesta:
          'Escríbenos por correo. Basta con decirnos qué te gustaría mejorar. Te explicaremos qué opciones encajan y, cuando sepamos qué trabajo incluye, podremos enviarte alcance y precio.',
      },
    ],
  },
  contacto: {
    ancla: 'contacto',
    menu: 'Contacto',
    titulo: '¿Quieres hablar de tu negocio?',
    texto: 'Escríbenos. Puedes empezar con una idea, una duda o un ejemplo de algo que te gustaría mejorar.',
    accion: 'Escríbenos por correo',
  },
} satisfies Contenido;
