import {
  CatalogoLocalRepositorio,
  ClienteLocal,
  ClientesLocalRepositorio,
  PedidoRepositorio,
  RestauranteLocal,
} from '../application/portas';
import { DadosPedido, Pedido } from '../domain/pedido';
import { DadosProdutoOfertado, ProdutoOfertado } from '../domain/produto-ofertado';

// Na nuvem: tabelas DynamoDB "pedidos" (GSI por clienteId) e "pedidos-replicas",
// exclusivas do serviço de Pedidos.

export class PedidoRepositorioMemoria implements PedidoRepositorio {
  private readonly tabela = new Map<string, DadosPedido>();

  async salvar(pedido: Pedido): Promise<void> {
    const dados = pedido.paraDados();
    this.tabela.set(dados.id, dados);
  }

  async obter(id: string): Promise<Pedido | undefined> {
    const dados = this.tabela.get(id);
    return dados && Pedido.restaurar(dados);
  }

  async listarPorCliente(clienteId: string): Promise<Pedido[]> {
    return [...this.tabela.values()].filter((d) => d.clienteId === clienteId).map((d) => Pedido.restaurar(d));
  }
}

export class CatalogoLocalRepositorioMemoria implements CatalogoLocalRepositorio {
  private readonly restaurantes = new Map<string, RestauranteLocal>();
  private readonly produtos = new Map<string, DadosProdutoOfertado>();

  async salvarRestaurante(restaurante: RestauranteLocal): Promise<void> {
    this.restaurantes.set(restaurante.id, { ...restaurante });
  }

  async obterRestaurante(id: string): Promise<RestauranteLocal | undefined> {
    const restaurante = this.restaurantes.get(id);
    return restaurante && { ...restaurante };
  }

  async salvarProduto(produto: ProdutoOfertado): Promise<void> {
    this.produtos.set(produto.dados.id, { ...produto.dados });
  }

  async obterProduto(id: string): Promise<ProdutoOfertado | undefined> {
    const dados = this.produtos.get(id);
    return dados && new ProdutoOfertado({ ...dados });
  }
}

export class ClientesLocalRepositorioMemoria implements ClientesLocalRepositorio {
  private readonly clientes = new Map<string, ClienteLocal>();

  async salvar(cliente: ClienteLocal): Promise<void> {
    this.clientes.set(cliente.id, { ...cliente });
  }

  async existe(id: string): Promise<boolean> {
    return this.clientes.has(id);
  }
}
