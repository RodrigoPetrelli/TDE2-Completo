import { Pedido } from '../domain/pedido';
import { ProdutoOfertado } from '../domain/produto-ofertado';

// Banco do serviço de Pedidos (Database per Service). Além dos pedidos, guarda
// réplicas locais (read models) de restaurantes, produtos e clientes, alimentadas
// pelos eventos de integração — nunca consulta o banco de outro serviço.

export interface PedidoRepositorio {
  salvar(pedido: Pedido): Promise<void>;
  obter(id: string): Promise<Pedido | undefined>;
  listarPorCliente(clienteId: string): Promise<Pedido[]>;
}

export interface RestauranteLocal {
  id: string;
  nome: string;
}

export interface CatalogoLocalRepositorio {
  salvarRestaurante(restaurante: RestauranteLocal): Promise<void>;
  obterRestaurante(id: string): Promise<RestauranteLocal | undefined>;
  salvarProduto(produto: ProdutoOfertado): Promise<void>;
  obterProduto(id: string): Promise<ProdutoOfertado | undefined>;
}

export interface ClienteLocal {
  id: string;
  nome: string;
}

export interface ClientesLocalRepositorio {
  salvar(cliente: ClienteLocal): Promise<void>;
  existe(id: string): Promise<boolean>;
}
