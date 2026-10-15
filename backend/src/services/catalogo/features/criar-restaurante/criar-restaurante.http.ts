import { Router } from 'express';
import { adaptar, corpo } from '../../../../shared/http/adaptar';
import { CriarRestaurante } from './criar-restaurante';

export function registrarCriarRestaurante(router: Router, casoDeUso: CriarRestaurante): void {
  router.post(
    '/restaurantes',
    adaptar(async (req, res) => {
      res.status(201).json(await casoDeUso.executar(corpo(req)));
    }),
  );
}
