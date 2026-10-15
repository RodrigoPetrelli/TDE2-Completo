import { Request, RequestHandler, Response } from 'express';

/** Encaminha erros de handlers assíncronos para o tratador de erros do Express. */
export function adaptar(fn: (req: Request, res: Response) => Promise<void>): RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}

/** Corpo da requisição como objeto (nunca nulo), para os casos de uso validarem. */
export function corpo(req: Request): Record<string, unknown> {
  const body: unknown = req.body;
  return typeof body === 'object' && body !== null && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
}
