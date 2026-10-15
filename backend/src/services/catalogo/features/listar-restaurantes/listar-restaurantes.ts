import { RestauranteRepositorio } from '../../application/portas';
import { DadosRestaurante } from '../../domain/restaurante';

export class ListarRestaurantes {
  constructor(private readonly deps: { restaurantes: RestauranteRepositorio }) {}

  async executar(): Promise<DadosRestaurante[]> {
    const restaurantes = await this.deps.restaurantes.listar();
    return restaurantes.map((r) => r.paraDados());
  }
}
