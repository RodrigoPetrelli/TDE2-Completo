import { ErroValidacao } from '../../../shared/domain/erros';
import { textoObrigatorio } from '../../../shared/domain/validacoes';

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Value object: e-mail válido e normalizado (minúsculas, sem espaços). */
export function normalizarEmail(valor: unknown): string {
  if (typeof valor !== 'string' || !FORMATO_EMAIL.test(valor.trim())) {
    throw new ErroValidacao('O campo "email" deve ser um e-mail válido');
  }
  return valor.trim().toLowerCase();
}

export interface DadosCliente {
  id: string;
  nome: string;
  email: string;
  criadoEm: string;
}

export class Cliente {
  private constructor(private readonly dados: DadosCliente) {}

  static criar(p: { id: string; nome: unknown; email: unknown; criadoEm: string }): Cliente {
    return new Cliente({
      id: p.id,
      nome: textoObrigatorio(p.nome, 'nome'),
      email: normalizarEmail(p.email),
      criadoEm: p.criadoEm,
    });
  }

  static restaurar(dados: DadosCliente): Cliente {
    return new Cliente({ ...dados });
  }

  get email(): string {
    return this.dados.email;
  }

  paraDados(): DadosCliente {
    return { ...this.dados };
  }
}
