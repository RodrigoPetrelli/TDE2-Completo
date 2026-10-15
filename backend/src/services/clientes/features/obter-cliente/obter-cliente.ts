import { ErroNaoEncontrado } from '../../../../shared/domain/erros';
import { ClienteRepositorio } from '../../application/portas';
import { DadosCliente } from '../../domain/cliente';

export class ObterCliente {
  constructor(private readonly deps: { clientes: ClienteRepositorio }) {}

  async executar(id: string): Promise<DadosCliente> {
    const cliente = await this.deps.clientes.obter(id);
    if (!cliente) throw new ErroNaoEncontrado('Cliente não encontrado');
    return cliente.paraDados();
  }
}
