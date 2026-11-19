import { montarViaje } from './control';
import { seguirSecciones } from './pagina';

seguirSecciones();
// La escena no compite con el primer pintado: se monta en reposo, con el texto ya en pantalla.
const canvas = document.querySelector<HTMLCanvasElement>('#viaje');
if (canvas) (window.requestIdleCallback ?? ((f: () => void) => setTimeout(f, 1)))(() => montarViaje(canvas), { timeout: 1500 });
