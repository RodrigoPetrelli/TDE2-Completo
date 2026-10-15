import { EventoIntegracao } from '../../shared/contracts/eventos';
import { GeradorIdUuid, RelogioSistema } from '../../shared/infrastructure/plataforma';
import { criarServicoNotificacoes } from './notificacoes.service';

// Entrada Serverless (AWS Lambda) do serviço de Notificações. Disparada por uma
// regra do Amazon EventBridge para os eventos "pedidos.*". Os mesmos casos de uso
// rodam localmente via barramento em memória — só a composition root muda.

export interface EventoEventBridge {
  id: string;
  source: string;
  'detail-type': string;
  time: string;
  detail: EventoIntegracao;
}

// Criado fora do handler para ser reaproveitado entre invocações (warm start).
const servico = criarServicoNotificacoes({ ids: new GeradorIdUuid(), relogio: new RelogioSistema() });

export async function handler(evento: EventoEventBridge): Promise<{ processado: boolean }> {
  return { processado: await servico.processar(evento.detail) };
}
