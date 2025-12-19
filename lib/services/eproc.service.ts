import { BaseService } from "./base.service";

export interface LawsuitData {
  requerido?: string;
  valor?: number;
}

export interface LawsuitUrl {
  url: string;
}

export interface ImportPdfResponse {
  batchId: number;
  message: string;
}
export interface BatchStatusDTO {
  id: number;
  batchId: number;
  totalProcesses: number;
  processedProcesses: number;
  processedCount: number;
  pendingProcesses: number;
  errorProcesses: number;
  percentComplete: number;
  progress: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchWithStatusDTO {
  id: number;
  system: string;
  state: string;
  processDate: Date;
  description: string;
  processed: boolean;
  status?: BatchStatusDTO;
}

export class EprocService extends BaseService {
  constructor() {
    super("/eproc");
  }

  /**
   * Buscar dados do processo no EPROC
   * GET /eproc/lawsuit/{number}
   */
  async getLawsuitData(number: string): Promise<LawsuitData> {
    return this.get<LawsuitData>(`/lawsuit/${number}`);
  }

  /**
   * Retorna URL de acesso ao processo no EPROC
   * GET /eproc/lawsuit-url/{number}
   */
  async getLawsuitUrl(number: string): Promise<LawsuitUrl> {
    return this.get<LawsuitUrl>(`/lawsuit-url/${number}`);
  }

  /**
   * Definir PHPSESSID para sessões do EPROC
   * POST /eproc/set-session
   */
  async setSession(serviceName: string, sessionId: string): Promise<void> {
    return this.post<void>("/set-session", {
      service_name: serviceName,
      session_id: sessionId,
    });
  }

  /**
   * Importar PDF de lista processo do EPROC
   * POST /eproc/import-pdf
   */
  async importPdf(file: File, state: string): Promise<ImportPdfResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("state", state);

    return this.post<ImportPdfResponse>("/import-pdf", formData, true);
  }

  /**
   * Retorna o status de processamento do lote
   * GET /eproc/batch/{batchId}
   */
  async getBatchStatus(batchId: number): Promise<BatchStatusDTO> {
    return this.get<BatchStatusDTO>(`/batch/${batchId}`);
  }

  /**
   * Deletar todos os processos de um lote específico
   * DELETE /eproc/batch/{batchId}
   */
  async deleteBatch(batchId: number): Promise<void> {
    return this.delete<void>(`/batch/${batchId}`);
  }

  /**
   * Lista todos os lotes de processos em processamento
   * GET /eproc/batch
   */
  async listProcessingBatches(): Promise<BatchWithStatusDTO[]> {
    return this.get<BatchWithStatusDTO[]>("/batch");
  }

  /**
   * Exportar processos de um lote para Excel
   * GET /eproc/export/batch/{batchId}
   */
  async exportBatchToExcel(batchId: number): Promise<Blob> {
    return this.downloadFile(`/export/batch/${batchId}`);
  }
}

// Singleton instance
export const eprocService = new EprocService();
