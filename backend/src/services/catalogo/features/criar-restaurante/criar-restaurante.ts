import { DependenciasPlataforma, novoEvento } from '../../../../shared/application/portas';
import { RestauranteRepositorio } from '../../application/portas';
import { DadosRestaurante, Restaurante } from '../../domain/restaurante';

export interface CriarRestauranteEntrada {
  nome?: unknown;
  categoria?: unknown;
}

export class CriarRestaurante {
  constructor(private readonly deps: DependenciasPlataforma & { restaurantes: RestauranteRepositorio }) {}

  async executar(entrada: CriarRestauranteEntrada): Promise<DadosRestaurante> {
    const restaurante = Restaurante.criar({
      id: this.deps.ids.gerar(),
      nome: entrada.nome,
      categoria: entrada.categoria,
      criadoEm: this.deps.relogio.agoraIso(),
    });
    await this.deps.restaurantes.salvar(restaurante);

    const dados = restaurante.paraDados();
    await this.deps.eventos.publicar(
      novoEvento(
        'catalogo.RestauranteCriado',
        { restauranteId: dados.id, nome: dados.nome, categoria: dados.categoria },
        this.deps,
      ),
    );
    return dados;
  }
}
