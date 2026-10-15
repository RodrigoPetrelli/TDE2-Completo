import { Router } from 'express';
import { adaptar } from '../../../../shared/http/adaptar';
import { ConfirmarPedido } from './confirmar-pedido';

export function registrarConfirmarPedido(router: Router, casoDeUso: ConfirmarPedido): void {
  router.patch(
    '/pedidos/:id/confirmar',
    adaptar(async (req, res) => {
      res.json(await casoDeUso.executar(req.params.id));
    }),
  );
}
