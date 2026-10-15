import { Router } from 'express';
import { adaptar } from '../../../../shared/http/adaptar';
import { CancelarPedido } from './cancelar-pedido';

export function registrarCancelarPedido(router: Router, casoDeUso: CancelarPedido): void {
  router.patch(
    '/pedidos/:id/cancelar',
    adaptar(async (req, res) => {
      res.json(await casoDeUso.executar(req.params.id));
    }),
  );
}
