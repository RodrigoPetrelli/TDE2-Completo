import { GeradorId, Relogio } from '../../../../shared/application/portas';
import { PedidoCancelado, PedidoConfirmado } from '../../../../shared/contracts/eventos';
import { HistoricoNotificacoes, Notificador } from '../../application/portas';
import { Notificacao } from '../../domain/notificacao';

/** Consumidor de PedidoConfirmado / PedidoCancelado: avisa o cliente. */
export class NotificarStatusPedido {
  constructor(
    private readonly deps: { ids: GeradorId; relogio: Relogio; notificador: Notificador; historico: HistoricoNotificacoes },
  ) {}

  async executar(evento: PedidoConfirmado | PedidoCancelado): Promise<void> {
    const notificacao = Notificacao.mudancaDeStatusParaCliente({
      id: this.deps.ids.gerar(),
      pedidoId: evento.dados.pedidoId,
      clienteId: evento.dados.clienteId,
      status: evento.tipo === 'pedidos.PedidoConfirmado' ? 'CONFIRMADO' : 'CANCELADO',
      criadaEm: this.deps.relogio.agoraIso(),
    });
    await this.deps.notificador.enviar(notificacao);
    await this.deps.historico.registrar(notificacao);
  }
}
