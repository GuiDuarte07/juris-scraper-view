import { BaseService } from "./base.service";
import type { BatchStatusDTO, BatchWithStatusDTO } from "./eproc.service";

export interface Process {
  id: number;
  batchId: number;
  comarca: string;
  foro: string;
  vara: string;
  classe: string;
  processo: string;
  valor?: number;
  requerido?: string;
  contato: string;
  contatoRealizado: boolean;
  observacoes: string;
  processed: boolean;
  errorCount: number;
  lastError: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessListResponse {
  items: Process[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProcessListParams {
  processed?: boolean;
  batchId?: number;
  page?: number;
  limit?: number;
  // Explicit sort fields to align with grid
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UpdateContactData {
  contato?: string;
  contatoRealizado?: boolean;
  observacoes?: string;
}

export class ProcessService extends BaseService {
  constructor() {
    super("/process");
  }

  /**
   * Listar processos com paginação, filtros e ordenação
   * GET /process
   */
  async listProcesses(
    params?: ProcessListParams
  ): Promise<ProcessListResponse> {
    console.log(params);
    return this.get<ProcessListResponse>("", params);
  }

  /**
   * Atualizar informações de contato de um processo
   * PATCH /process/{processId}/contact
   */
  async updateProcessContact(
    processId: number,
    data: UpdateContactData
  ): Promise<Process> {
    return this.patch<Process>(`/${processId}/contact`, data);
  }

  /**
   * Deletar um processo por ID
   * DELETE /process/{processId}
   */
  async deleteProcess(processId: number): Promise<void> {
    return this.delete<void>(`/${processId}`);
  }

  /**
   * Retorna status do lote por ID
   * GET /process/batch/{batchId}
   */
  async getBatchStatus(
    batchId: number,
    system?: string
  ): Promise<BatchStatusDTO> {
    const params = system ? { system } : undefined;
    return this.get<BatchStatusDTO>(`/batch/${batchId}`, params);
  }

  /**
   * Deleta todos os processos de um lote
   * DELETE /process/batch/{batchId}
   */
  async deleteBatch(batchId: number, system?: string): Promise<void> {
    const params = system ? { system } : undefined;
    return this.delete<void>(
      `/batch/${batchId}?${new URLSearchParams(params as any).toString()}`
    );
  }

  /**
   * Lista lotes em processamento
   * GET /process/batch
   */
  async listProcessingBatches(): Promise<BatchWithStatusDTO[]> {
    return this.get<BatchWithStatusDTO[]>("/batch");
  }

  /**
   * Exportar processos de um lote para Excel
   * GET /process/export/batch/{batchId}
   */
  async exportBatchToExcel(batchId: number): Promise<Blob> {
    return this.downloadFile(`/export/batch/${batchId}`);
  }
}

// Singleton instance
export const processService = new ProcessService();
