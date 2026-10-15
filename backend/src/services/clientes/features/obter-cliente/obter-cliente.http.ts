import { Router } from 'express';
import { adaptar } from '../../../../shared/http/adaptar';
import { ObterCliente } from './obter-cliente';

export function registrarObterCliente(router: Router, casoDeUso: ObterCliente): void {
  router.get(
    '/clientes/:id',
    adaptar(async (req, res) => {
      res.json(await casoDeUso.executar(req.params.id));
    }),
  );
}
