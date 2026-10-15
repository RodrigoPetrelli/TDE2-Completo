import { ErroNaoEncontrado } from '../../../../shared/domain/erros';
import { RestauranteRepositorio } from '../../application/portas';
import { DadosRestaurante } from '../../domain/restaurante';

export class ObterRestaurante {
  constructor(private readonly deps: { restaurantes: RestauranteRepositorio }) {}

  async executar(id: string): Promise<DadosRestaurante> {
    const restaurante = await this.deps.restaurantes.obter(id);
    if (!restaurante) throw new ErroNaoEncontrado('Restaurante não encontrado');
    return restaurante.paraDados();
  }
}
