import { BarramentoEventos, GeradorId, Relogio } from '../../shared/application/portas';
import { EventoIntegracao } from '../../shared/contracts/eventos';
import { NotificarNovoPedido } from './features/notificar-novo-pedido/notificar-novo-pedido';
import { NotificarStatusPedido } from './features/notificar-status-pedido/notificar-status-pedido';
import { HistoricoNotificacoesMemoria, NotificadorConsole } from './infrastructure/adaptadores';

export interface ServicoNotificacoes {
  /** Despacha um evento ao consumidor correspondente. Retorna false se o evento não interessa a este serviço. */
  processar(evento: EventoIntegracao): Promise<boolean>;
  /** Execução local: assina os eventos no barramento em memória. */
  assinarEm(barramento: BarramentoEventos): void;
}

/** Composition root do serviço de Notificações (sem API HTTP: só consome eventos). */
export function criarServicoNotificacoes(plataforma: { ids: GeradorId; relogio: Relogio }): ServicoNotificacoes {
  const deps = { ...plataforma, notificador: new NotificadorConsole(), historico: new HistoricoNotificacoesMemoria() };
  const novoPedido = new NotificarNovoPedido(deps);
  const statusPedido = new NotificarStatusPedido(deps);

  return {
    async processar(evento) {
      switch (evento.tipo) {
        case 'pedidos.PedidoCriado':
          await novoPedido.executar(evento);
          return true;
        case 'pedidos.PedidoConfirmado':
        case 'pedidos.PedidoCancelado':
          await statusPedido.executar(evento);
          return true;
        default:
          return false;
      }
    },
    assinarEm(barramento) {
      barramento.assinar('pedidos.PedidoCriado', (e) => novoPedido.executar(e));
      barramento.assinar('pedidos.PedidoConfirmado', (e) => statusPedido.executar(e));
      barramento.assinar('pedidos.PedidoCancelado', (e) => statusPedido.executar(e));
    },
  };
}
