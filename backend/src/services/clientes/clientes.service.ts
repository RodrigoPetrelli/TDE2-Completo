import { Router } from 'express';
import { DependenciasPlataforma } from '../../shared/application/portas';
import { registrarCadastrarCliente } from './features/cadastrar-cliente/cadastrar-cliente.http';
import { CadastrarCliente } from './features/cadastrar-cliente/cadastrar-cliente';
import { registrarObterCliente } from './features/obter-cliente/obter-cliente.http';
import { ObterCliente } from './features/obter-cliente/obter-cliente';
import { ClienteRepositorioMemoria } from './infrastructure/repositorio-memoria';

/** Composition root do microsserviço de Clientes. */
export function criarServicoClientes(plataforma: DependenciasPlataforma): { router: Router } {
  const clientes = new ClienteRepositorioMemoria();

  const router = Router();
  registrarCadastrarCliente(router, new CadastrarCliente({ ...plataforma, clientes }));
  registrarObterCliente(router, new ObterCliente({ clientes }));
  return { router };
}
