import { api } from "src/core/services/api";

export type RegisterUserInput = {
  nome: string;
  email: string;
  senha: string;
  senha_confirmada: string;
};

export type RegisteredUser = {
  id: number;
  nome: string;
  email: string;
};

export type LoginInput = {
  email: string;
  senha: string;
};

export type Logadao = {
  email: string;
  senha: string;
};

export class UserService {
  static async register(input: RegisterUserInput): Promise<RegisteredUser> {
    const { data } = await api.post<RegisteredUser>("/users", input);
    return data;
  }
  static async login(input:LoginInput): Promise<Logadao> {
    const { data } = await api.post<Logadao>("/users/login", input);
    return data;
  };
}