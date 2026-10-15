import { ClienteCadastrado } from '../../../../shared/contracts/eventos';
import { ClientesLocalRepositorio } from '../../application/portas';

/** Consumidor de eventos de Clientes: mantém a réplica local de clientes. */
export class ReplicarClientes {
  constructor(private readonly deps: { clientes: ClientesLocalRepositorio }) {}

  async aoCadastrarCliente(evento: ClienteCadastrado): Promise<void> {
    await this.deps.clientes.salvar({ id: evento.dados.clienteId, nome: evento.dados.nome });
  }
}
