import { DependenciasPlataforma, novoEvento } from '../../../../shared/application/portas';
import { ErroNaoEncontrado } from '../../../../shared/domain/erros';
import { ProdutoRepositorio, RestauranteRepositorio } from '../../application/portas';
import { DadosProduto, Produto } from '../../domain/produto';

export interface CadastrarProdutoEntrada {
  restauranteId: string;
  nome?: unknown;
  precoCentavos?: unknown;
  disponivel?: unknown;
}

export class CadastrarProduto {
  constructor(
    private readonly deps: DependenciasPlataforma & {
      restaurantes: RestauranteRepositorio;
      produtos: ProdutoRepositorio;
    },
  ) {}

  async executar(entrada: CadastrarProdutoEntrada): Promise<DadosProduto> {
    const restaurante = await this.deps.restaurantes.obter(entrada.restauranteId);
    if (!restaurante) throw new ErroNaoEncontrado('Restaurante não encontrado');

    const produto = Produto.criar({
      id: this.deps.ids.gerar(),
      restauranteId: restaurante.id,
      nome: entrada.nome,
      precoCentavos: entrada.precoCentavos,
      disponivel: entrada.disponivel,
      criadoEm: this.deps.relogio.agoraIso(),
    });
    await this.deps.produtos.salvar(produto);

    const dados = produto.paraDados();
    await this.deps.eventos.publicar(
      novoEvento(
        'catalogo.ProdutoCadastrado',
        {
          produtoId: dados.id,
          restauranteId: dados.restauranteId,
          nome: dados.nome,
          precoCentavos: dados.precoCentavos,
          disponivel: dados.disponivel,
        },
        this.deps,
      ),
    );
    return dados;
  }
}
