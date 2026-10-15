import { EventoIntegracao, TipoEvento } from '../contracts/eventos';
import { BarramentoEventos, ManipuladorEvento } from '../application/portas';

// Implementação local do barramento. Em produção é substituída por um adaptador
// do Amazon EventBridge, sem mudar nenhum caso de uso.
export class BarramentoEventosMemoria implements BarramentoEventos {
  private readonly manipuladores = new Map<TipoEvento, ((evento: EventoIntegracao) => Promise<void>)[]>();
  readonly publicados: EventoIntegracao[] = [];

  assinar<T extends TipoEvento>(tipo: T, manipulador: ManipuladorEvento<T>): void {
    const lista = this.manipuladores.get(tipo) ?? [];
    lista.push(manipulador as (evento: EventoIntegracao) => Promise<void>);
    this.manipuladores.set(tipo, lista);
  }

  async publicar(evento: EventoIntegracao): Promise<void> {
    this.publicados.push(evento);
    for (const manipulador of this.manipuladores.get(evento.tipo) ?? []) {
      // Falha de um consumidor não afeta o produtor (semântica de barramento assíncrono).
      try {
        await manipulador(evento);
      } catch (erro) {
        console.error(`[EVENTOS] Falha ao processar ${evento.tipo} (${evento.id})`, erro);
      }
    }
  }
}
