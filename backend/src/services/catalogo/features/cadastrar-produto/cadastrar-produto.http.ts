import { Router } from 'express';
import { adaptar, corpo } from '../../../../shared/http/adaptar';
import { CadastrarProduto } from './cadastrar-produto';

export function registrarCadastrarProduto(router: Router, casoDeUso: CadastrarProduto): void {
  router.post(
    '/restaurantes/:id/produtos',
    adaptar(async (req, res) => {
      res.status(201).json(await casoDeUso.executar({ ...corpo(req), restauranteId: req.params.id }));
    }),
  );
}
