import fs from 'fs';
import path from 'path';
import { fatiaDe, modulos, RAIZ_SRC, servicoDe, violacoes } from './grafo-dependencias';

// Vertical Slice: cada funcionalidade vive em services/<servico>/features/<fatia>/
// com seu caso de uso e seu adaptador de entrada, sem depender de outras fatias.

describe('Vertical Slice', () => {
  it('uma fatia não importa código de outra fatia', () => {
    const fatias = modulos((a) => fatiaDe(a) !== undefined);
    expect(
      violacoes(fatias, (destino, origem) => fatiaDe(destino) !== undefined && fatiaDe(destino) !== fatiaDe(origem)),
    ).toEqual([]);
  });

  it('domain e application não dependem de nenhuma fatia', () => {
    const nucleo = modulos((a) => /^services\/[^/]+\/(domain|application)\//.test(a));
    expect(violacoes(nucleo, (destino) => fatiaDe(destino) !== undefined)).toEqual([]);
  });

  it('toda fatia tem um caso de uso com o mesmo nome da pasta', () => {
    const servicos = fs.readdirSync(path.join(RAIZ_SRC, 'services'));
    const semCasoDeUso = servicos.flatMap((servico) => {
      const dirFeatures = path.join(RAIZ_SRC, 'services', servico, 'features');
      return fs
        .readdirSync(dirFeatures)
        .filter((fatia) => !fs.existsSync(path.join(dirFeatures, fatia, `${fatia}.ts`)))
        .map((fatia) => `${servico}/${fatia}`);
    });
    expect(semCasoDeUso).toEqual([]);
  });

  it('arquivos de uma fatia ficam todos na pasta da fatia (sem subpastas por camada técnica)', () => {
    const fatias = modulos((a) => fatiaDe(a) !== undefined);
    const aninhados = fatias.filter((m) => m.arquivo.split('/').length !== 5).map((m) => m.arquivo);
    expect(aninhados).toEqual([]);
  });

  it('fatias com entrada HTTP pertencem a serviços expostos pelo gateway', () => {
    const adaptadores = modulos((a) => a.endsWith('.http.ts'));
    const servicos = new Set(adaptadores.map((m) => servicoDe(m.arquivo)));
    expect([...servicos].sort()).toEqual(['catalogo', 'clientes', 'pedidos']);
  });
});
