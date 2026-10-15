import { Request, RequestHandler, Response } from 'express';
import { ErroServico } from './cliente-servicos';

/** Handler de BFF: repassa ao front o status/erro devolvido pelo serviço chamado. */
export function rotaBff(fn: (req: Request, res: Response) => Promise<void>): RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch((erro: unknown) => {
      if (erro instanceof ErroServico) {
        res.status(erro.status).json(erro.corpo);
        return;
      }
      next(erro);
    });
  };
}
