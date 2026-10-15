import { Router } from 'express';
import { adaptar, corpo } from '../../../../shared/http/adaptar';
import { CriarPedido } from './criar-pedido';

export function registrarCriarPedido(router: Router, casoDeUso: CriarPedido): void {
  router.post(
    '/pedidos',
    adaptar(async (req, res) => {
      res.status(201).json(await casoDeUso.executar(corpo(req)));
    }),
  );
}
