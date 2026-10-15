import { ProdutoCadastrado, RestauranteCriado } from '../../../../shared/contracts/eventos';
import { CatalogoLocalRepositorio } from '../../application/portas';
import { ProdutoOfertado } from '../../domain/produto-ofertado';

/** Consumidor de eventos do Catálogo: mantém a réplica local usada ao criar pedidos. */
export class ReplicarCatalogo {
  constructor(private readonly deps: { catalogo: CatalogoLocalRepositorio }) {}

  async aoCriarRestaurante(evento: RestauranteCriado): Promise<void> {
    await this.deps.catalogo.salvarRestaurante({ id: evento.dados.restauranteId, nome: evento.dados.nome });
  }

  async aoCadastrarProduto(evento: ProdutoCadastrado): Promise<void> {
    const { produtoId, restauranteId, nome, precoCentavos, disponivel } = evento.dados;
    await this.deps.catalogo.salvarProduto(
      new ProdutoOfertado({ id: produtoId, restauranteId, nome, precoCentavos, disponivel }),
    );
  }
}
