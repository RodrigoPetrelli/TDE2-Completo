import { DependenciasPlataforma, novoEvento } from '../../../../shared/application/portas';
import { ErroRegraNegocio } from '../../../../shared/domain/erros';
import { ClienteRepositorio } from '../../application/portas';
import { Cliente, DadosCliente } from '../../domain/cliente';

export interface CadastrarClienteEntrada {
  nome?: unknown;
  email?: unknown;
}

export class CadastrarCliente {
  constructor(private readonly deps: DependenciasPlataforma & { clientes: ClienteRepositorio }) {}

  async executar(entrada: CadastrarClienteEntrada): Promise<DadosCliente> {
    const cliente = Cliente.criar({
      id: this.deps.ids.gerar(),
      nome: entrada.nome,
      email: entrada.email,
      criadoEm: this.deps.relogio.agoraIso(),
    });
    if (await this.deps.clientes.existeComEmail(cliente.email)) {
      throw new ErroRegraNegocio('Já existe um cliente cadastrado com este e-mail');
    }
    await this.deps.clientes.salvar(cliente);

    const dados = cliente.paraDados();
    await this.deps.eventos.publicar(
      novoEvento('clientes.ClienteCadastrado', { clienteId: dados.id, nome: dados.nome, email: dados.email }, this.deps),
    );
    return dados;
  }
}
