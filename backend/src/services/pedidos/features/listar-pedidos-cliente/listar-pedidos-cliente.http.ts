import { Router } from 'express';
import { adaptar } from '../../../../shared/http/adaptar';
import { ListarPedidosCliente } from './listar-pedidos-cliente';

export function registrarListarPedidosCliente(router: Router, casoDeUso: ListarPedidosCliente): void {
  router.get(
    '/clientes/:id/pedidos',
    adaptar(async (req, res) => {
      res.json(await casoDeUso.executar(req.params.id));
    }),
  );
}
