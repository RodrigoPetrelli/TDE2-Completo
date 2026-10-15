import { Router } from 'express';
import { adaptar } from '../../../../shared/http/adaptar';
import { ObterRestaurante } from './obter-restaurante';

export function registrarObterRestaurante(router: Router, casoDeUso: ObterRestaurante): void {
  router.get(
    '/restaurantes/:id',
    adaptar(async (req, res) => {
      res.json(await casoDeUso.executar(req.params.id));
    }),
  );
}
