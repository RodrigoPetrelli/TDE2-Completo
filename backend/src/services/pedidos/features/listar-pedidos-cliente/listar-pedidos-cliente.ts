import { ErroNaoEncontrado } from '../../../../shared/domain/erros';
import { ClientesLocalRepositorio, PedidoRepositorio } from '../../application/portas';
import { DadosPedido } from '../../domain/pedido';

export class ListarPedidosCliente {
  constructor(private readonly deps: { pedidos: PedidoRepositorio; clientes: ClientesLocalRepositorio }) {}

  async executar(clienteId: string): Promise<DadosPedido[]> {
    if (!(await this.deps.clientes.existe(clienteId))) {
      throw new ErroNaoEncontrado('Cliente não encontrado');
    }
    const pedidos = await this.deps.pedidos.listarPorCliente(clienteId);
    return pedidos.map((p) => p.paraDados());
  }
}
