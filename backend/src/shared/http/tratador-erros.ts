import { NextFunction, Request, Response } from 'express';
import { ErroDominio, TipoErroDominio } from '../domain/erros';

const STATUS_POR_TIPO: Record<TipoErroDominio, number> = {
  VALIDACAO: 400,
  NAO_ENCONTRADO: 404,
  REGRA_NEGOCIO: 422,
};

export function tratadorErros(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ErroDominio) {
    res.status(STATUS_POR_TIPO[err.tipo]).json({ erro: err.message });
    return;
  }
  // JSON malformado no corpo da requisição
  if (err instanceof SyntaxError) {
    res.status(400).json({ erro: 'JSON inválido no corpo da requisição' });
    return;
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
}
