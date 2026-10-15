import { Router } from 'express';
import { DependenciasPlataforma } from '../../shared/application/portas';
import { registrarCadastrarProduto } from './features/cadastrar-produto/cadastrar-produto.http';
import { CadastrarProduto } from './features/cadastrar-produto/cadastrar-produto';
import { registrarCriarRestaurante } from './features/criar-restaurante/criar-restaurante.http';
import { CriarRestaurante } from './features/criar-restaurante/criar-restaurante';
import { registrarListarCardapio } from './features/listar-cardapio/listar-cardapio.http';
import { ListarCardapio } from './features/listar-cardapio/listar-cardapio';
import { registrarListarRestaurantes } from './features/listar-restaurantes/listar-restaurantes.http';
import { ListarRestaurantes } from './features/listar-restaurantes/listar-restaurantes';
import { registrarObterRestaurante } from './features/obter-restaurante/obter-restaurante.http';
import { ObterRestaurante } from './features/obter-restaurante/obter-restaurante';
import { ProdutoRepositorioMemoria, RestauranteRepositorioMemoria } from './infrastructure/repositorios-memoria';

/** Composition root do microsserviço de Catálogo. */
export function criarServicoCatalogo(plataforma: DependenciasPlataforma): { router: Router } {
  // Database per Service: instâncias exclusivas deste serviço.
  const restaurantes = new RestauranteRepositorioMemoria();
  const produtos = new ProdutoRepositorioMemoria();

  const router = Router();
  registrarCriarRestaurante(router, new CriarRestaurante({ ...plataforma, restaurantes }));
  registrarListarRestaurantes(router, new ListarRestaurantes({ restaurantes }));
  registrarObterRestaurante(router, new ObterRestaurante({ restaurantes }));
  registrarCadastrarProduto(router, new CadastrarProduto({ ...plataforma, restaurantes, produtos }));
  registrarListarCardapio(router, new ListarCardapio({ restaurantes, produtos }));
  return { router };
}
