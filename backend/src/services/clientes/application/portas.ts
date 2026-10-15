import { Cliente } from '../domain/cliente';

// Banco do serviço de Clientes (Database per Service): só este serviço acessa.
export interface ClienteRepositorio {
  salvar(cliente: Cliente): Promise<void>;
  obter(id: string): Promise<Cliente | undefined>;
  existeComEmail(email: string): Promise<boolean>;
}
