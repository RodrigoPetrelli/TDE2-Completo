import { ProdutoRepositorio, RestauranteRepositorio } from '../application/portas';
import { DadosProduto, Produto } from '../domain/produto';
import { DadosRestaurante, Restaurante } from '../domain/restaurante';

// Adaptadores de persistência locais. Na nuvem: tabelas DynamoDB "catalogo-restaurantes"
// e "catalogo-produtos", exclusivas do serviço de Catálogo.

export class RestauranteRepositorioMemoria implements RestauranteRepositorio {
  private readonly tabela = new Map<string, DadosRestaurante>();

  async salvar(restaurante: Restaurante): Promise<void> {
    const dados = restaurante.paraDados();
    this.tabela.set(dados.id, dados);
  }

  async obter(id: string): Promise<Restaurante | undefined> {
    const dados = this.tabela.get(id);
    return dados && Restaurante.restaurar(dados);
  }

  async listar(): Promise<Restaurante[]> {
    return [...this.tabela.values()].map((d) => Restaurante.restaurar(d));
  }
}

export class ProdutoRepositorioMemoria implements ProdutoRepositorio {
  private readonly tabela = new Map<string, DadosProduto>();

  async salvar(produto: Produto): Promise<void> {
    const dados = produto.paraDados();
    this.tabela.set(dados.id, dados);
  }

  async listarPorRestaurante(restauranteId: string): Promise<Produto[]> {
    return [...this.tabela.values()].filter((d) => d.restauranteId === restauranteId).map((d) => Produto.restaurar(d));
  }
}
