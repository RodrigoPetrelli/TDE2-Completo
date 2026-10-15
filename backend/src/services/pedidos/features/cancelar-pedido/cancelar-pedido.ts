import { DependenciasPlataforma, novoEvento } from '../../../../shared/application/portas';
import { ErroNaoEncontrado } from '../../../../shared/domain/erros';
import { PedidoRepositorio } from '../../application/portas';
import { DadosPedido } from '../../domain/pedido';

export class CancelarPedido {
  constructor(private readonly deps: DependenciasPlataforma & { pedidos: PedidoRepositorio }) {}

  async executar(id: string): Promise<DadosPedido> {
    const pedido = await this.deps.pedidos.obter(id);
    if (!pedido) throw new ErroNaoEncontrado('Pedido não encontrado');

    pedido.cancelar(this.deps.relogio.agoraIso());
    await this.deps.pedidos.salvar(pedido);

    const dados = pedido.paraDados();
    await this.deps.eventos.publicar(
      novoEvento(
        'pedidos.PedidoCancelado',
        { pedidoId: dados.id, clienteId: dados.clienteId, restauranteId: dados.restauranteId },
        this.deps,
      ),
    );
    return dados;
  }
}
