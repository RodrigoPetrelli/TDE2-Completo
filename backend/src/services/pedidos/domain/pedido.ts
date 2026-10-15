import { ErroRegraNegocio, ErroValidacao } from '../../../shared/domain/erros';
import { inteiroPositivo } from '../../../shared/domain/validacoes';
import { ProdutoOfertado } from './produto-ofertado';

export type StatusPedido = 'CRIADO' | 'CONFIRMADO' | 'CANCELADO';

export const TAXA_ENTREGA_CENTAVOS = 790; // R$ 7,90

export interface ItemPedido {
  produtoId: string;
  nome: string;
  quantidade: number;
  precoUnitarioCentavos: number;
  subtotalCentavos: number;
}

export interface DadosPedido {
  id: string;
  clienteId: string;
  restauranteId: string;
  itens: ItemPedido[];
  subtotalCentavos: number;
  taxaEntregaCentavos: number;
  totalCentavos: number;
  status: StatusPedido;
  criadoEm: string;
  atualizadoEm: string;
}

export interface LinhaPedido {
  produto: ProdutoOfertado;
  quantidade: number;
}

/** Agregado raiz do contexto de Pedidos: calcula totais e controla a máquina de estados. */
export class Pedido {
  private constructor(private dados: DadosPedido) {}

  static criar(p: { id: string; clienteId: string; restauranteId: string; linhas: LinhaPedido[]; agora: string }): Pedido {
    if (p.linhas.length === 0) {
      throw new ErroValidacao('O pedido deve ter pelo menos 1 item');
    }

    const itens = p.linhas.map(({ produto, quantidade }): ItemPedido => {
      produto.garantirPodeSerPedidoEm(p.restauranteId);
      inteiroPositivo(quantidade, 'A "quantidade" de cada item deve ser um inteiro maior que zero');
      return {
        produtoId: produto.dados.id,
        nome: produto.dados.nome,
        quantidade,
        precoUnitarioCentavos: produto.dados.precoCentavos,
        subtotalCentavos: produto.dados.precoCentavos * quantidade,
      };
    });
    const subtotalCentavos = itens.reduce((soma, item) => soma + item.subtotalCentavos, 0);

    return new Pedido({
      id: p.id,
      clienteId: p.clienteId,
      restauranteId: p.restauranteId,
      itens,
      subtotalCentavos,
      taxaEntregaCentavos: TAXA_ENTREGA_CENTAVOS,
      totalCentavos: subtotalCentavos + TAXA_ENTREGA_CENTAVOS,
      status: 'CRIADO',
      criadoEm: p.agora,
      atualizadoEm: p.agora,
    });
  }

  static restaurar(dados: DadosPedido): Pedido {
    return new Pedido(structuredClone(dados));
  }

  get id(): string {
    return this.dados.id;
  }

  get status(): StatusPedido {
    return this.dados.status;
  }

  /** CRIADO -> CONFIRMADO */
  confirmar(agora: string): void {
    if (this.dados.status !== 'CRIADO') {
      throw new ErroRegraNegocio(`Não é possível confirmar um pedido com status ${this.dados.status}`);
    }
    this.mudarStatus('CONFIRMADO', agora);
  }

  /** CRIADO | CONFIRMADO -> CANCELADO */
  cancelar(agora: string): void {
    if (this.dados.status !== 'CRIADO' && this.dados.status !== 'CONFIRMADO') {
      throw new ErroRegraNegocio(`Não é possível cancelar um pedido com status ${this.dados.status}`);
    }
    this.mudarStatus('CANCELADO', agora);
  }

  paraDados(): DadosPedido {
    return structuredClone(this.dados);
  }

  private mudarStatus(status: StatusPedido, agora: string): void {
    this.dados = { ...this.dados, status, atualizadoEm: agora };
  }
}
