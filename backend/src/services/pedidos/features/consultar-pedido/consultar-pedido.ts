import { ErroNaoEncontrado } from '../../../../shared/domain/erros';
import { PedidoRepositorio } from '../../application/portas';
import { DadosPedido } from '../../domain/pedido';

export class ConsultarPedido {
  constructor(private readonly deps: { pedidos: PedidoRepositorio }) {}

  async executar(id: string): Promise<DadosPedido> {
    const pedido = await this.deps.pedidos.obter(id);
    if (!pedido) throw new ErroNaoEncontrado('Pedido não encontrado');
    return pedido.paraDados();
  }
}
