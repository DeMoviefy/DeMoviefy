import { api } from "src/core/services/api";

export type RegisterUserInput = {
  nome: string;
  email: string;
  senha: string;
};

export type RegisteredUser = {
  id: number;
  nome: string;
  email: string;
};

export class UserService {
  static async register(input: RegisterUserInput): Promise<RegisteredUser> {
    const { data } = await api.post<RegisteredUser>("/users", input);
    return data;
  }
}