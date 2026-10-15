import { randomUUID } from 'crypto';
import { GeradorId, Relogio } from '../application/portas';

export class RelogioSistema implements Relogio {
  agoraIso(): string {
    return new Date().toISOString();
  }
}

export class GeradorIdUuid implements GeradorId {
  gerar(): string {
    return randomUUID();
  }
}
