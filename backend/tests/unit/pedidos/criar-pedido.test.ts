import { ErroNaoEncontrado, ErroValidacao } from '../../../src/shared/domain/erros';
import { BarramentoEventosMemoria } from '../../../src/shared/infrastructure/barramento-eventos-memoria';
import { CriarPedido } from '../../../src/services/pedidos/features/criar-pedido/criar-pedido';
import { ProdutoOfertado } from '../../../src/services/pedidos/domain/produto-ofertado';
import {
  CatalogoLocalRepositorioMemoria,
  ClientesLocalRepositorioMemoria,
  PedidoRepositorioMemoria,
} from '../../../src/services/pedidos/infrastructure/repositorios-memoria';

async function montar() {
  const eventos = new BarramentoEventosMemoria();
  const pedidos = new PedidoRepositorioMemoria();
  const catalogo = new CatalogoLocalRepositorioMemoria();
  const clientes = new ClientesLocalRepositorioMemoria();
  await clientes.salvar({ id: 'c1', nome: 'Maria' });
  await catalogo.salvarRestaurante({ id: 'r1', nome: 'Cantina da Nona' });
  await catalogo.salvarProduto(new ProdutoOfertado({ id: 'p1', restauranteId: 'r1', nome: 'Lasanha', precoCentavos: 3500, disponivel: true }));

  let seq = 0;
  const casoDeUso = new CriarPedido({
    eventos,
    pedidos,
    catalogo,
    clientes,
    ids: { gerar: () => `id-${++seq}` },
    relogio: { agoraIso: () => '2026-10-15T12:00:00.000Z' },
  });
  return { casoDeUso, eventos, pedidos };
}

describe('CriarPedido (caso de uso)', () => {
  it('persiste o pedido e publica PedidoCriado com o nome do restaurante', async () => {
    const { casoDeUso, eventos, pedidos } = await montar();

    const pedido = await casoDeUso.executar({ clienteId: 'c1', restauranteId: 'r1', itens: [{ produtoId: 'p1', quantidade: 2 }] });

    expect(await pedidos.obter(pedido.id)).toBeDefined();
    expect(eventos.publicados).toEqual([
      expect.objectContaining({
        tipo: 'pedidos.PedidoCriado',
        dados: expect.objectContaining({ pedidoId: pedido.id, restauranteNome: 'Cantina da Nona', totalCentavos: 7790, quantidadeItens: 2 }),
      }),
    ]);
  });

  it.each([
    [{ restauranteId: 'r1', itens: [{ produtoId: 'p1', quantidade: 1 }] }, 'O campo "clienteId" é obrigatório'],
    [{ clienteId: 'c1', restauranteId: 'r1', itens: [] }, 'O pedido deve ter pelo menos 1 item'],
    [{ clienteId: 'c1', restauranteId: 'r1', itens: [{ produtoId: 'p1', quantidade: 0 }] }, 'A "quantidade" de cada item deve ser um inteiro maior que zero'],
  ])('valida o formato da entrada (%#)', async (entrada, mensagem) => {
    const { casoDeUso } = await montar();
    await expect(casoDeUso.executar(entrada)).rejects.toThrow(new ErroValidacao(mensagem));
  });

  it('retorna não encontrado para cliente ou produto desconhecidos e não publica eventos', async () => {
    const { casoDeUso, eventos } = await montar();
    await expect(casoDeUso.executar({ clienteId: 'x', restauranteId: 'r1', itens: [{ produtoId: 'p1', quantidade: 1 }] })).rejects.toThrow(ErroNaoEncontrado);
    await expect(casoDeUso.executar({ clienteId: 'c1', restauranteId: 'r1', itens: [{ produtoId: 'zz', quantidade: 1 }] })).rejects.toThrow('Produto zz não encontrado');
    expect(eventos.publicados).toEqual([]);
  });
});
