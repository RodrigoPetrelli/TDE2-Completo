// Portas (interfaces) de aplicação compartilhadas. As implementações ficam em
// shared/infrastructure e são injetadas pelas composition roots.

import { EventoDoTipo, EventoIntegracao, TipoEvento } from '../contracts/eventos';

export interface Relogio {
  agoraIso(): string;
}

export interface GeradorId {
  gerar(): string;
}

export type ManipuladorEvento<T extends TipoEvento> = (evento: EventoDoTipo<T>) => Promise<void>;

/** Barramento de eventos (EDA). Local: em memória. Nuvem: Amazon EventBridge. */
export interface BarramentoEventos {
  publicar(evento: EventoIntegracao): Promise<void>;
  assinar<T extends TipoEvento>(tipo: T, manipulador: ManipuladorEvento<T>): void;
}

/** Dependências de plataforma que toda composition root de serviço recebe. */
export interface DependenciasPlataforma {
  eventos: BarramentoEventos;
  ids: GeradorId;
  relogio: Relogio;
}

export function novoEvento<T extends TipoEvento>(
  tipo: T,
  dados: EventoDoTipo<T>['dados'],
  ctx: { ids: GeradorId; relogio: Relogio },
): EventoDoTipo<T> {
  return { id: ctx.ids.gerar(), tipo, ocorridoEm: ctx.relogio.agoraIso(), dados } as EventoDoTipo<T>;
}
