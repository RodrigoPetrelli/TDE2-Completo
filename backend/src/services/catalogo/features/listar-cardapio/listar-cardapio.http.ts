import { Router } from 'express';
import { adaptar } from '../../../../shared/http/adaptar';
import { ListarCardapio } from './listar-cardapio';

export function registrarListarCardapio(router: Router, casoDeUso: ListarCardapio): void {
  router.get(
    '/restaurantes/:id/produtos',
    adaptar(async (req, res) => {
      res.json(await casoDeUso.executar(req.params.id));
    }),
  );
}
