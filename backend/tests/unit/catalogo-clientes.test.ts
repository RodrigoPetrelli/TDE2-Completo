import { ErroValidacao } from '../../src/shared/domain/erros';
import { Produto } from '../../src/services/catalogo/domain/produto';
import { Restaurante } from '../../src/services/catalogo/domain/restaurante';
import { Cliente } from '../../src/services/clientes/domain/cliente';

const criadoEm = '2026-10-15T12:00:00.000Z';

describe('Catálogo (domínio)', () => {
  it('normaliza nome e categoria do restaurante', () => {
    expect(Restaurante.criar({ id: 'r', nome: '  Cantina ', categoria: ' Italiana ', criadoEm }).paraDados()).toMatchObject({
      nome: 'Cantina',
      categoria: 'Italiana',
    });
  });

  it('exige preço inteiro positivo e assume disponível por padrão', () => {
    expect(() => Produto.criar({ id: 'p', restauranteId: 'r', nome: 'X', precoCentavos: 10.5, disponivel: true, criadoEm })).toThrow(ErroValidacao);
    expect(Produto.criar({ id: 'p', restauranteId: 'r', nome: 'X', precoCentavos: 100, disponivel: undefined, criadoEm }).paraDados().disponivel).toBe(true);
  });
});

describe('Clientes (domínio)', () => {
  it('normaliza o e-mail e rejeita formato inválido', () => {
    expect(Cliente.criar({ id: 'c', nome: 'Maria', email: ' Maria@Exemplo.com ', criadoEm }).email).toBe('maria@exemplo.com');
    expect(() => Cliente.criar({ id: 'c', nome: 'Maria', email: 'maria@', criadoEm })).toThrow('O campo "email" deve ser um e-mail válido');
  });
});
