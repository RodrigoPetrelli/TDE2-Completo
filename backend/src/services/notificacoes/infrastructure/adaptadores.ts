import { HistoricoNotificacoes, Notificador } from '../application/portas';
import { DadosNotificacao, Notificacao } from '../domain/notificacao';

export class NotificadorConsole implements Notificador {
  async enviar(notificacao: Notificacao): Promise<void> {
    console.log(`[NOTIFICACAO] Notificação enviada ao ${notificacao.descreverDestinatario()}: ${notificacao.mensagem}`);
  }
}

// Na nuvem: tabela DynamoDB "notificacoes", exclusiva do serviço de Notificações.
export class HistoricoNotificacoesMemoria implements HistoricoNotificacoes {
  private readonly tabela: DadosNotificacao[] = [];

  async registrar(notificacao: Notificacao): Promise<void> {
    this.tabela.push(notificacao.paraDados());
  }

  async listarPorPedido(pedidoId: string): Promise<Notificacao[]> {
    // Reidrata via fábrica do domínio a partir dos dados persistidos
    return this.tabela
      .filter((d) => d.pedidoId === pedidoId)
      .map((d) =>
        d.destinatario.tipo === 'RESTAURANTE'
          ? Notificacao.novoPedidoParaRestaurante({
              id: d.id,
              pedidoId: d.pedidoId,
              restauranteId: d.destinatario.id,
              restauranteNome: d.destinatario.nome,
              totalCentavos: 0,
              criadaEm: d.criadaEm,
            })
          : Notificacao.mudancaDeStatusParaCliente({
              id: d.id,
              pedidoId: d.pedidoId,
              clienteId: d.destinatario.id,
              status: d.mensagem.endsWith('confirmado') ? 'CONFIRMADO' : 'CANCELADO',
              criadaEm: d.criadaEm,
            }),
      );
  }
}
