import { GeradorId, Relogio } from '../../../../shared/application/portas';
import { PedidoCriado } from '../../../../shared/contracts/eventos';
import { HistoricoNotificacoes, Notificador } from '../../application/portas';
import { Notificacao } from '../../domain/notificacao';

/** Consumidor de PedidoCriado: avisa o restaurante sobre o novo pedido. */
export class NotificarNovoPedido {
  constructor(
    private readonly deps: { ids: GeradorId; relogio: Relogio; notificador: Notificador; historico: HistoricoNotificacoes },
  ) {}

  async executar(evento: PedidoCriado): Promise<void> {
    const notificacao = Notificacao.novoPedidoParaRestaurante({
      id: this.deps.ids.gerar(),
      pedidoId: evento.dados.pedidoId,
      restauranteId: evento.dados.restauranteId,
      restauranteNome: evento.dados.restauranteNome,
      totalCentavos: evento.dados.totalCentavos,
      criadaEm: this.deps.relogio.agoraIso(),
    });
    await this.deps.notificador.enviar(notificacao);
    await this.deps.historico.registrar(notificacao);
  }
}
