import { ClienteRepositorio } from '../application/portas';
import { Cliente, DadosCliente } from '../domain/cliente';

// Na nuvem: tabela DynamoDB "clientes" (GSI por e-mail), exclusiva do serviço de Clientes.
export class ClienteRepositorioMemoria implements ClienteRepositorio {
  private readonly tabela = new Map<string, DadosCliente>();

  async salvar(cliente: Cliente): Promise<void> {
    const dados = cliente.paraDados();
    this.tabela.set(dados.id, dados);
  }

  async obter(id: string): Promise<Cliente | undefined> {
    const dados = this.tabela.get(id);
    return dados && Cliente.restaurar(dados);
  }

  async existeComEmail(email: string): Promise<boolean> {
    return [...this.tabela.values()].some((d) => d.email === email);
  }
}
