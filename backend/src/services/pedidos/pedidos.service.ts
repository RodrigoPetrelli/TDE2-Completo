import { Router } from 'express';
import { DependenciasPlataforma } from '../../shared/application/portas';
import { registrarCancelarPedido } from './features/cancelar-pedido/cancelar-pedido.http';
import { CancelarPedido } from './features/cancelar-pedido/cancelar-pedido';
import { registrarConfirmarPedido } from './features/confirmar-pedido/confirmar-pedido.http';
import { ConfirmarPedido } from './features/confirmar-pedido/confirmar-pedido';
import { registrarConsultarPedido } from './features/consultar-pedido/consultar-pedido.http';
import { ConsultarPedido } from './features/consultar-pedido/consultar-pedido';
import { registrarCriarPedido } from './features/criar-pedido/criar-pedido.http';
import { CriarPedido } from './features/criar-pedido/criar-pedido';
import { registrarListarPedidosCliente } from './features/listar-pedidos-cliente/listar-pedidos-cliente.http';
import { ListarPedidosCliente } from './features/listar-pedidos-cliente/listar-pedidos-cliente';
import { ReplicarCatalogo } from './features/replicar-catalogo/replicar-catalogo';
import { ReplicarClientes } from './features/replicar-clientes/replicar-clientes';
import {
  CatalogoLocalRepositorioMemoria,
  ClientesLocalRepositorioMemoria,
  PedidoRepositorioMemoria,
} from './infrastructure/repositorios-memoria';

/** Composition root do microsserviço de Pedidos. */
export function criarServicoPedidos(plataforma: DependenciasPlataforma): { router: Router } {
  const pedidos = new PedidoRepositorioMemoria();
  const catalogo = new CatalogoLocalRepositorioMemoria();
  const clientes = new ClientesLocalRepositorioMemoria();

  // Assinaturas de eventos (EDA): réplicas locais dos dados de outros serviços
  const replicarCatalogo = new ReplicarCatalogo({ catalogo });
  const replicarClientes = new ReplicarClientes({ clientes });
  plataforma.eventos.assinar('catalogo.RestauranteCriado', (e) => replicarCatalogo.aoCriarRestaurante(e));
  plataforma.eventos.assinar('catalogo.ProdutoCadastrado', (e) => replicarCatalogo.aoCadastrarProduto(e));
  plataforma.eventos.assinar('clientes.ClienteCadastrado', (e) => replicarClientes.aoCadastrarCliente(e));

  const router = Router();
  registrarCriarPedido(router, new CriarPedido({ ...plataforma, pedidos, catalogo, clientes }));
  registrarConsultarPedido(router, new ConsultarPedido({ pedidos }));
  registrarConfirmarPedido(router, new ConfirmarPedido({ ...plataforma, pedidos }));
  registrarCancelarPedido(router, new CancelarPedido({ ...plataforma, pedidos }));
  registrarListarPedidosCliente(router, new ListarPedidosCliente({ pedidos, clientes }));
  return { router };
}
