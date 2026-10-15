import { Router } from 'express';
import { adaptar, corpo } from '../../../../shared/http/adaptar';
import { CadastrarCliente } from './cadastrar-cliente';

export function registrarCadastrarCliente(router: Router, casoDeUso: CadastrarCliente): void {
  router.post(
    '/clientes',
    adaptar(async (req, res) => {
      res.status(201).json(await casoDeUso.executar(corpo(req)));
    }),
  );
}
