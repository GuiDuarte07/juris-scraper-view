import { BaseService } from "./base.service";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface CreateUserData {
  email: string;
  password: string;
  role?: UserRole;
}

export class AuthService extends BaseService {
  private currentUser: User | null = null;
  private isInitialized = false;

  constructor() {
    super("/auth");
  }

  /**
   * Login de usuário
   * POST /auth/login
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>("/login", {
      email,
      password,
    });

    console.log("Login response:", response);

    // Armazena usuário em memória e localStorage
    this.currentUser = response.user;
    this.isInitialized = true;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    // Token é salvo automaticamente via cookie pelo backend
    return response;
  }

  /**
   * Logout do usuário
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    await this.post<void>("/logout");
    this.currentUser = null;
    this.isInitialized = false;
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("user");
    }
  }

  /**
   * Criar novo usuário (apenas admin)
   * POST /auth/create-user
   */
  async createUser(data: CreateUserData): Promise<User> {
    return this.post<User>("/create-user", data);
  }

  /**
   * Retorna o usuário logado (do cache ou localStorage)
   */
  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }
    // Tenta recuperar do localStorage
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored);
          return this.currentUser;
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Verifica se há usuário autenticado
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Verifica se o usuário é admin
   */
  isAdmin(): boolean {
    return this.currentUser?.role === UserRole.ADMIN;
  }

  /**
   * Define o usuário atual (usado ao restaurar sessão)
   */
  setCurrentUser(user: User | null): void {
    this.currentUser = user;
    this.isInitialized = true;
    if (typeof localStorage !== "undefined") {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    }
  }

  /**
   * Recupera o usuário autenticado via cookie (se backend expõe /auth/me)
   * Falha silenciosamente para não bloquear navegação.
   */
  async fetchCurrentUser(): Promise<User | null> {
    try {
      const user = await this.get<User>("/me");
      this.setCurrentUser(user);
      return user;
    } catch (error) {
      console.warn(
        "fetchCurrentUser falhou (tudo bem se /me não existir):",
        error
      );
      return null;
    }
  }

  /**
   * Hidrata sessão usando cookie via /auth/me sem depender de document.cookie.
   * Retorna flag unauthorized para decidir redirects de forma segura.
   */
  async hydrateFromCookie(): Promise<{
    user: User | null;
    unauthorized: boolean;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        credentials: "include",
      });

      if (response.status === 401 || response.status === 403) {
        return { user: null, unauthorized: true };
      }

      if (!response.ok) {
        console.warn(
          "hydrateFromCookie falhou (ignorando)",
          response.status,
          response.statusText
        );
        return { user: null, unauthorized: false };
      }

      const user = (await response.json()) as User;
      this.setCurrentUser(user);
      return { user, unauthorized: false };
    } catch (error) {
      console.warn(
        "hydrateFromCookie falhou (erro de rede ou /me ausente)",
        error
      );
      return { user: null, unauthorized: false };
    }
  }

  /**
   * Verifica se o serviço foi inicializado
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
export const authService = new AuthService();
