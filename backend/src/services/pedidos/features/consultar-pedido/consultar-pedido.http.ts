import { Router } from 'express';
import { adaptar } from '../../../../shared/http/adaptar';
import { ConsultarPedido } from './consultar-pedido';

export function registrarConsultarPedido(router: Router, casoDeUso: ConsultarPedido): void {
  router.get(
    '/pedidos/:id',
    adaptar(async (req, res) => {
      res.json(await casoDeUso.executar(req.params.id));
    }),
  );
}
