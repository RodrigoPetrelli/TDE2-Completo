import { ErroRegraNegocio } from '../../../shared/domain/erros';

export interface DadosProdutoOfertado {
  id: string;
  restauranteId: string;
  nome: string;
  precoCentavos: number;
  disponivel: boolean;
}

/**
 * Visão do produto no contexto de Pedidos (réplica local alimentada por eventos do
 * Catálogo). Carrega as regras que decidem se o produto pode entrar em um pedido.
 */
export class ProdutoOfertado {
  constructor(readonly dados: DadosProdutoOfertado) {}

  garantirPodeSerPedidoEm(restauranteId: string): void {
    if (this.dados.restauranteId !== restauranteId) {
      throw new ErroRegraNegocio(`O produto "${this.dados.nome}" não pertence ao restaurante informado`);
    }
    if (!this.dados.disponivel) {
      throw new ErroRegraNegocio(`O produto "${this.dados.nome}" não está disponível`);
    }
  }
}
