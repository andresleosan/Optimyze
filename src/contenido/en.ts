import type { Contenido } from './tipos';

// Adaptación a inglés británico del texto de trabajo en español.
// BORRADOR: pendiente de revisión del dueño antes de producción.
export const en = {
  meta: {
    titulo: 'Optimyze · Marketing, content and websites for businesses in Jersey',
    descripcion:
      'We create content, design websites and plan campaigns for businesses in Jersey: brand, visibility, photography and video, and conversion.',
    imagenSocialAlt: 'An amber disc surrounds a black hole in a field of stars.',
    revisado: false,
  },
  ui: {
    saltar: 'Skip to content',
    marcaVolver: 'Optimyze, back to the start',
    menu: 'Sections',
    secciones: 'Page sections',
    de: 'of',
    pausar: 'Pause animation',
    otroIdioma: 'Español',
    pendienteImagen: 'Image awaiting authorisation',
    correoPendiente: 'Contact email pending confirmation.',
    identidadPendiente: 'Legal identity pending confirmation.',
    registroPendiente: 'Data protection registration pending confirmation.',
    etiquetaRegistro: 'Data protection registration',
    perfilesPendientes: 'Professional profiles pending confirmation.',
    noEncontrada: "This page doesn't exist.",
    volverInicio: 'Back to the start',
  },
  inicio: {
    ancla: 'start',
    menu: 'Start',
    titular: 'Marketing that helps your customers find you, understand what you offer and get in touch.',
    texto:
      'At Optimyze we create content, design websites and plan campaigns for businesses in Jersey. We can help with something as specific as photographing a service, or work with you from the first Google search through to the booking.',
    accionPrincipal: 'See our services',
    accionContacto: 'Contact',
  },
  servicios: {
    ancla: 'services',
    menu: 'Services',
    titulo: "Four pillars that make your company's marketing work",
    pilares: [
      {
        ancla: 'brand',
        nombre: 'Brand and offer',
        pregunta: 'Is it clear why people should choose you?',
        ayuda:
          'We define who you are talking to, what makes your service valuable and how to explain it. We design visual identity, write copy for the website and adverts, and prepare brochures and sales materials.',
      },
      {
        ancla: 'visibility',
        nombre: 'Visibility and lead generation',
        pregunta: 'Can the people who need what you do find you?',
        ayuda:
          'We work on search engine optimisation (<strong>SEO</strong>), local SEO and your Google Business Profile. We plan and manage <strong>social media</strong>, posting calendars and paid campaigns on Google and on networks such as Instagram or Facebook. We choose the channels to suit the audience and the budget.',
      },
      {
        ancla: 'content',
        nombre: 'Content and trust',
        pregunta: 'Can someone see the quality of your work before they buy from you?',
        ayuda:
          'We create and edit commercial <strong>photography</strong>, <strong>video</strong>, reels and pieces for adverts. We prepare the script, tell the story and adapt the material to the website, social media or the campaign. A photo can show the finish of a job, and a video can explain a decision customers often ask about.',
      },
      {
        ancla: 'conversion',
        nombre: 'Conversion and loyalty',
        pregunta: 'When someone is interested, is it easy for them to enquire, buy and come back?',
        ayuda:
          'We design websites and campaign pages with one clear action. We review the path to the call, the booking or the purchase. We can set up sales follow-up and email campaigns for customers who want to receive them. We agree which result to measure and use that information to adjust the next campaign.',
      },
    ],
    conexion: {
      ancla: 'how-they-connect',
      titulo: 'How they connect',
      texto:
        'A café wants to win breakfast orders for offices. First it makes clear what each order includes and which area it delivers to. Then it makes that visible in local searches and on social media. A photo shows the real portion and a video shows how the breakfast arrives. A page explains how to order. When the campaign ends, the confirmed orders and the offices that buy again help decide whether it is worth repeating.',
      nota: 'Illustrative example.',
    },
    apoyo: {
      rotulo: 'Technical support',
      titulo: 'When your marketing needs better systems',
      texto:
        'If enquiries are coming in but your team loses time searching for messages or copying data, we can connect the website to your diary or to a customer relationship management (CRM) system, automate a task or build a bespoke application. When we design the solution, we look at what information is needed, who can access it and where it is stored.',
    },
  },
  trabajo: {
    ancla: 'work',
    menu: 'Our work',
    titulo: 'Our work',
    muestras: [
      {
        titulo: 'Property photography and design',
        texto:
          'We prepare photographs for listings and design window-display brochures. The images and the property details share a single piece the agency can print and show at street level.',
        alt: '',
        imagen: null,
        aprobada: false,
      },
      {
        titulo: 'Software for managing classes',
        texto:
          'We built a class-management application. A calendar view shows how the team organises classes and sets the places available. It is an example of the technical support we can add to a project.',
        alt: '',
        imagen: null,
        aprobada: false,
      },
    ],
  },
  equipo: {
    ancla: 'about',
    menu: 'About us',
    titulo: 'About us',
    texto:
      'We are Optimyze, a team in Jersey bringing together marketing, design and audiovisual production. We work with software specialists when a project needs a website, an integration or a tool of its own. We start by understanding what you want to achieve and what materials you already have. Then we propose what to produce, where to use it and how to judge the result.',
  },
  preguntas: {
    ancla: 'faq',
    menu: 'FAQs',
    titulo: 'Frequently asked questions',
    lista: [
      {
        pregunta: 'Which services can I buy separately?',
        respuesta:
          'You can start with a photo shoot, a video edit, a brochure, a local SEO review, social media management or a campaign. If several pieces share the same goal, we can prepare them as a single project.',
      },
      {
        pregunta: 'Can you work with the photos, videos or website I already have?',
        respuesta:
          'Yes. We go through the material with you and see what can be edited, reused or improved. We can also produce whatever is missing.',
      },
      {
        pregunta: 'Where do I start if my budget is limited?',
        respuesta:
          'It depends on where the difficulty lies. If hardly anyone discovers you, we look at visibility. If you already get visits but few enquiries, we start with the offer, the evidence of your work and how easy it is to get in touch.',
      },
      {
        pregunta: 'How will I know whether the marketing is working?',
        respuesta:
          'Before we start, we agree which action has value for your business and what happens today. For a café it might be confirmed orders. For an estate agency, viewing requests its team can handle. We review those results alongside the cost and the channels that generated them, where their source can be identified.',
      },
      {
        pregunta: 'Can you also help me with systems or privacy?',
        respuesta:
          'Yes. We can review the steps an enquiry goes through, connect the tools your team uses and agree how access and information storage are managed.',
      },
      {
        pregunta: 'How do I ask for information, and how much does it cost?',
        respuesta:
          'Email us. Just tell us what you would like to improve. We will explain which options fit and, once we know what the work involves, we can send you a scope and a price.',
      },
    ],
  },
  aviso: {
    titulo: 'Privacy notice',
    descripcion: 'How Optimyze handles information when you visit this website or send an enquiry.',
    borrador: 'Draft pending review by Optimyze and a Jersey data protection professional.',
    responsable: 'Who is responsible for your data',
    correoPendiente: 'The contact address for privacy requests is pending confirmation.',
    representantePendiente: 'The legal identity of the controller and contact details for any representative or data protection officer are pending confirmation.',
    fecha: 'Draft updated on',
    idiomaAlterno: 'Español',
    queja: 'Raise a concern with the Jersey Office of the Information Commissioner',
    secciones: [
      {
        titulo: 'Visiting this website',
        parrafos: [
          'Cloudflare Pages serves this site. Cloudflare may process technical data such as your IP address to deliver pages and protect the service. The applicable lawful basis and the details of any security logs are pending confirmation.',
        ],
      },
      {
        titulo: 'Sending an enquiry',
        parrafos: [
          'Sending an enquiry is voluntary. If you email us, your provider sends your message. We use the address and the information you include to answer your enquiry. We need a valid return address to reply. Include only the details needed to understand your request.',
          'The lawful basis for handling enquiries is pending confirmation. Possible bases for review include steps you request before entering a contract and a legitimate interest in answering general enquiries.',
        ],
      },
      {
        titulo: 'What your browser remembers',
        parrafos: [
          'The pause button saves your motion preference in your browser on this device. The site uses it only to remember whether you paused the animation. You can remove the preference by clearing this site’s data in your browser.',
        ],
      },
      {
        titulo: 'Who receives data and how long it is kept',
        parrafos: [
          'Cloudflare provides the hosting. The email provider and any other recipients are pending confirmation, together with any transfers outside Jersey, the protection in place and how to ask for more detail. The retention periods or criteria for enquiry messages and any logs are also pending confirmation.',
        ],
      },
      {
        titulo: 'Your rights',
        parrafos: [
          'Where the law applies, you can ask to see, correct or erase your data, restrict or object to its use, or ask us to transfer it. If we rely on consent, you can withdraw it. Use the contact details above to make a request. You can also complain to the Jersey Office of the Information Commissioner.',
        ],
      },
      {
        titulo: 'Automated decisions',
        parrafos: [
          'The website displays information and uses your motion preference to adjust the animation. The arrangements for handling and securing enquiries are pending confirmation.',
        ],
      },
      {
        titulo: 'Changes to this notice',
        parrafos: [
          'We will publish revisions on this page and update the date.',
        ],
      },
    ],
  },
  contacto: {
    ancla: 'contact',
    menu: 'Contact',
    titulo: 'Would you like to talk about your business?',
    texto: 'Write to us. You can start with an idea, a question or an example of something you would like to improve.',
    accion: 'Email us',
  },
} satisfies Contenido;
