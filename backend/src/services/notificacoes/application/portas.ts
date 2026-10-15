import { Notificacao } from '../domain/notificacao';

/** Canal de entrega (local: console; nuvem: Amazon SNS / e-mail / push). */
export interface Notificador {
  enviar(notificacao: Notificacao): Promise<void>;
}

/** Banco do serviço de Notificações (Database per Service). */
export interface HistoricoNotificacoes {
  registrar(notificacao: Notificacao): Promise<void>;
  listarPorPedido(pedidoId: string): Promise<Notificacao[]>;
}
