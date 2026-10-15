import { camada, ehAdaptadorHttp, fatiaDe, modulos, violacoes, violacoesExternas } from './grafo-dependencias';

// Regra da dependência (Clean Architecture): as dependências apontam sempre para
// dentro — infrastructure/adaptadores -> features (casos de uso) -> application (portas) -> domain.

const FRAMEWORKS = ['express', 'supertest', 'crypto', 'fs', 'path', 'http'];

describe('Clean Architecture', () => {
  it('domain não depende de nenhuma outra camada (só de outros arquivos de domain)', () => {
    const dominio = modulos((a) => camada(a) === 'domain');
    expect(violacoes(dominio, (destino) => camada(destino) !== 'domain')).toEqual([]);
  });

  it('domain não importa frameworks nem APIs de infraestrutura do Node', () => {
    const dominio = modulos((a) => camada(a) === 'domain');
    expect(violacoesExternas(dominio, FRAMEWORKS)).toEqual([]);
  });

  it('application (portas) depende apenas de domain e de contratos', () => {
    const aplicacao = modulos((a) => camada(a) === 'application');
    expect(
      violacoes(aplicacao, (destino) => !['domain', 'application', 'contracts'].includes(camada(destino) ?? '')),
    ).toEqual([]);
  });

  it('casos de uso não dependem de infrastructure', () => {
    const casosDeUso = modulos((a) => fatiaDe(a) !== undefined && !ehAdaptadorHttp(a));
    expect(violacoes(casosDeUso, (destino) => camada(destino) === 'infrastructure')).toEqual([]);
  });

  it('casos de uso não conhecem HTTP (express ou shared/http)', () => {
    const casosDeUso = modulos((a) => fatiaDe(a) !== undefined && !ehAdaptadorHttp(a));
    expect(violacoesExternas(casosDeUso, FRAMEWORKS)).toEqual([]);
    expect(violacoes(casosDeUso, (destino) => destino.startsWith('shared/http/'))).toEqual([]);
  });

  it('adaptadores HTTP só delegam ao caso de uso da própria fatia (não acessam repositórios nem domínio)', () => {
    const adaptadores = modulos(ehAdaptadorHttp);
    expect(
      violacoes(
        adaptadores,
        (destino, origem) =>
          !(destino.startsWith('shared/http/') || (fatiaDe(destino) === fatiaDe(origem) && !ehAdaptadorHttp(destino))),
      ),
    ).toEqual([]);
  });

  it('infrastructure não é importada por ninguém além das composition roots', () => {
    const naoComposicao = modulos((a) => /\/(domain|application|features|infrastructure)\//.test(a) || a.startsWith('bff/') || a.startsWith('gateway/'));
    expect(
      violacoes(naoComposicao, (destino, origem) => camada(destino) === 'infrastructure' && camada(origem) !== 'infrastructure'),
    ).toEqual([]);
  });
});
