// Erros de domínio compartilhados (shared kernel). Não conhecem HTTP: a tradução
// para status code acontece no adaptador HTTP (shared/http/tratador-erros.ts).

export type TipoErroDominio = 'VALIDACAO' | 'NAO_ENCONTRADO' | 'REGRA_NEGOCIO';

export abstract class ErroDominio extends Error {
  abstract readonly tipo: TipoErroDominio;

  constructor(mensagem: string) {
    super(mensagem);
    this.name = new.target.name;
  }
}

/** Entrada com formato inválido (HTTP 400). */
export class ErroValidacao extends ErroDominio {
  readonly tipo = 'VALIDACAO' as const;
}

/** Recurso inexistente (HTTP 404). */
export class ErroNaoEncontrado extends ErroDominio {
  readonly tipo = 'NAO_ENCONTRADO' as const;
}

/** Violação de regra de negócio (HTTP 422). */
export class ErroRegraNegocio extends ErroDominio {
  readonly tipo = 'REGRA_NEGOCIO' as const;
}
