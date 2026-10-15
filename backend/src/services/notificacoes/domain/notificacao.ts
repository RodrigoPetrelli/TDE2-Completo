export type Destinatario = { tipo: 'RESTAURANTE'; id: string; nome: string } | { tipo: 'CLIENTE'; id: string };

export interface DadosNotificacao {
  id: string;
  pedidoId: string;
  destinatario: Destinatario;
  mensagem: string;
  criadaEm: string;
}

export class Notificacao {
  private constructor(private readonly dados: DadosNotificacao) {}

  static novoPedidoParaRestaurante(p: {
    id: string;
    pedidoId: string;
    restauranteId: string;
    restauranteNome: string;
    totalCentavos: number;
    criadaEm: string;
  }): Notificacao {
    return new Notificacao({
      id: p.id,
      pedidoId: p.pedidoId,
      destinatario: { tipo: 'RESTAURANTE', id: p.restauranteId, nome: p.restauranteNome },
      mensagem: `novo pedido ${p.pedidoId} (total: ${p.totalCentavos} centavos)`,
      criadaEm: p.criadaEm,
    });
  }

  static mudancaDeStatusParaCliente(p: {
    id: string;
    pedidoId: string;
    clienteId: string;
    status: 'CONFIRMADO' | 'CANCELADO';
    criadaEm: string;
  }): Notificacao {
    return new Notificacao({
      id: p.id,
      pedidoId: p.pedidoId,
      destinatario: { tipo: 'CLIENTE', id: p.clienteId },
      mensagem: `seu pedido ${p.pedidoId} foi ${p.status === 'CONFIRMADO' ? 'confirmado' : 'cancelado'}`,
      criadaEm: p.criadaEm,
    });
  }

  descreverDestinatario(): string {
    const d = this.dados.destinatario;
    return d.tipo === 'RESTAURANTE' ? `restaurante "${d.nome}"` : `cliente ${d.id}`;
  }

  get mensagem(): string {
    return this.dados.mensagem;
  }

  paraDados(): DadosNotificacao {
    return { ...this.dados, destinatario: { ...this.dados.destinatario } };
  }
}
