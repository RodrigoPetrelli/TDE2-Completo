import { Produto } from '../domain/produto';
import { Restaurante } from '../domain/restaurante';

// Banco do serviço de Catálogo (Database per Service): só este serviço acessa.

export interface RestauranteRepositorio {
  salvar(restaurante: Restaurante): Promise<void>;
  obter(id: string): Promise<Restaurante | undefined>;
  listar(): Promise<Restaurante[]>;
}

export interface ProdutoRepositorio {
  salvar(produto: Produto): Promise<void>;
  listarPorRestaurante(restauranteId: string): Promise<Produto[]>;
}
