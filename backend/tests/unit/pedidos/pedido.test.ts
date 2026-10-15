import { ErroRegraNegocio, ErroValidacao } from '../../../src/shared/domain/erros';
import { Pedido, TAXA_ENTREGA_CENTAVOS } from '../../../src/services/pedidos/domain/pedido';
import { ProdutoOfertado } from '../../../src/services/pedidos/domain/produto-ofertado';

const AGORA = '2026-10-15T12:00:00.000Z';

function produto(dados: Partial<ProdutoOfertado['dados']> = {}): ProdutoOfertado {
  return new ProdutoOfertado({ id: 'p1', restauranteId: 'r1', nome: 'Lasanha', precoCentavos: 3500, disponivel: true, ...dados });
}

function novoPedido(): Pedido {
  return Pedido.criar({ id: 'x', clienteId: 'c1', restauranteId: 'r1', linhas: [{ produto: produto(), quantidade: 2 }], agora: AGORA });
}

describe('Pedido (agregado)', () => {
  it('calcula subtotal, taxa de entrega e total', () => {
    const dados = novoPedido().paraDados();
    expect(dados.subtotalCentavos).toBe(7000);
    expect(dados.taxaEntregaCentavos).toBe(TAXA_ENTREGA_CENTAVOS);
    expect(dados.totalCentavos).toBe(7000 + 790);
    expect(dados.status).toBe('CRIADO');
  });

  it('exige pelo menos 1 item', () => {
    expect(() => Pedido.criar({ id: 'x', clienteId: 'c', restauranteId: 'r1', linhas: [], agora: AGORA })).toThrow(ErroValidacao);
  });

  it('rejeita produto de outro restaurante', () => {
    expect(() =>
      Pedido.criar({ id: 'x', clienteId: 'c', restauranteId: 'r1', linhas: [{ produto: produto({ restauranteId: 'r2' }), quantidade: 1 }], agora: AGORA }),
    ).toThrow(new ErroRegraNegocio('O produto "Lasanha" não pertence ao restaurante informado'));
  });

  it('rejeita produto indisponível', () => {
    expect(() =>
      Pedido.criar({ id: 'x', clienteId: 'c', restauranteId: 'r1', linhas: [{ produto: produto({ disponivel: false }), quantidade: 1 }], agora: AGORA }),
    ).toThrow(ErroRegraNegocio);
  });

  it('segue a máquina de estados CRIADO -> CONFIRMADO -> CANCELADO', () => {
    const pedido = novoPedido();
    pedido.confirmar(AGORA);
    expect(pedido.status).toBe('CONFIRMADO');
    expect(() => pedido.confirmar(AGORA)).toThrow(ErroRegraNegocio);
    pedido.cancelar(AGORA);
    expect(pedido.status).toBe('CANCELADO');
    expect(() => pedido.cancelar(AGORA)).toThrow('Não é possível cancelar um pedido com status CANCELADO');
  });

  it('paraDados devolve cópia (o agregado não vaza estado mutável)', () => {
    const pedido = novoPedido();
    pedido.paraDados().itens[0].quantidade = 99;
    expect(pedido.paraDados().itens[0].quantidade).toBe(2);
  });
});
