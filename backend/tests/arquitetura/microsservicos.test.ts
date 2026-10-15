import { ehCompositionRoot, modulos, servicoDe, violacoes, violacoesExternas } from './grafo-dependencias';

// Microsserviços + Database per Service + EDA + BFF + API Gateway + Serverless.

describe('Microsserviços e Database per Service', () => {
  it('um microsserviço não importa código de outro microsserviço', () => {
    const servicos = modulos((a) => servicoDe(a) !== undefined);
    expect(
      violacoes(servicos, (destino, origem) => servicoDe(destino) !== undefined && servicoDe(destino) !== servicoDe(origem)),
    ).toEqual([]);
  });

  it('a única dependência compartilhada é o shared kernel (erros, portas, contratos de eventos, adaptadores genéricos)', () => {
    const servicos = modulos((a) => servicoDe(a) !== undefined);
    expect(
      violacoes(servicos, (destino) => servicoDe(destino) === undefined && !destino.startsWith('shared/')),
    ).toEqual([]);
  });

  it('o shared kernel não conhece serviços, BFFs nem o gateway', () => {
    const shared = modulos((a) => a.startsWith('shared/'));
    expect(violacoes(shared, (destino) => !destino.startsWith('shared/'))).toEqual([]);
  });

  it('o banco (infrastructure) de cada serviço só é instanciado pela composition root do próprio serviço', () => {
    const todos = modulos(() => true);
    expect(
      violacoes(
        todos,
        (destino, origem) =>
          /^services\/[^/]+\/infrastructure\//.test(destino) &&
          !(ehCompositionRoot(origem) && servicoDe(origem) === servicoDe(destino)) &&
          !(servicoDe(origem) === servicoDe(destino) && origem.includes('/infrastructure/')),
      ),
    ).toEqual([]);
  });
});

describe('Arquitetura Orientada a Eventos', () => {
  it('serviços só se comunicam pelos contratos de eventos (shared/contracts)', () => {
    const consumidores = modulos((a) => /^services\/(pedidos|notificacoes)\/features\//.test(a));
    const usamContratos = consumidores.some((m) => m.internos.includes('shared/contracts/eventos.ts'));
    expect(usamContratos).toBe(true);
  });
});

describe('Backend for Frontend', () => {
  it('BFFs não importam código de microsserviços (falam com eles só via HTTP/gateway)', () => {
    const bffs = modulos((a) => a.startsWith('bff/'));
    expect(violacoes(bffs, (destino) => !destino.startsWith('bff/'))).toEqual([]);
  });

  it('um BFF não importa outro BFF (apenas a pasta compartilhado)', () => {
    const bffs = modulos((a) => /^bff\/(web|mobile)\//.test(a));
    expect(
      violacoes(bffs, (destino, origem) => destino.split('/')[1] !== origem.split('/')[1] && !destino.startsWith('bff/compartilhado/')),
    ).toEqual([]);
  });
});

describe('API Gateway', () => {
  it('o gateway não conhece serviços nem BFFs (recebe as rotas por injeção)', () => {
    const gateway = modulos((a) => a.startsWith('gateway/'));
    expect(violacoes(gateway, (destino) => !destino.startsWith('gateway/') && !destino.startsWith('shared/http/'))).toEqual([]);
  });
});

describe('Serverless', () => {
  it('o handler Lambda de Notificações não depende de Express', () => {
    const lambda = modulos((a) => a === 'services/notificacoes/lambda.ts');
    expect(violacoesExternas(lambda, ['express'])).toEqual([]);
  });

  it('o serviço de Notificações não tem API HTTP (é acionado só por eventos)', () => {
    const notificacoes = modulos((a) => servicoDe(a) === 'notificacoes');
    expect(violacoesExternas(notificacoes, ['express'])).toEqual([]);
    expect(notificacoes.filter((m) => m.arquivo.endsWith('.http.ts'))).toEqual([]);
  });
});
