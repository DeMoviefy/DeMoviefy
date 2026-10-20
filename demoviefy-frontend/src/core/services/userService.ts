import { api } from "src/core/services/api";

export type RegisterUserInput = {
  nome: string;
  email: string;
  senha: string;
  senha_confirmada: string;
  recaptcha_token: string;
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

export type AuthenticatedUser = {
  id: number;
  nome: string;
  email: string;
};

export type LoginResponse = {
  message: string;
  user: AuthenticatedUser;
};

export type SessionStatus = {
  is_guest: boolean;
  user: AuthenticatedUser | null;
  guest_video_count: number;
  guest_video_limit: number;
};

export class UserService {
  static async register(input: RegisterUserInput): Promise<RegisteredUser> {
    const { data } = await api.post<RegisteredUser>("/users", input);
    return data;
  }
  static async login(input: LoginInput): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/users/login", input);
    return data;
  }

  static async logout(): Promise<void> {
    await api.post("/users/logout");
  }

  static async getSessionStatus(): Promise<SessionStatus> {
    const { data } = await api.get<SessionStatus>("/users/session");
    return data;
  }
}