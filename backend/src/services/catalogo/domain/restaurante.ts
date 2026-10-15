import { textoObrigatorio } from '../../../shared/domain/validacoes';

export interface DadosRestaurante {
  id: string;
  nome: string;
  categoria: string;
  criadoEm: string;
}

export class Restaurante {
  private constructor(private readonly dados: DadosRestaurante) {}

  static criar(p: { id: string; nome: unknown; categoria: unknown; criadoEm: string }): Restaurante {
    return new Restaurante({
      id: p.id,
      nome: textoObrigatorio(p.nome, 'nome'),
      categoria: textoObrigatorio(p.categoria, 'categoria'),
      criadoEm: p.criadoEm,
    });
  }

  static restaurar(dados: DadosRestaurante): Restaurante {
    return new Restaurante({ ...dados });
  }

  get id(): string {
    return this.dados.id;
  }

  paraDados(): DadosRestaurante {
    return { ...this.dados };
  }
}
