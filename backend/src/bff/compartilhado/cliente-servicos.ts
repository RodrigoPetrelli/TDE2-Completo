// Cliente HTTP usado pelos BFFs para falar com os microsserviços através do
// API Gateway. Os BFFs nunca importam código dos serviços: só conhecem o contrato HTTP.

export class ErroServico extends Error {
  constructor(
    readonly status: number,
    readonly corpo: unknown,
  ) {
    super(`Serviço respondeu ${status}`);
  }
}

export class ClienteServicos {
  constructor(private readonly urlBase: () => string) {}

  async obter<T>(caminho: string, requestId?: string): Promise<T> {
    const resposta = await fetch(`${this.urlBase()}${caminho}`, {
      headers: requestId ? { 'x-request-id': requestId } : {},
    });
    const corpo: unknown = await resposta.json();
    if (!resposta.ok) throw new ErroServico(resposta.status, corpo);
    return corpo as T;
  }
}

export function formatarReais(centavos: number): string {
  return `R$ ${(centavos / 100).toFixed(2).replace('.', ',')}`;
}
