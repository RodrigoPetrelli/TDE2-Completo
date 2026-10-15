import { Router } from 'express';
import { adaptar } from '../../../../shared/http/adaptar';
import { ListarRestaurantes } from './listar-restaurantes';

export function registrarListarRestaurantes(router: Router, casoDeUso: ListarRestaurantes): void {
  router.get(
    '/restaurantes',
    adaptar(async (_req, res) => {
      res.json(await casoDeUso.executar());
    }),
  );
}
