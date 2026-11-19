import { describe, expect, it } from 'vitest';
import { contenidos, secciones } from './index';

const { en, es } = contenidos;

describe('contenido', () => {
  it('los dos idiomas tienen las mismas listas', () => {
    expect(en.servicios.pilares).toHaveLength(es.servicios.pilares.length);
    expect(en.trabajo.muestras).toHaveLength(es.trabajo.muestras.length);
    expect(en.preguntas.lista).toHaveLength(es.preguntas.lista.length);
    expect(secciones(en)).toHaveLength(secciones(es).length);
  });
  it('las anclas no se repiten dentro de un idioma', () => {
    for (const c of [en, es]) {
      const anclas = [...secciones(c).map((s) => s.ancla), ...c.servicios.pilares.map((p) => p.ancla)];
      expect(new Set(anclas).size).toBe(anclas.length);
    }
  });
  it('el visitante puede localizar fotografía, vídeo, SEO y redes: van resaltados en los pilares', () => {
    const resaltados = (c: typeof es) => c.servicios.pilares.flatMap((p) => p.ayuda.match(/<strong>.*?<\/strong>/g) ?? []);
    expect(resaltados(es)).toHaveLength(4);
    expect(resaltados(en)).toHaveLength(4);
  });
  it('sin muestras, «Nuestro trabajo» sale del menú', () => {
    const sin = { ...es, trabajo: { ...es.trabajo, muestras: [] } };
    expect(secciones(sin)).toHaveLength(secciones(es).length - 1);
  });
});
