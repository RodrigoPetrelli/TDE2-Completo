import { ErroNaoEncontrado } from '../../../../shared/domain/erros';
import { ProdutoRepositorio, RestauranteRepositorio } from '../../application/portas';
import { DadosProduto } from '../../domain/produto';

export class ListarCardapio {
  constructor(private readonly deps: { restaurantes: RestauranteRepositorio; produtos: ProdutoRepositorio }) {}

  async executar(restauranteId: string): Promise<DadosProduto[]> {
    const restaurante = await this.deps.restaurantes.obter(restauranteId);
    if (!restaurante) throw new ErroNaoEncontrado('Restaurante não encontrado');

    const produtos = await this.deps.produtos.listarPorRestaurante(restaurante.id);
    return produtos.map((p) => p.paraDados());
  }
}
