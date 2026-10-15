import { handler } from '../../src/services/notificacoes/lambda';

describe('Notificações (Lambda / EventBridge)', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it('notifica o restaurante ao receber PedidoCriado', async () => {
    const resultado = await handler({
      id: 'evb-1',
      source: 'pedeja.pedidos',
      'detail-type': 'pedidos.PedidoCriado',
      time: '2026-10-15T12:00:00Z',
      detail: {
        id: 'e1',
        tipo: 'pedidos.PedidoCriado',
        ocorridoEm: '2026-10-15T12:00:00Z',
        dados: { pedidoId: 'p1', clienteId: 'c1', restauranteId: 'r1', restauranteNome: 'Cantina', quantidadeItens: 2, totalCentavos: 7790 },
      },
    });

    expect(resultado).toEqual({ processado: true });
    expect(console.log).toHaveBeenCalledWith('[NOTIFICACAO] Notificação enviada ao restaurante "Cantina": novo pedido p1 (total: 7790 centavos)');
  });

  it('ignora eventos que não são de pedidos', async () => {
    const resultado = await handler({
      id: 'evb-2',
      source: 'pedeja.clientes',
      'detail-type': 'clientes.ClienteCadastrado',
      time: '2026-10-15T12:00:00Z',
      detail: { id: 'e2', tipo: 'clientes.ClienteCadastrado', ocorridoEm: '2026-10-15T12:00:00Z', dados: { clienteId: 'c', nome: 'M', email: 'm@x.com' } },
    });
    expect(resultado).toEqual({ processado: false });
    expect(console.log).not.toHaveBeenCalled();
  });
});
