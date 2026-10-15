import { ErroValidacao } from './erros';

export function textoObrigatorio(valor: unknown, campo: string): string {
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw new ErroValidacao(`O campo "${campo}" é obrigatório`);
  }
  return valor.trim();
}

export function inteiroPositivo(valor: unknown, mensagem: string): number {
  if (typeof valor !== 'number' || !Number.isInteger(valor) || valor <= 0) {
    throw new ErroValidacao(mensagem);
  }
  return valor;
}
