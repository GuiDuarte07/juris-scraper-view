const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function handleUnauthorizedResponse(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("user");
    } catch {}

    // Tenta limpar cookie no backend (não obrigatório) e ignora falhas
    try {
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
    } catch {}

    // Força redirecionamento para login
    try {
      window.location.href = "/login";
    } catch {}
  }
}

export class BaseService {
  protected baseUrl: string;

  constructor(path: string) {
    this.baseUrl = `${API_BASE_URL}${path}`;
  }

  protected async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      credentials: "include", // Envia cookies automaticamente
    });
    if (response.status === 401 || response.status === 403) {
      handleUnauthorizedResponse();
      throw new Error(`HTTP ${response.status}: Unauthorized`);
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  protected async post<T>(
    endpoint: string,
    body?: any,
    isFormData = false
  ): Promise<T> {
    const headers: HeadersInit = isFormData
      ? {}
      : { "Content-Type": "application/json" };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: isFormData ? body : JSON.stringify(body),
      credentials: "include", // Envia cookies automaticamente
    });

    if (response.status === 401 || response.status === 403) {
      handleUnauthorizedResponse();
      throw new Error(`HTTP ${response.status}: Unauthorized`);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  protected async patch<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include", // Envia cookies automaticamente
    });

    if (response.status === 401 || response.status === 403) {
      handleUnauthorizedResponse();
      throw new Error(`HTTP ${response.status}: Unauthorized`);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  protected async delete<T = void>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      credentials: "include", // Envia cookies automaticamente
    });

    if (response.status === 401 || response.status === 403) {
      handleUnauthorizedResponse();
      throw new Error(`HTTP ${response.status}: Unauthorized`);
    }

    if (!response.ok && response.status !== 204) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  protected async downloadFile(endpoint: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      credentials: "include", // Envia cookies automaticamente
    });

    if (response.status === 401 || response.status === 403) {
      handleUnauthorizedResponse();
      throw new Error(`HTTP ${response.status}: Unauthorized`);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.blob();
  }
}
