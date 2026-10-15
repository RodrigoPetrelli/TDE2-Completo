import { ErroValidacao } from '../../../shared/domain/erros';
import { inteiroPositivo, textoObrigatorio } from '../../../shared/domain/validacoes';

export interface DadosProduto {
  id: string;
  restauranteId: string;
  nome: string;
  precoCentavos: number;
  disponivel: boolean;
  criadoEm: string;
}

export class Produto {
  private constructor(private readonly dados: DadosProduto) {}

  static criar(p: {
    id: string;
    restauranteId: string;
    nome: unknown;
    precoCentavos: unknown;
    disponivel: unknown;
    criadoEm: string;
  }): Produto {
    const nome = textoObrigatorio(p.nome, 'nome');
    const precoCentavos = inteiroPositivo(p.precoCentavos, 'O campo "precoCentavos" deve ser um inteiro maior que zero');
    if (p.disponivel !== undefined && typeof p.disponivel !== 'boolean') {
      throw new ErroValidacao('O campo "disponivel" deve ser booleano');
    }
    return new Produto({
      id: p.id,
      restauranteId: p.restauranteId,
      nome,
      precoCentavos,
      disponivel: p.disponivel ?? true,
      criadoEm: p.criadoEm,
    });
  }

  static restaurar(dados: DadosProduto): Produto {
    return new Produto({ ...dados });
  }

  paraDados(): DadosProduto {
    return { ...this.dados };
  }
}
